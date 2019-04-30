import { Component, OnInit } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-network-object-modal',
  templateUrl: './network-object-modal.component.html',
  styleUrls: ['./network-object-modal.component.css']
})
export class NetworkObjectModalComponent implements OnInit {

  networkObject: NetworkObject;

  save() {
    this.ngx.setModalData(Object.assign({}, this.networkObject), 'networkObjectModal');
    this.ngx.close('networkObjectModal');
    this.networkObject = new NetworkObject();
  }

  cancel() {
    this.ngx.close('networkObjectModal');
    this.networkObject = new NetworkObject();
  }

  constructor(private ngx: NgxSmartModalService) {
    this.networkObject = new NetworkObject();
  }

  ngOnInit() {
    // FIXME: Improve before merge.
    setTimeout(() => {
      this.ngx.getModal('networkObjectModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        let data = modal.getData() as NetworkObject;

        if (data !== undefined) {
        this.networkObject = modal.getData() as NetworkObject;
        }
      });
    }, 0.5 * 1000);
  }
}
