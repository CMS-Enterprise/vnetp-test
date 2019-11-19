import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Subscription, Observable } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { ServiceObjectDto } from 'src/app/models/service-objects/service-object-dto';
import { HelpersService } from 'src/app/services/helpers.service';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { ServiceObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-service-objects-groups',
  templateUrl: './service-objects-groups.component.html',
})
export class ServiceObjectsGroupsComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  vrfs: Vrf[];
  currentVrf: Vrf;
  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;
  deletedServiceObjects: Array<ServiceObject>;
  deletedServiceObjectGroups: Array<ServiceObjectGroup>;
  navIndex = 0;

  editServiceObjectIndex: number;
  editServiceObjectGroupIndex: number;

  serviceObjectModalMode: ModalMode;
  serviceObjectGroupModalMode: ModalMode;
  dirty: boolean;

  serviceObjectModalSubscription: Subscription;
  serviceObjectGroupModalSubscription: Subscription;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private ngx: NgxSmartModalService,
    private api: AutomationApiService,
    private papa: Papa,
    private hs: HelpersService,
    public helpText: ServiceObjectsGroupsHelpText,
  ) {
    this.serviceObjects = new Array<ServiceObject>();
    this.serviceObjectGroups = new Array<ServiceObjectGroup>();
  }

  getVrfs() {
    this.dirty = false;

    let vrfId: number = null;

    if (this.currentVrf) {
      vrfId = this.currentVrf.id;
    }

    this.api.getVrfs().subscribe(data => {
      this.vrfs = data;

      if (!vrfId) {
        this.currentVrf = this.vrfs[0];
      } else {
        this.currentVrf = this.vrfs.find(v => v.id === vrfId);

        if (!this.currentVrf) {
          this.currentVrf = this.vrfs[0];
        }
      }
      this.getVrfObjects(this.currentVrf);
    });
  }

  getVrfObjects(vrf: Vrf) {
    const serviceObjectDto = this.hs.getJsonCustomField(
      vrf,
      'service_objects',
    ) as ServiceObjectDto;

    if (!serviceObjectDto) {
      this.serviceObjects = new Array<ServiceObject>();
      this.serviceObjectGroups = new Array<ServiceObjectGroup>();
    } else if (serviceObjectDto) {
      this.serviceObjects = serviceObjectDto.ServiceObjects;
      this.serviceObjectGroups = serviceObjectDto.ServiceObjectGroups;
    }
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
    this.ngx.setModalData(
      this.hs.deepCopy(serviceObject),
      'serviceObjectModal',
    );
    this.editServiceObjectIndex = this.serviceObjects.indexOf(serviceObject);
    this.ngx.getModal('serviceObjectModal').open();
  }

  editServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    this.subscribeToServiceObjectGroupModal();
    this.serviceObjectGroupModalMode = ModalMode.Edit;
    this.ngx.setModalData(
      this.hs.deepCopy(serviceObjectGroup),
      'serviceObjectGroupModal',
    );
    this.editServiceObjectGroupIndex = this.serviceObjectGroups.indexOf(
      serviceObjectGroup,
    );
    this.ngx.getModal('serviceObjectGroupModal').open();
  }

  subscribeToServiceObjectModal() {
    this.serviceObjectModalSubscription = this.ngx
      .getModal('serviceObjectModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as ServiceObject;

        if (data !== undefined) {
          this.saveServiceObject(data);
        }
        this.ngx.resetModalData('serviceObjectModal');
        this.serviceObjectModalSubscription.unsubscribe();
      });
  }

  subscribeToServiceObjectGroupModal() {
    this.serviceObjectGroupModalSubscription = this.ngx
      .getModal('serviceObjectGroupModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as ServiceObjectGroup;

        if (data !== undefined) {
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
    if (index > -1) {
      this.serviceObjects.splice(index, 1);

      if (!this.deletedServiceObjects) {
        this.deletedServiceObjects = new Array<ServiceObject>();
      }
      this.deletedServiceObjects.push(serviceObject);
      this.dirty = true;
    }
  }

  saveServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    if (this.serviceObjectGroupModalMode === ModalMode.Create) {
      this.serviceObjectGroups.push(serviceObjectGroup);
    } else {
      this.serviceObjectGroups[
        this.editServiceObjectGroupIndex
      ] = serviceObjectGroup;
    }
    this.dirty = true;
  }

  deleteServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    const index = this.serviceObjectGroups.indexOf(serviceObjectGroup);
    if (index > -1) {
      this.serviceObjectGroups.splice(index, 1);

      if (!this.deletedServiceObjectGroups) {
        this.deletedServiceObjectGroups = new Array<ServiceObjectGroup>();
      }
      this.deletedServiceObjectGroups.push(serviceObjectGroup);

      this.dirty = true;
    }
  }

  saveAll() {
    this.dirty = false;
    const dto = new ServiceObjectDto();

    dto.ServiceObjects = this.serviceObjects;
    dto.ServiceObjectGroups = this.serviceObjectGroups;
    dto.VrfId = this.currentVrf.id;

    const extra_vars: { [k: string]: any } = {};
    extra_vars.service_object_dto = dto;
    extra_vars.vrf_name = this.currentVrf.name.split('-')[1];
    extra_vars.deleted_service_objects = this.deletedServiceObjects;
    extra_vars.deleted_service_object_groups = this.deletedServiceObjectGroups;

    const body = { extra_vars };

    this.api.launchTemplate('save-service-object-dto', body, true).subscribe(
      data => {},
      error => {
        this.dirty = true;
      },
    );

    this.deletedServiceObjects = new Array<ServiceObject>();
    this.deletedServiceObjectGroups = new Array<ServiceObjectGroup>();
  }

  importServiceObjectConfig(config) {
    // TODO: Import Validation
    // TODO: Validate VRF Id and display warning with confirmation if not present or mismatch current vrf.
    this.serviceObjects = config.ServiceObjects;
    this.serviceObjectGroups = config.ServiceObjectGroups;

    this.dirty = true;
  }

  exportServiceObjectConfig() {
    const dto = new ServiceObjectDto();

    dto.ServiceObjects = this.serviceObjects;
    dto.ServiceObjectGroups = this.serviceObjectGroups;
    dto.VrfId = this.currentVrf.id;

    return dto;
  }

  private unsubAll() {
    [
      this.serviceObjectModalSubscription,
      this.serviceObjectGroupModalSubscription,
    ].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    this.getVrfs();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
