import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/modal-mode';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Subscription } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { ServiceObject } from 'src/app/models/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-object-group';
import { ServiceObjectDto } from 'src/app/models/service-object-dto';

@Component({
  selector: 'app-service-objects-groups',
  templateUrl: './service-objects-groups.component.html',
  styleUrls: ['./service-objects-groups.component.css']
})
export class ServiceObjectsGroupsComponent implements OnInit {

  vrf: Vrf;
  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;
  navIndex = 0;

  editServiceObjectIndex: number;
  editServiceObjectGroupIndex: number;

  serviceObjectModalMode: ModalMode;
  serviceObjectGroupModalMode: ModalMode;
  dirty: boolean;

  serviceObjectModalSubscription: Subscription;
  serviceObjectGroupModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private api: AutomationApiService, private papa: Papa) {
    this.serviceObjects = new Array<ServiceObject>();
    this.serviceObjectGroups = new Array<ServiceObjectGroup>();
  }

  createServiceObject() {
    this.subscribeToServiceObjectModal();
    this.serviceObjectModalMode = ModalMode.Create;
    this.ngx.getModal('serviceObjectModal').open();
  }

  createServiceObjectGroup() {
    this.subscribeToServiceObjectGroupModal();
    this.serviceObjectGroupModalMode = ModalMode.Create;
    this.ngx.getModal('serviceObjectGroupModal').open();
  }

  editServiceObject(serviceObject: ServiceObject) {
    this.subscribeToServiceObjectModal();
    this.serviceObjectModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, serviceObject), 'serviceObjectModal');
    this.editServiceObjectIndex = this.serviceObjects.indexOf(serviceObject);
    this.ngx.getModal('serviceObjectModal').open();
  }

  editServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    this.subscribeToServiceObjectGroupModal() ;
    this.serviceObjectGroupModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, serviceObjectGroup), 'serviceObjectGroupModal');
    this.editServiceObjectGroupIndex = this.serviceObjectGroups.indexOf(serviceObjectGroup);
    this.ngx.getModal('serviceObjectGroupModal').open();
  }

  subscribeToServiceObjectModal() {
    this.serviceObjectModalSubscription =
    this.ngx.getModal('serviceObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as ServiceObject;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveServiceObject(data);
      }
      this.ngx.resetModalData('serviceObjectModal');
      this.serviceObjectModalSubscription.unsubscribe();
    });
  }

  subscribeToServiceObjectGroupModal() {
    this.serviceObjectGroupModalSubscription =
    this.ngx.getModal('serviceObjectGroupModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as ServiceObjectGroup;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveServiceObjectGroup(data);
      }
      this.ngx.resetModalData('serviceObjectGroupModal');
      this.serviceObjectGroupModalSubscription.unsubscribe();
    });
  }

  saveServiceObject(serviceObject: ServiceObject) {
    if (this.serviceObjectModalMode === ModalMode.Create) {
      this.serviceObjects.push(serviceObject);
    } else {
      this.serviceObjects[this.editServiceObjectIndex] = serviceObject;
    }
    this.dirty = true;
  }

  deleteServiceObject(serviceObject: ServiceObject) {
    const index = this.serviceObjects.indexOf(serviceObject);
    if ( index > -1) {
      this.serviceObjects.splice(index, 1);
      this.dirty = true;
    }
  }

  saveServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    if (this.serviceObjectGroupModalMode === ModalMode.Create) {
      this.serviceObjectGroups.push(serviceObjectGroup);
    } else {
      this.serviceObjectGroups[this.editServiceObjectGroupIndex] = serviceObjectGroup;
    }
    this.dirty = true;
  }

  deleteServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    const index = this.serviceObjectGroups.indexOf(serviceObjectGroup);
    if ( index > -1) {
      this.serviceObjectGroups.splice(index, 1);
      this.dirty = true;
    }
  }

  saveAll() {
    const dto = new ServiceObjectDto();

    dto.ServiceObjects = this.serviceObjects;
    dto.ServiceObjectGroups = this.serviceObjectGroups;

    let extra_vars: {[k: string]: any} = {};
    extra_vars.service_object_dto = dto;

    const body = { extra_vars };

    this.api.launchTemplate('save-service-object-dto', body).subscribe();
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
        const group = this.serviceObjectGroups.find(g => g.Name === object.GroupName);
        if (group != null) {
          group.ServiceObjects.push(object);
        } else {
          const newGroup = new ServiceObjectGroup();
          newGroup.Name = object.GroupName;
          newGroup.ServiceObjects = new Array<ServiceObject>();
          newGroup.ServiceObjects.push(object as ServiceObject);
          this.serviceObjectGroups.push(newGroup);
          this.dirty = true;
        }
       } else if (object.Name) {
         this.serviceObjects.push(object as ServiceObject);
         this.dirty = true;
       }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    try{
    this.serviceObjectModalSubscription.unsubscribe();
    this.serviceObjectGroupModalSubscription.unsubscribe();
    } catch (e) {
      console.log(e);
    }
  }
}
