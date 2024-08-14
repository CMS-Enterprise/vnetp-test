import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  RouteTable,
  RouteTableJobCreateDtoTypeEnum,
  V1NetworkScopeFormsWanFormService,
  V1RuntimeDataRouteTableService,
  WanForm,
} from '../../../../../../client';
import { Subscription } from 'rxjs';
import { ModalMode } from '../../../../models/other/modal-mode';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RuntimeDataService } from '../../../../services/runtime-data.service';

@Component({
  selector: 'app-route-table',
  templateUrl: './route-table.component.html',
  styleUrl: './route-table.component.css',
})
export class RouteTableComponent implements OnInit {
  wanFormId: string;
  dcsMode: string;
  wanForm: WanForm;
  routes: RouteTable[];
  filteredRoutes: RouteTable[];
  private modalSubscription: Subscription;
  public ModalMode = ModalMode;
  searchQuery = '';
  isRefreshingRuntimeData = false;
  jobStatus: string;
  showComponent = false;
  refreshed = false;

  constructor(
    private route: ActivatedRoute,
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private routeTableService: V1RuntimeDataRouteTableService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private runtimeDataService: RuntimeDataService,
  ) {}

  ngOnInit(): void {
    this.wanFormId = this.route.snapshot.params.id;
    this.dcsMode = this.route.snapshot.data.mode;
    this.getAllRoutes();
    if (!this.wanForm) {
      this.wanFormService.getOneWanForm({ id: this.wanFormId }).subscribe(data => {
        this.wanForm = data;
      });
    }
  }

  get sortedRoutes() {
    return this.filteredRoutes?.sort((a, b) => {
      if (a.wanForm && !b.wanForm) {
        return -1;
      }
      if (!a.wanForm && b.wanForm) {
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

  addRouteToWanForm(route: RouteTable): void {
    this.wanFormService.addRouteToWanFormWanForm({ wanId: this.wanForm.id, routeId: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  removeRouteFromWanForm(route: RouteTable): void {
    this.wanFormService.removeRouteFromWanFormWanForm({ wanId: this.wanForm.id, routeId: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  getAllRoutes(): void {
    this.routeTableService.getManyRouteTable({ relations: ['wanForm'], limit: 50000 }).subscribe(data => {
      this.routes = data;
      this.filteredRoutes = data;
      this.refreshed = true;
      this.showComponent = this.runtimeDataService.isRecentlyRefreshed(this.routes?.[0]?.runtimeDataLastRefreshed, 600) || this.refreshed;
    });
  }

  deleteRoute(route: RouteTable): void {
    this.routeTableService.deleteOneRouteTable({ id: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  public openModal(): void {
    this.subscribeToModal();
    this.ngx.setModalData({ wanFormId: this.wanFormId }, 'routeTableModal');
    this.ngx.getModal('routeTableModal').open();
  }

  private subscribeToModal(): void {
    this.modalSubscription = this.ngx.getModal('routeTableModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('routeTableModal');
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
        route.prefixLength === Number(this.searchQuery) ||
        route.protocol.includes(this.searchQuery) ||
        `${route.network}/${route.prefixLength}`.includes(this.searchQuery),
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

    this.routeTableService
      .createRuntimeDataJobRouteTable({
        routeTableJobCreateDto: {
          type: RouteTableJobCreateDtoTypeEnum.RouteTable,
          vrf: '',
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
}
