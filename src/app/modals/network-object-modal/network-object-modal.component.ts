import { Component, OnInit } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-object-modal',
  templateUrl: './network-object-modal.component.html',
  styleUrls: ['./network-object-modal.component.css']
})
export class NetworkObjectModalComponent implements OnInit {
  networkObjectForm: FormGroup;
  submitted: boolean;
  networkTypeSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.networkObjectForm.invalid)
    {
      return;
    }

    const networkObject = new NetworkObject();
    networkObject.Name = this.networkObjectForm.value.name;
    networkObject.Type = this.networkObjectForm.value.type;
    networkObject.HostAddress = this.networkObjectForm.value.hostAddress;
    networkObject.CidrAddress = this.networkObjectForm.value.cidrAddress;
    networkObject.StartAddress = this.networkObjectForm.value.startAddress;
    networkObject.EndAddress = this.networkObjectForm.value.endAddress;

    this.ngx.setModalData(Object.assign({}, networkObject), 'networkObjectModal');
    this.ngx.close('networkObjectModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('networkObjectModal');
    this.reset();
  }

  get f() { return this.networkObjectForm.controls; }


  ngOnInit() {
    this.buildForm();
    this.setNetworkInfoValidators();

    // FIXME: Improve before merge.
    setTimeout(() => {
      this.ngx.getModal('networkObjectModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        const networkObject = Object.assign({}, modal.getData() as NetworkObject);
        if (networkObject !== undefined) {
        this.networkObjectForm.controls.name.setValue(networkObject.Name);
        this.networkObjectForm.controls.type.setValue(networkObject.Type);
        this.networkObjectForm.controls.hostAddress.setValue(networkObject.HostAddress);
        this.networkObjectForm.controls.cidrAddress.setValue(networkObject.CidrAddress);
        this.networkObjectForm.controls.startAddress.setValue(networkObject.StartAddress);
        this.networkObjectForm.controls.endAddress.setValue(networkObject.EndAddress);
        }
      });
    }, 1 * 1000);
    // Delay on subscribe since smart modal service
    // must first discover all modals.
  }

  private setNetworkInfoValidators() {
    const cidrAddress = this.networkObjectForm.get('cidrAddress');
    const hostAddress = this.networkObjectForm.get('hostAddress');
    const startAddress = this.networkObjectForm.get('startAddress');
    const endAddress = this.networkObjectForm.get('endAddress');

    this.networkTypeSubscription = this.networkObjectForm.get('type').valueChanges
      .subscribe( type => {
        if (type === 'host') {
          hostAddress.setValidators([Validators.required]);
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
          startAddress.setValidators(null);
          startAddress.setValue(null);
          endAddress.setValidators(null);
          endAddress.setValue(null);
        }

        if (type === 'range') {
          startAddress.setValidators([Validators.required]);
          startAddress.setValue(null);
          endAddress.setValidators([Validators.required]);
          endAddress.setValue(null);
          hostAddress.setValidators(null);
          hostAddress.setValue(null);
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
        }

        if (type === 'network') {
          cidrAddress.setValidators([Validators.required]);
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
    this.networkObjectForm = this.formBuilder.group({
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
    this.setNetworkInfoValidators();
  }
}
