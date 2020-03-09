import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import {
  // ApplianceNetworkPort,
  V1AppliancesService,
  Appliance,
} from 'api_client';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ApplianceModalDto } from 'src/app/models/appliance/appliance-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-appliance-modal',
  templateUrl: './appliance-modal.component.html',
  styleUrls: ['./appliance-modal.component.css'],
})
export class ApplianceModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  ModalMode: ModalMode;
  DatacenterId: string;
  ApplianceId: string;
  submitted: boolean;
  // networkPortsModalSubscription: Subscription;
  // networkPorts: Array<ApplianceNetworkPort>;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private applianceService: V1AppliancesService) {}

  // getNetworkPorts() {}
  // openNetworkPortsModal() {}
  // subscribeToNetworkPortsModal() {}
  // deleteNetworkPort() {}
  // restoreNetworkPort() {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const appliance = {} as Appliance;
    appliance.name = this.form.value.name;
    appliance.description = this.form.value.description;
    appliance.rackUnits = this.form.value.rackUnits;
    appliance.serialNumber = this.form.value.serialNumber;
    appliance.deliveryDate = this.form.value.deliveryDate;
    appliance.localStorageType = this.form.value.localStorageType;
    appliance.localStorageRequired = this.stringToBoolean(this.form.value.localStorageRequired);
    appliance.localStorageSize = this.convertGbToBytes(this.form.value.localStorageSize);
    appliance.sanType = this.form.value.sanType;
    appliance.sanRequired = this.stringToBoolean(this.form.value.sanRequired);
    appliance.sanStorageSize = this.convertGbToBytes(this.form.value.sanStorageSize);
    appliance.powerSupplyVoltage = this.form.value.powerSupplyVoltage;
    appliance.powerSupplyWattage = this.form.value.powerSupplyWattage;
    appliance.powerSupplyConnectionType = this.form.value.powerSupplyConnectionType;
    appliance.powerSupplyCount = this.form.value.powerSupplyCount;

    this.ngx.resetModalData('applianceModal');
    this.ngx.setModalData(Object.assign({}, appliance), 'applianceModal');

    if (this.ModalMode === ModalMode.Create) {
      appliance.datacenterId = this.DatacenterId;

      this.applianceService
        .v1AppliancesPost({
          appliance,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.applianceService
        .v1AppliancesIdPut({
          id: this.ApplianceId,
          appliance,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  cancel() {
    this.closeModal();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('applianceModal') as ApplianceModalDto);

    if (dto.DatacenterId) {
      this.DatacenterId = dto.DatacenterId;
    }

    // this.getNetworkPorts()

    if (!dto.ModalMode) {
      throw Error('Modal Mode not set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.ApplianceId = dto.Appliance.id;
      }
    }

    const appliance = dto.Appliance;

    if (appliance !== undefined) {
      // TO DO: type mismatch between API and client model
      const date = new Date(String(appliance.deliveryDate));
      const deliveryDate = date.toISOString().substring(0, 10);

      this.form.controls.name.setValue(appliance.name);
      this.form.controls.description.setValue(appliance.description);
      this.form.controls.rackUnits.setValue(appliance.rackUnits);
      this.form.controls.serialNumber.setValue(appliance.serialNumber);
      this.form.controls.deliveryDate.setValue(deliveryDate);
      this.form.controls.localStorageType.setValue(appliance.localStorageType);
      this.form.controls.localStorageRequired.setValue(appliance.localStorageRequired);
      this.form.controls.localStorageSize.setValue(this.convertBytesToGb(appliance.localStorageSize));
      this.form.controls.sanType.setValue(appliance.sanType);
      this.form.controls.sanRequired.setValue(appliance.sanRequired);
      this.form.controls.sanStorageSize.setValue(this.convertBytesToGb(appliance.sanStorageSize));
      this.form.controls.powerSupplyVoltage.setValue(appliance.powerSupplyVoltage);
      this.form.controls.powerSupplyWattage.setValue(appliance.powerSupplyWattage);
      this.form.controls.powerSupplyConnectionType.setValue(appliance.powerSupplyConnectionType);
      this.form.controls.powerSupplyCount.setValue(appliance.powerSupplyCount);
    }
    this.ngx.resetModalData('virtualMachineModal');
  }

  private convertGbToBytes(val) {
    const convertedVal = val * 1000000000;

    return convertedVal;
  }

  private convertBytesToGb(val) {
    const convertedVal = val / 1000000000;

    return convertedVal;
  }

  private stringToBoolean(str) {
    switch (str) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return Boolean(str);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      rackUnits: [''],
      serialNumber: [''],
      deliveryDate: [''],
      localStorageType: [''],
      localStorageRequired: [''],
      localStorageSize: [''],
      sanType: [''],
      sanRequired: [''],
      sanStorageSize: [''],
      powerSupplyVoltage: [''],
      powerSupplyWattage: [''],
      powerSupplyConnectionType: [''],
      powerSupplyCount: [''],
    });
  }

  private closeModal() {
    this.ngx.close('applianceModal');
    this.reset();
  }

  private reset() {
    this.buildForm();
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
    [
      // networkPortsModalSubscription
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
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
