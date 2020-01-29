import { Component, OnInit, OnDestroy } from '@angular/core';
import { Appliance, V1DatacentersService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { ApplianceModalDto } from 'src/app/models/appliance/appliance-modal-dto';

@Component({
  selector: 'app-appliance',
  templateUrl: './appliance.component.html',
  styleUrls: ['./appliance.component.css'],
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
    this.applianceModalSubscription = this.ngx
      .getModal('applianceModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getAppliances();
        this.ngx.resetModalData('applianceModal');
        this.datacenterContextService.unlockDatacenter();
      });
  }

  private unsubAll() {
    [
      this.applianceModalSubscription,
      this.currentDatacenterSubscription,
    ].forEach(sub => {
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
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.datacenterId = cd.id;
          this.getAppliances();
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
