import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { ApplianceNetworkPort, V1AppliancesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

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
  networkPortsModalSubscription: Subscription;
  networkPorts: Array<ApplianceNetworkPort>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private applianceService: V1AppliancesService,
  ) {}

  cancel() {
    this.closeModal();
  }

  getData() {}

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

  private unsubAll() {
    [].forEach(sub => {
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
