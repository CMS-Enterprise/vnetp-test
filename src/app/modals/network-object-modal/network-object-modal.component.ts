import { Component, OnInit, OnDestroy } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ValidateIpv4Address, ValidateIpv4CidrAddress} from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-network-object-modal',
  templateUrl: './network-object-modal.component.html',
  styleUrls: ['./network-object-modal.component.css']
})
export class NetworkObjectModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  networkTypeSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
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

  private setFormValidators() {
    const cidrAddress = this.form.get('cidrAddress');
    const hostAddress = this.form.get('hostAddress');
    const startAddress = this.form.get('startAddress');
    const endAddress = this.form.get('endAddress');

    this.networkTypeSubscription = this.form.get('type').valueChanges
      .subscribe( type => {
        if (type === 'host') {
          hostAddress.setValidators(Validators.compose([Validators.required, ValidateIpv4Address]));
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
          startAddress.setValidators(null);
          startAddress.setValue(null);
          endAddress.setValidators(null);
          endAddress.setValue(null);
        }

        if (type === 'range') {
          startAddress.setValidators(Validators.compose([Validators.required, ValidateIpv4Address]));
          startAddress.setValue(null);
          endAddress.setValidators(Validators.compose([Validators.required, ValidateIpv4Address]));
          endAddress.setValue(null);
          hostAddress.setValidators(null);
          hostAddress.setValue(null);
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
        }

        if (type === 'network') {
          cidrAddress.setValidators(Validators.compose([Validators.required, ValidateIpv4CidrAddress]));
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

  getData() {
    const networkObject = Object.assign({}, this.ngx.getModalData('networkObjectModal') as NetworkObject);
    if (networkObject !== undefined) {
      this.form.controls.name.setValue(networkObject.Name);
      this.form.controls.type.setValue(networkObject.Type);
      this.form.controls.hostAddress.setValue(networkObject.HostAddress);
      this.form.controls.cidrAddress.setValue(networkObject.CidrAddress);
      this.form.controls.startAddress.setValue(networkObject.StartAddress);
      this.form.controls.endAddress.setValue(networkObject.EndAddress);
    }
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

  private unsubAll() {
    if (this.networkTypeSubscription) {
      this.networkTypeSubscription.unsubscribe();
    }
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
