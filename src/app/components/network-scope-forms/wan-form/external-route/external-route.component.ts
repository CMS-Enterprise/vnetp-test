import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ExternalRoute,
  ExternalRouteJobCreateDtoTypeEnum,
  V1NetworkScopeFormsWanFormService,
  V1RuntimeDataExternalRouteService,
  WanForm,
} from '../../../../../../client';
import { Subscription } from 'rxjs';
import { ModalMode } from '../../../../models/other/modal-mode';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RuntimeDataService } from '../../../../services/runtime-data.service';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

@Component({
  selector: 'app-external-route',
  templateUrl: './external-route.component.html',
  styleUrl: './external-route.component.css',
})
export class ExternalRouteComponent implements OnInit {
  wanFormId: string;
  dcsMode: string;
  wanForm: WanForm;
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
    private route: ActivatedRoute,
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private externalRouteService: V1RuntimeDataExternalRouteService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private runtimeDataService: RuntimeDataService,
  ) {}

  ngOnInit(): void {
    this.wanFormId = this.route.snapshot.params.id;
    this.dcsMode = RouteDataUtil.getApplicationModeFromRoute(this.route);

    if (!this.dcsMode) {
      console.error('ExternalRouteComponent: Application mode could not be determined via RouteDataUtil.');
      // Fallback or error handling if necessary
    }

    this.getAllRoutes();
    if (!this.wanForm) {
      this.wanFormService.getOneWanForm({ id: this.wanFormId }).subscribe(data => {
        this.wanForm = data;
      });
    }
  }

  get sortedRoutes() {
    return this.filteredRoutes?.sort((a, b) => {
      const aHasWanForm = this.checkIfWanFormExists(a);
      const bHasWanForm = this.checkIfWanFormExists(b);

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

  navigateToWanForm(): void {
    const currentQueryParams = this.route.snapshot.queryParams;

    this.router.navigate([`/${this.dcsMode}/wan-form`], { queryParams: currentQueryParams });
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
