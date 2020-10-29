import { Component, OnInit, OnDestroy } from '@angular/core';
import { Appliance, V1DatacentersService, V1AppliancesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { ApplianceModalDto } from 'src/app/models/appliance/appliance-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-appliance',
  templateUrl: './appliance.component.html',
})
export class ApplianceComponent implements OnInit, OnDestroy {
  public appliances: Appliance[] = [];
  public ModalMode = ModalMode;

  private applianceModalSubscription: Subscription;
  private currentDatacenterSubscription: Subscription;
  private datacenterId: string;

  constructor(
    private applianceService: V1AppliancesService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private ngx: NgxSmartModalService,
  ) {}

  public getAppliances(): void {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'appliances',
      })
      .subscribe(data => {
        this.appliances = data.appliances;
      });
  }

  public createAppliance(): void {
    this.openApplianceModal(ModalMode.Create);
    console.log('HERE');
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
    const { deletedAt, id, name } = appliance;
    const deleteDescription = deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!deletedAt) {
        this.applianceService.v1AppliancesIdSoftDelete({ id }).subscribe(() => {
          this.getAppliances();
        });
      } else {
        this.applianceService.v1AppliancesIdDelete({ id }).subscribe(() => {
          this.getAppliances();
        });
      }
    };

    const dto = new YesNoModalDto(
      `${deleteDescription} Appliance`,
      `Do you want to ${deleteDescription} appliance "${name}"?`,
      `${deleteDescription} Appliance`,
      'Cancel',
      'danger',
    );

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, deleteFunction);
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
