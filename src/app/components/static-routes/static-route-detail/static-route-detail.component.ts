import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import {
  Tier,
  V1TiersService,
  StaticRoute,
  V1NetworkStaticRoutesService,
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { StaticRouteModalDto } from 'src/app/models/network/static-route-modal-dto';

@Component({
  selector: 'app-static-route-detail',
  templateUrl: './static-route-detail.component.html',
})
export class StaticRouteDetailComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  currentDatacenterSubscription: Subscription;
  staticRouteModalSubscription: Subscription;

  constructor(
    private datacenterService: DatacenterContextService,
    private tierService: V1TiersService,
    private staticRouteService: V1NetworkStaticRoutesService,
    private route: ActivatedRoute,
    private ngx: NgxSmartModalService,
  ) {}

  Id = '';
  tier: Tier;
  staticRoutes: Array<StaticRoute>;
  dirty: boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.Id = this.route.snapshot.paramMap.get('id');
          // TODO: Ensure Tier is in selected datacenter tiers.
          this.staticRoutes = [];
          this.getStaticRoutes();
        }
      },
    );
  }

  createStaticRoute() {
    this.openStaticRouteModal(ModalMode.Create);
  }

  openStaticRouteModal(modalMode: ModalMode, staticRoute?: StaticRoute) {
    if (modalMode === ModalMode.Edit && !staticRoute) {
      throw new Error('Firewall Rule Required');
    }

    const dto = new StaticRouteModalDto();
    dto.TierId = this.tier.id;
    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.StaticRoute = staticRoute;
    }

    this.subscribeToStaticRouteModal();
    this.ngx.setModalData(dto, 'staticRouteModal');
    this.ngx.getModal('staticRouteModal').open();
  }

  subscribeToStaticRouteModal() {
    this.staticRouteModalSubscription = this.ngx
      .getModal('staticRouteModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getStaticRoutes();
        this.ngx.resetModalData('staticRouteModal');
      });
  }

  ngOnDestroy() {
    this.currentDatacenterSubscription.unsubscribe();
  }

  deleteStaticRoute(staticRoute: StaticRoute) {
    const deleteDescription = staticRoute.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!staticRoute.deletedAt) {
        this.staticRouteService
          .v1NetworkStaticRoutesIdSoftDelete({ id: staticRoute.id })
          .subscribe(data => {
            this.getStaticRoutes();
          });
      } else {
        this.staticRouteService
          .v1NetworkStaticRoutesIdDelete({ id: staticRoute.id })
          .subscribe(data => {
            this.getStaticRoutes();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Static Route`,
        `Do you want to ${deleteDescription} the static route "${staticRoute.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreStaticRoute(staticRoute: StaticRoute) {
    if (staticRoute.deletedAt) {
      this.staticRouteService
        .v1NetworkStaticRoutesIdRestorePatch({ id: staticRoute.id })
        .subscribe(data => {
          this.getStaticRoutes();
        });
    }
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          deleteFunction();
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  getStaticRoutes() {
    this.tierService
      .v1TiersIdGet({ id: this.Id, join: 'staticRoutes' })
      .subscribe(data => {
        this.tier = data;
        this.staticRoutes = data.staticRoutes;
      });
  }

  insertStaticRoutes(routes) {
    // if (!this.staticRoutes) {
    //   this.staticRoutes = new Array<StaticRoute>();
    // }
    // routes.forEach(route => {
    //   if (routes.Name !== '') {
    //     this.staticRoutes.push(route);
    //   }
    // });
    // this.dirty = true;
  }
}
