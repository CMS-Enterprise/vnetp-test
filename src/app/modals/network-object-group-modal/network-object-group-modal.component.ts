import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { NetworkObject } from 'src/app/models/network-object';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
  styleUrls: ['./network-object-group-modal.component.css']
})
export class NetworkObjectGroupModalComponent implements OnInit {
  networkObjects: Array<NetworkObject>;

  networkObjectModalSubscription: Subscription;
  networkObjectGroupModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService) {
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
  }

}
