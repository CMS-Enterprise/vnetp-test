import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { RuntimeDataService } from 'src/app/services/runtime-data.service';
import {
  WanForm,
  ExternalRoute,
  V1NetworkScopeFormsWanFormService,
  V3GlobalExternalRoutesService,
  GlobalExternalRoute,
  V1NetworkScopeFormsExternalRoutesService,
} from '../../../../../client';

interface ExternalRouteWithGlobalRoute extends ExternalRoute {
  globalExternalRoute: GlobalExternalRoute;
}

@Component({
  selector: 'app-external-route',
  templateUrl: './external-route.component.html',
  styleUrls: ['./external-route.component.css'],
})
export class ExternalRouteComponent implements OnInit, AfterViewInit {
  @Input() wanForm: WanForm;
  @Input() vrfId: string;
  @Input() environmentId: string;
  dcsMode: string;
  assignedRoutesDataSource = new MatTableDataSource<ExternalRouteWithGlobalRoute>();
  availableRoutesDataSource = new MatTableDataSource<GlobalExternalRoute>();
  private modalSubscription: Subscription;
  public ModalMode = ModalMode;
  assignedRoutesSearchQuery = '';
  availableRoutesSearchQuery = '';
  isRefreshingRuntimeData = false;
  jobStatus: string;
  showComponent = false;
  refreshedNoData = false;

  public allGlobalRoutes: GlobalExternalRoute[];

  @ViewChild('assignedRoutesSort') assignedRoutesSort: MatSort;
  @ViewChild('availableRoutesSort') availableRoutesSort: MatSort;

  constructor(
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private ngx: NgxSmartModalService,
    private runtimeDataService: RuntimeDataService,
    private globalExternalRouteService: V3GlobalExternalRoutesService,
    private externalRouteService: V1NetworkScopeFormsExternalRoutesService,
  ) {}

  ngOnInit(): void {
    this.getAllRoutes();
  }

  ngAfterViewInit(): void {
    this.assignedRoutesDataSource.sort = this.assignedRoutesSort;
    this.availableRoutesDataSource.sort = this.availableRoutesSort;
  }

  addRouteToWanForm(route: GlobalExternalRoute): void {
    this.externalRouteService
      .createOneExternalRoute({
        externalRoute: {
          wanFormId: this.wanForm.id,
          globalExternalRouteId: route.id,
        } as any,
      })
      .subscribe(() => {
        this.getAllRoutes();
      });
  }

  removeRouteFromWanForm(route: ExternalRoute): void {
    this.deleteRoute(route);
  }

  getAllRoutes(): void {
    this.globalExternalRouteService.getManyExternalRoutes({ environmentId: this.environmentId }).subscribe(globalData => {
      this.allGlobalRoutes = globalData as unknown as GlobalExternalRoute[];
      this.externalRouteService.getManyExternalRoute({ filter: [`wanFormId||eq||${this.wanForm.id}`] }).subscribe(data => {
        const localRoutes = data as unknown as ExternalRouteWithGlobalRoute[];
        localRoutes.forEach(route => {
          route.globalExternalRoute = this.allGlobalRoutes.find(globalRoute => globalRoute.id === route.globalExternalRouteId);
        });
        this.assignedRoutesDataSource.data = localRoutes;
        this.availableRoutesDataSource.data = this.allGlobalRoutes.filter(
          route => !localRoutes.some(localRoute => localRoute.globalExternalRouteId === route.id),
        );
      });
    });
  }

  deleteRoute(route: ExternalRoute): void {
    if (route.deletedAt) {
      this.externalRouteService.deleteOneExternalRoute({ id: route.id }).subscribe(() => {
        this.getAllRoutes();
      });
    } else {
      this.externalRouteService.softDeleteOneExternalRoute({ id: route.id }).subscribe(() => {
        this.getAllRoutes();
      });
    }
  }

  public restoreRoute(route: ExternalRoute): void {
    this.externalRouteService.restoreOneExternalRoute({ id: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  public openModal(): void {
    this.subscribeToModal();
    this.ngx.setModalData({ wanFormId: this.wanForm.id }, 'externalRouteModal');
    this.ngx.getModal('externalRouteModal').open();
  }

  private subscribeToModal(): void {
    this.modalSubscription = this.ngx.getModal('externalRouteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('externalRouteModal');
      this.modalSubscription.unsubscribe();

      this.getAllRoutes();
    });
  }

  public onAssignedRoutesSearch(): void {
    this.assignedRoutesDataSource.filter = this.assignedRoutesSearchQuery.trim().toLowerCase();
  }

  public onAvailableRoutesSearch(): void {
    this.availableRoutesDataSource.filter = this.availableRoutesSearchQuery.trim().toLowerCase();
  }

  refreshRuntimeData(): void {
    // if (this.isRecentlyRefreshed() || this.isRefreshingRuntimeData) {
    //   return;
    // }
    // this.isRefreshingRuntimeData = true;
    // this.externalRouteService
    //   .createRuntimeDataJobExternalRoute({
    //     externalRouteJobCreateDto: {
    //       type: ExternalRouteJobCreateDtoTypeEnum.ExternalRoute,
    //     },
    //   })
    //   .subscribe(job => {
    //     let status = '';
    //     this.runtimeDataService.pollJobStatus(job.id).subscribe({
    //       next: towerJobDto => {
    //         status = towerJobDto.status;
    //       },
    //       error: () => {
    //         status = 'error';
    //         this.isRefreshingRuntimeData = false;
    //         this.jobStatus = status;
    //       },
    //       complete: () => {
    //         this.isRefreshingRuntimeData = false;
    //         if (status === 'successful') {
    //           this.getAllRoutes();
    //         }
    //         this.jobStatus = status;
    //       },
    //     });
    //   });
  }

  isRecentlyRefreshed(): boolean {
    // return this.runtimeDataService.isRecentlyRefreshed(this.assignedRoutesDataSource.data?.[0]?.runtimeDataLastRefreshed);
    return false;
  }

  getTooltipMessage(status: string): string {
    switch (status) {
      case 'failed':
        return 'Job Status: Failed';
      case 'running':
        return 'Job Status: Timeout';
      case 'error':
        return 'An error occurred during polling';
      default:
        return status;
    }
  }
}
