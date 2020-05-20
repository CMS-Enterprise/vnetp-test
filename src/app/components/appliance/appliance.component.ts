import { Component, OnInit, OnDestroy } from '@angular/core';
import { Appliance, V1DatacentersService, V1AppliancesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { ApplianceModalDto } from 'src/app/models/appliance/appliance-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-appliance',
  templateUrl: './appliance.component.html',
})
export class ApplianceComponent implements OnInit, OnDestroy {
  appliances: Array<Appliance>;
  ModalMode: ModalMode;
  applianceModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  datacenterId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private applianceService: V1AppliancesService,
  ) {}

  getAppliances() {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'appliances',
      })
      .subscribe(data => {
        this.appliances = data.appliances;
      });
  }

  createAppliance() {
    this.openApplianceModal(ModalMode.Create);
  }

  openApplianceModal(modalMode: ModalMode, a?: Appliance) {
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

  subscribeToApplianceModal() {
    this.applianceModalSubscription = this.ngx.getModal('applianceModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      this.getAppliances();
      this.ngx.resetModalData('applianceModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  deleteAppliance(a: Appliance) {
    const deleteDescription = a.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!a.deletedAt) {
        this.applianceService.v1AppliancesIdSoftDelete({ id: a.id }).subscribe(data => {
          this.getAppliances();
        });
      } else {
        this.applianceService.v1AppliancesIdDelete({ id: a.id }).subscribe(data => {
          this.getAppliances();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Appliance?`, `Do you want to ${deleteDescription} appliance "${a.name}"?`),
      deleteFunction,
    );
  }

  restoreAppliance(a: Appliance) {
    if (a.deletedAt) {
      this.applianceService
        .v1AppliancesIdRestorePatch({
          id: a.id,
        })
        .subscribe(data => {
          this.getAppliances();
        });
    }
  }

  private confirmDeleteObject(modalDto: YesNoModalDto, deleteFunction: () => void) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFunction();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  private unsubAll() {
    [this.applianceModalSubscription, this.currentDatacenterSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getAppliances();
      }
    });
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
