import { Component, OnInit } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ValidateIpAddress, ValidateCidrAddress} from 'src/app/validators/ip-address-validator';
import { IpAddressService } from 'src/app/services/ip-address.service';

@Component({
  selector: 'app-network-object-modal',
  templateUrl: './network-object-modal.component.html',
  styleUrls: ['./network-object-modal.component.css']
})
export class NetworkObjectModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  networkTypeSubscription: Subscription;
  invalidRange: boolean;

  constructor(private ngx: NgxSmartModalService, private ipService: IpAddressService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    this.invalidRange = false;
    if (this.form.invalid) {
      return;
    }

    // FIXME: Workaround to support range checking, move to custom validator.
    if (this.form.value.type === 'range') {
      if (!this.ipService.isIpv4LessThan(this.form.value.startAddress, this.form.value.endAddress)) {
        this.invalidRange = true;
        return;
      }
    }

    const networkObject = new NetworkObject();
    networkObject.Name = this.form.value.name;
    networkObject.Type = this.form.value.type;
    networkObject.HostAddress = this.form.value.hostAddress;
    networkObject.CidrAddress = this.form.value.cidrAddress;
    networkObject.StartAddress = this.form.value.startAddress;
    networkObject.EndAddress = this.form.value.endAddress;

    this.ngx.resetModalData('networkObjectModal');
    this.ngx.setModalData(Object.assign({}, networkObject), 'networkObjectModal');
    this.ngx.close('networkObjectModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('networkObjectModal');
    this.reset();
  }

  get f() { return this.form.controls; }


  ngOnInit() {
    this.buildForm();
    this.setFormValidators();

    // FIXME: Improve before merge.
    setTimeout(() => {
      this.ngx.getModal('networkObjectModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        const networkObject = Object.assign({}, modal.getData() as NetworkObject);
        if (networkObject !== undefined) {
        this.form.controls.name.setValue(networkObject.Name);
        this.form.controls.type.setValue(networkObject.Type);
        this.form.controls.hostAddress.setValue(networkObject.HostAddress);
        this.form.controls.cidrAddress.setValue(networkObject.CidrAddress);
        this.form.controls.startAddress.setValue(networkObject.StartAddress);
        this.form.controls.endAddress.setValue(networkObject.EndAddress);
        }
      });
    }, 1 * 1000);
    // Delay on subscribe since smart modal service
    // must first discover all modals.
  }

  private setFormValidators() {
    const cidrAddress = this.form.get('cidrAddress');
    const hostAddress = this.form.get('hostAddress');
    const startAddress = this.form.get('startAddress');
    const endAddress = this.form.get('endAddress');

    this.networkTypeSubscription = this.form.get('type').valueChanges
      .subscribe( type => {
        if (type === 'host') {
          hostAddress.setValidators([Validators.required, ValidateIpAddress]);
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
          startAddress.setValidators(null);
          startAddress.setValue(null);
          endAddress.setValidators(null);
          endAddress.setValue(null);
        }

        if (type === 'range') {
          startAddress.setValidators([Validators.required, ValidateIpAddress]);
          startAddress.setValue(null);
          endAddress.setValidators([Validators.required, ValidateIpAddress]);
          endAddress.setValue(null);
          hostAddress.setValidators(null);
          hostAddress.setValue(null);
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
        }

        if (type === 'network') {
          cidrAddress.setValidators([Validators.required, ValidateCidrAddress]);
          hostAddress.setValidators(null);
          hostAddress.setValidators(null);
          startAddress.setValidators(null);
          startAddress.setValue(null);
          endAddress.setValidators(null);
          endAddress.setValue(null);
        }

        cidrAddress.updateValueAndValidity();
        hostAddress.updateValueAndValidity();
        startAddress.updateValueAndValidity();
        endAddress.updateValueAndValidity();
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      ipVersion: [''],
      cidrAddress: [''],
      hostAddress: [''],
      startAddress: [''],
      endAddress: ['']
    });
  }

  private reset() {
    this.networkTypeSubscription.unsubscribe();
    this.submitted = false;
    this.buildForm();
    this.setFormValidators();
  }
}
