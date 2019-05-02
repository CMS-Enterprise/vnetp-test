import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { NetworkObject } from 'src/app/models/network-object';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
  styleUrls: ['./network-object-group-modal.component.css']
})
export class NetworkObjectGroupModalComponent implements OnInit {
  form: FormGroup;
  networkObjects: Array<NetworkObject>;

  networkObjectModalSubscription: Subscription;
  networkObjectGroupModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
    this.networkObjects = new Array<NetworkObject>();
   }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription =
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as NetworkObject;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.networkObjects.push(data);
      }
      this.ngx.resetModalData('networkObjectModal');
      this.networkObjectModalSubscription.unsubscribe();
    });
  }

  createNetworkObject() {
    this.subscribeToNetworkObjectModal();
    this.ngx.open('networkObjectModal');
  }

  cancel() {
    this.ngx.close('networkObjectGroupModal');
  }

  ngOnInit() {
    this.buildForm();
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
}
