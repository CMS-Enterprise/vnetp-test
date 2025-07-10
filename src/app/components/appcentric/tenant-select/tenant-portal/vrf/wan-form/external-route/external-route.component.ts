import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  ExternalRoute,
  V1NetworkScopeFormsWanFormService,
  V1RuntimeDataExternalRouteService,
  ExternalRouteJobCreateDtoTypeEnum,
  WanForm,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { RuntimeDataService } from 'src/app/services/runtime-data.service';

@Component({
  selector: 'app-external-route',
  templateUrl: './external-route.component.html',
  styleUrls: ['./external-route.component.css'],
})
export class ExternalRouteComponent implements OnInit {
  @Input() wanForm: WanForm;
  @Input() vrfId: string;
  @Output() back = new EventEmitter<void>();
  wanFormId: string;
  dcsMode: string;
  routes: ExternalRoute[];
  filteredRoutes: ExternalRoute[];
  private modalSubscription: Subscription;
  public ModalMode = ModalMode;
  searchQuery = '';
  isRefreshingRuntimeData = false;
  jobStatus: string;
  showComponent = false;
  refreshedNoData = false;

  constructor(
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private externalRouteService: V1RuntimeDataExternalRouteService,
    private ngx: NgxSmartModalService,
    private runtimeDataService: RuntimeDataService,
  ) {}

  ngOnInit(): void {
    this.getAllRoutes();
  }

  get sortedRoutes() {
    return this.filteredRoutes?.sort((a, b) => {
      const aHasWanForm = a.wanForms?.some(wanForm => wanForm?.id === this.wanForm.id);
      const bHasWanForm = b.wanForms?.some(wanForm => wanForm?.id === this.wanForm.id);

      if (aHasWanForm && !bHasWanForm) {
        return -1;
      }
      if (!aHasWanForm && bHasWanForm) {
        return 1;
      }

      if (a.protocol === 'manual' && b.protocol !== 'manual') {
        return -1;
      }
      if (a.protocol !== 'manual' && b.protocol === 'manual') {
        return 1;
      }

      return 0;
    });
  }

  addRouteToWanForm(route: ExternalRoute): void {
    this.wanFormService.addRouteToWanFormWanForm({ wanId: this.wanForm.id, routeId: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  removeRouteFromWanForm(route: ExternalRoute): void {
    this.wanFormService.removeRouteFromWanFormWanForm({ wanId: this.wanForm.id, routeId: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  getAllRoutes(): void {
    this.externalRouteService.getManyExternalRoute({ relations: ['wanForms'], limit: 50000 }).subscribe(data => {
      this.routes = data;
      this.filteredRoutes = data;
      if (data.length === 0) {
        this.refreshedNoData = true;
        return;
      }
      const routeWithRuntimeData = this.routes.find(route => route.runtimeDataLastRefreshed !== null) || null;

      this.showComponent =
        this.runtimeDataService.isRecentlyRefreshed(routeWithRuntimeData?.runtimeDataLastRefreshed, 600) || this.refreshedNoData;
    });
  }

  deleteRoute(route: ExternalRoute): void {
    this.externalRouteService.deleteOneExternalRoute({ id: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
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

  public onSearch(): void {
    if (!this.searchQuery) {
      this.filteredRoutes = this.routes;
      return;
    }
    this.filteredRoutes = this.routes.filter(
      route =>
        route.network.includes(this.searchQuery) ||
        route.vrf.includes(this.searchQuery) ||
        route.metric === Number(this.searchQuery) ||
        route.fromPrefixLength === Number(this.searchQuery) ||
        route.toPrefixLength === Number(this.searchQuery) ||
        route.protocol.includes(this.searchQuery) ||
        `${route.network}/${route.fromPrefixLength}`.includes(this.searchQuery),
    );
  }

  refreshRuntimeData(): void {
    if (this.isRecentlyRefreshed() || this.isRefreshingRuntimeData) {
      return;
    }

    this.isRefreshingRuntimeData = true;

    this.externalRouteService
      .createRuntimeDataJobExternalRoute({
        externalRouteJobCreateDto: {
          type: ExternalRouteJobCreateDtoTypeEnum.ExternalRoute,
        },
      })
      .subscribe(job => {
        let status = '';
        this.runtimeDataService.pollJobStatus(job.id).subscribe({
          next: towerJobDto => {
            status = towerJobDto.status;
          },
          error: () => {
            status = 'error';
            this.isRefreshingRuntimeData = false;
            this.jobStatus = status;
          },
          complete: () => {
            this.isRefreshingRuntimeData = false;
            if (status === 'successful') {
              this.getAllRoutes();
            }
            this.jobStatus = status;
          },
        });
      });
  }

  isRecentlyRefreshed(): boolean {
    return this.runtimeDataService.isRecentlyRefreshed(this.routes?.[0]?.runtimeDataLastRefreshed);
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
    return route.wanForms?.some(wanForm => wanForm?.id === this.wanFormId);
  }
}
