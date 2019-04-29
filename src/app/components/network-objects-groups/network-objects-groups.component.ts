import { Component, OnInit } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/modal-mode';
import { NetworkObjectDto } from 'src/app/models/network-object-dto';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
  styleUrls: ['./network-objects-groups.component.css']
})
export class NetworkObjectsGroupsComponent implements OnInit {

  vrf: Vrf;
  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  navIndex = 0;

  editNetworkObjectIndex: number;

  networkObjectModalMode: ModalMode;
  dirty: boolean;

  constructor(private ngx: NgxSmartModalService, private api: AutomationApiService) {
    this.networkObjects = new Array<NetworkObject>();
  }

  createNetworkObject() {
    this.networkObjectModalMode = ModalMode.Create;
    this.ngx.getModal('networkObjectModal').open();
  }

  editNetworkObject(networkObject: NetworkObject) {
    this.networkObjectModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, networkObject), 'networkObjectModal');
    this.editNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.ngx.getModal('networkObjectModal').open();
  }

  saveNetworkObject(networkObject: NetworkObject) {
    if (this.networkObjectModalMode === ModalMode.Create) {
      this.networkObjects.push(networkObject);
    } else {
      this.networkObjects[this.editNetworkObjectIndex] = networkObject;
    }
    this.dirty = true;
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

    let extra_vars: {[k: string]: any} = {};
    extra_vars.vrf_id = 1;
    extra_vars.network_object_dto = dto;

    const body = { extra_vars };

    this.api.launchTemplate('save-network-object-dto', body).subscribe();
  }

  ngOnInit() {
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as NetworkObject;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveNetworkObject(data);
      }
      this.ngx.resetModalData('networkObjectModal');
    });
  }

  ngOnDestroy() {
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.unsubscribe();
  }
}
