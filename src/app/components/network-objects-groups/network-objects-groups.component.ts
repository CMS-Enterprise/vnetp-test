import { Component, OnInit } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/modal-mode';
import { NetworkObjectDto } from 'src/app/models/network-object-dto';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Subscription } from 'rxjs';
import { Papa } from 'ngx-papaparse';

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
  editNetworkObjectGroupIndex: number;

  networkObjectModalMode: ModalMode;
  networkObjectGroupModalMode: ModalMode;
  dirty: boolean;

  networkObjectModalSubscription: Subscription;
  networkObjectGroupModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private api: AutomationApiService, private papa: Papa) {
    this.networkObjects = new Array<NetworkObject>();
    this.networkObjectGroups = new Array<NetworkObjectGroup>();
  }

  createNetworkObject() {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Create;
    this.ngx.getModal('networkObjectModal').open();
  }

  createNetworkObjectGroup() {
    this.subscribeToNetworkObjectGroupModal();
    this.networkObjectGroupModalMode = ModalMode.Create;
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  editNetworkObject(networkObject: NetworkObject) {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, networkObject), 'networkObjectModal');
    this.editNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.ngx.getModal('networkObjectModal').open();
  }

  editNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    this.subscribeToNetworkObjectGroupModal() ;
    this.networkObjectGroupModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, networkObjectGroup), 'networkObjectGroupModal');
    this.editNetworkObjectIndex = this.networkObjectGroups.indexOf(networkObjectGroup);
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription =
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as NetworkObject;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveNetworkObject(data);
      }
      this.ngx.resetModalData('networkObjectModal');
      this.networkObjectModalSubscription.unsubscribe();
    });
  }

  subscribeToNetworkObjectGroupModal() {
    this.networkObjectGroupModalSubscription =
    this.ngx.getModal('networkObjectGroupModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as NetworkObjectGroup;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveNetworkObjectGroup(data);
      }
      this.ngx.resetModalData('networkObjectGroupModal');
      this.networkObjectGroupModalSubscription.unsubscribe();
    });
  }

  saveNetworkObject(networkObject: NetworkObject) {
    if (this.networkObjectModalMode === ModalMode.Create) {
      this.networkObjects.push(networkObject);
    } else {
      this.networkObjects[this.editNetworkObjectIndex] = networkObject;
    }
    this.dirty = true;
  }

  deleteNetworkObject(networkObject: NetworkObject) {
    const index = this.networkObjects.indexOf(networkObject);
    if ( index > -1) {
      this.networkObjects.splice(index, 1);
      this.dirty = true;
    }
  }

  saveNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    if (this.networkObjectGroupModalMode === ModalMode.Create) {
      this.networkObjectGroups.push(networkObjectGroup);
    } else {
      this.networkObjectGroups[this.editNetworkObjectGroupIndex] = networkObjectGroup;
    }
    this.dirty = true;
  }

  deleteNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    const index = this.networkObjectGroups.indexOf(networkObjectGroup);
    if ( index > -1) {
      this.networkObjectGroups.splice(index, 1);
      this.dirty = true;
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

    console.log(body);

    // this.api.launchTemplate('save-network-object-dto', body).subscribe();
  }

  handleFileSelect(evt) {
    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.parseCsv(reader.result);
    };
  }

  private parseCsv(csv) {
    const options = {
      header: true,
      complete: (results) => {
        this.importObjects(results.data);
      }
    };
    this.papa.parse(csv, options);
  }

  importObjects(objects) {
    // TODO: Validation.
    objects.forEach(object => {
      if (object.GroupName) {
        const group = this.networkObjectGroups.find(g => g.Name === object.GroupName);
        if (group != null) {
          group.NetworkObjects.push(object);
        } else {
          const newGroup = new NetworkObjectGroup();
          newGroup.Name = object.GroupName;
          newGroup.NetworkObjects = new Array<NetworkObject>();
          newGroup.NetworkObjects.push(object as NetworkObject);
          this.networkObjectGroups.push(newGroup);
          this.dirty = true;
        }
       } else if (object.Name) {
         this.networkObjects.push(object as NetworkObject);
         this.dirty = true;
       }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    try{
    this.networkObjectModalSubscription.unsubscribe();
    this.networkObjectGroupModalSubscription.unsubscribe();
    } catch (e) {
      console.log(e);
    }
  }
}
