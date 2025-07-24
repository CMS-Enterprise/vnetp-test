import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
  V2AppCentricVrfsService,
  Vrf,
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
  public availableVrfs: string[] = [];
  public selectedVrf = '';

  public parentVrf: Vrf;

  displayedColumns: string[] = ['network', 'externalVrf', 'lastSeen', 'protocol', 'metric', 'uptime', 'tag', 'actions'];

  @ViewChild('assignedRoutesSort') assignedRoutesSort: MatSort;
  @ViewChild('availableRoutesSort') availableRoutesSort: MatSort;
  @ViewChild('assignedRoutesPaginator') assignedRoutesPaginator: MatPaginator;
  @ViewChild('availableRoutesPaginator') availableRoutesPaginator: MatPaginator;

  constructor(
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private ngx: NgxSmartModalService,
    private runtimeDataService: RuntimeDataService,
    private globalExternalRouteService: V3GlobalExternalRoutesService,
    private externalRouteService: V1NetworkScopeFormsExternalRoutesService,
    private vrfService: V2AppCentricVrfsService,
  ) {}

  ngOnInit(): void {
    this.vrfService.getOneVrf({ id: this.vrfId }).subscribe(vrf => {
      this.parentVrf = vrf;
      this.getAllRoutes();
    });
  }

  ngAfterViewInit(): void {
    this.assignedRoutesDataSource.sort = this.assignedRoutesSort;
    this.assignedRoutesDataSource.paginator = this.assignedRoutesPaginator;
    this.availableRoutesDataSource.sort = this.availableRoutesSort;
    this.availableRoutesDataSource.paginator = this.availableRoutesPaginator;
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
    const availableExternalVrfs = this.parentVrf.externalVrfs.join(',');
    this.globalExternalRouteService
      .getManyExternalRoutes({ environmentId: this.environmentId, limit: 50000, filter: [`externalVrf||in||${availableExternalVrfs}`] })
      .subscribe(globalData => {
        this.allGlobalRoutes = globalData as unknown as GlobalExternalRoute[];
        this.availableVrfs = [...new Set(this.allGlobalRoutes.map(route => route.externalVrf))].sort();
        this.availableVrfs = this.availableVrfs.filter(vrf => this.parentVrf.externalVrfs.some(parentVrf => parentVrf === vrf));
        this.externalRouteService.getManyExternalRoute({ filter: [`wanFormId||eq||${this.wanForm.id}`], limit: 50000 }).subscribe(data => {
          const localRoutes = data as unknown as ExternalRouteWithGlobalRoute[];
          localRoutes.forEach(route => {
            route.globalExternalRoute = this.allGlobalRoutes.find(globalRoute => globalRoute.id === route.globalExternalRouteId);
          });
          this.assignedRoutesDataSource.data = localRoutes;
          this.updateAvailableRoutes();
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

  updateAvailableRoutes(): void {
    if (!this.allGlobalRoutes) {
      this.availableRoutesDataSource.data = [];
      return;
    }

    const assignedRouteIds = new Set(this.assignedRoutesDataSource.data.map(r => r.globalExternalRouteId));

    let filteredRoutes = this.allGlobalRoutes.filter(route => !assignedRouteIds.has(route.id));

    if (this.selectedVrf) {
      filteredRoutes = filteredRoutes.filter(route => route.externalVrf === this.selectedVrf);
    } else {
      // If no VRF is selected, the table should be empty to force a selection.
      filteredRoutes = [];
    }
    this.availableRoutesDataSource.data = filteredRoutes;

    if (this.availableRoutesDataSource.paginator) {
      this.availableRoutesDataSource.paginator.firstPage();
    }
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
