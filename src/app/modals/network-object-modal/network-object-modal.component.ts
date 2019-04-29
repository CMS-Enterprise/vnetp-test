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
  }

  cancel() {
    this.ngx.close('networkObjectModal');
  }

  constructor(private ngx: NgxSmartModalService) {}

  ngOnInit() {
    // FIXME: Improve before merge.
    setTimeout(() => {
      this.ngx.getModal('networkObjectModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        let data = modal.getData() as NetworkObject;

        if (data !== undefined) {
        this.networkObject = modal.getData() as NetworkObject;
        } else {
          this.networkObject = new NetworkObject();
        }
      });
    }, 0.5 * 1000);
  }
}
