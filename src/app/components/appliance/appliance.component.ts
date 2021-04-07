import { Component, OnInit, OnDestroy } from '@angular/core';
import { Appliance, V1DatacentersService, V1AppliancesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { ApplianceModalDto } from 'src/app/models/appliance/appliance-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-appliance',
  templateUrl: './appliance.component.html',
})
export class ApplianceComponent implements OnInit, OnDestroy {
  public appliances: Appliance[] = [];
  public ModalMode = ModalMode;

  private applianceModalSubscription: Subscription;
  private currentDatacenterSubscription: Subscription;
  public datacenterId: string;

  constructor(
    private applianceService: V1AppliancesService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
  ) {}

  public getAppliances(): void {
    this.applianceService.v1AppliancesGet({ filter: `datacenterId||eq||${this.datacenterId}` }).subscribe(data => {
      this.appliances = data;
    });
  }

  public createAppliance(): void {
    this.openApplianceModal(ModalMode.Create);
  }

  public openApplianceModal(modalMode: ModalMode, a?: Appliance): void {
    if (modalMode === ModalMode.Edit && !a) {
      throw new Error('Appliance Required.');
    }

    const dto = new ApplianceModalDto();
    dto.ModalMode = modalMode;
    dto.DatacenterId = this.datacenterId;

    if (modalMode === ModalMode.Edit) {
      dto.Appliance = a;
    }

    this.subscribeToApplianceModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'applianceModal');
    this.ngx.getModal('applianceModal').open();
  }

  public deleteAppliance(appliance: Appliance): void {
    this.entityService.deleteEntity(appliance, {
      entityName: 'Appliance',
      delete$: this.applianceService.v1AppliancesIdDelete({ id: appliance.id }),
      softDelete$: this.applianceService.v1AppliancesIdSoftDelete({ id: appliance.id }),
      onSuccess: () => this.getAppliances(),
    });
  }

  public restoreAppliance(appliance: Appliance): void {
    if (!appliance.deletedAt) {
      return;
    }
    this.applianceService
      .v1AppliancesIdRestorePatch({
        id: appliance.id,
      })
      .subscribe(() => {
        this.getAppliances();
      });
  }

  private subscribeToApplianceModal(): void {
    this.applianceModalSubscription = this.ngx.getModal('applianceModal').onAnyCloseEvent.subscribe(() => {
      this.getAppliances();
      this.ngx.resetModalData('applianceModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getAppliances();
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.applianceModalSubscription, this.currentDatacenterSubscription]);
  }
}
