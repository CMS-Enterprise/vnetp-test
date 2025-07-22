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
} from '../../../../../client';

@Component({
  selector: 'app-external-route',
  templateUrl: './external-route.component.html',
  styleUrls: ['./external-route.component.css'],
})
export class ExternalRouteComponent implements OnInit, AfterViewInit {
  @Input() wanForm: WanForm;
  @Input() vrfId: string;
  wanFormId: string;
  dcsMode: string;
  assignedRoutesDataSource = new MatTableDataSource<ExternalRoute>();
  availableRoutesDataSource = new MatTableDataSource<ExternalRoute>();
  private modalSubscription: Subscription;
  public ModalMode = ModalMode;
  assignedRoutesSearchQuery = '';
  availableRoutesSearchQuery = '';
  isRefreshingRuntimeData = false;
  jobStatus: string;
  showComponent = false;
  refreshedNoData = false;

  @ViewChild('assignedRoutesSort') assignedRoutesSort: MatSort;
  @ViewChild('availableRoutesSort') availableRoutesSort: MatSort;

  constructor(
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private ngx: NgxSmartModalService,
    private runtimeDataService: RuntimeDataService,
    private globalExternalRouteService: V3GlobalExternalRoutesService,
  ) {}

  ngOnInit(): void {
    this.getAllRoutes();
  }

  ngAfterViewInit(): void {
    this.assignedRoutesDataSource.sort = this.assignedRoutesSort;
    this.availableRoutesDataSource.sort = this.availableRoutesSort;
  }

  addRouteToWanForm(route: ExternalRoute): void {

  }

  removeRouteFromWanForm(route: ExternalRoute): void {

  }

  getAllRoutes(): void {
    // this.externalRouteService.getManyExternalRoute({ relations: ['wanForms'], limit: 50000 }).subscribe(data => {
    //   this.assignedRoutesDataSource.data = data.filter(route => route.wanForms?.some(wanForm => wanForm?.id === this.wanForm.id));
    //   this.availableRoutesDataSource.data = data.filter(route => !route.wanForms?.some(wanForm => wanForm?.id === this.wanForm.id));

    //   if (data.length === 0) {
    //     this.refreshedNoData = true;
    //     return;
    //   }
    //   const routeWithRuntimeData = data.find(route => route.runtimeDataLastRefreshed !== null) || null;

    //   this.showComponent =
    //     this.runtimeDataService.isRecentlyRefreshed(routeWithRuntimeData?.runtimeDataLastRefreshed, 600) || this.refreshedNoData;
    // });
  }

  // getGlobalRoutes(): void {
  //   this.globalExternalRouteService.getManyExternalRoutes({environmentId: })

  deleteRoute(route: ExternalRoute): void {
    // this.externalRouteService.deleteOneExternalRoute({ id: route.id }).subscribe(() => {
    //   this.getAllRoutes();
    // });
  }

  public openModal(): void {
    this.subscribeToModal();
    this.ngx.setModalData({ wanFormId: this.wanFormId }, 'externalRouteModal');
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

  checkIfWanFormExists(route: ExternalRoute): boolean {
    // return route.wanForms?.some(wanForm => wanForm?.id === this.wanForm.id);
    return true;
  }
}
