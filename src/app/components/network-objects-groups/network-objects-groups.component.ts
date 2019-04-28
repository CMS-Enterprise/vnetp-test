import { Component, OnInit } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/modal-mode';
import { NetworkObjectDto } from 'src/app/models/network-object-dto';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
  styleUrls: ['./network-objects-groups.component.css']
})
export class NetworkObjectsGroupsComponent implements OnInit {

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  navIndex = 0;

  modalNetworkObject: NetworkObject;
  modalNetworkObjectIndex: number;

  networkObjectModalMode: ModalMode;
  dirty: boolean;

  constructor(private ngx: NgxSmartModalService) {
    this.networkObjects = new Array<NetworkObject>();
    this.modalNetworkObject = new NetworkObject();
  }

  createNetworkObject() {
    this.modalNetworkObject = new NetworkObject();
    this.networkObjectModalMode = ModalMode.Create;
    this.ngx.getModal('networkObjectModal').open();
  }

  editNetworkObject(networkObject: NetworkObject) {
    this.modalNetworkObject = Object.assign({}, networkObject);
    this.modalNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.networkObjectModalMode = ModalMode.Edit;
    this.ngx.getModal('networkObjectModal').open();
  }

  saveNetworkObject() {
    // TODO: Validation

    // Ranges
    // Ranges must be contigous

    // Host
    // Must be valid IP address

    // Subnet
    // Must be valid Subnet

    if (this.networkObjectModalMode === ModalMode.Create) {
      this.networkObjects.push(this.modalNetworkObject);
    } else {
      this.networkObjects[this.modalNetworkObjectIndex] = this.modalNetworkObject;
    }
    this.dirty = true;
    this.ngx.close('networkObjectModal');
  }

  getNetworkObjectTypeStr(networkObject: NetworkObject) {

    switch (networkObject.Type) {
    case '0': { return 'Host'; }
    case '1': { return 'Range'; }
    case '2': { return 'Network'; }
  }

  }

  saveAll() {
    const dto = new NetworkObjectDto();

    dto.NetworkObjects = this.networkObjects;
    dto.NetworkObjectGroups = this.networkObjectGroups;


    console.log(dto);
    // TODO: Save to D42
  }

  ngOnInit() {
  }

}
