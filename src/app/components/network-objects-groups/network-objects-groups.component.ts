import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObjectDto } from 'src/app/models/network-objects/network-object-dto';
import { Vrf } from 'src/app/models/d42/vrf';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Subscription, Observable } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { HelpersService } from 'src/app/services/helpers.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
  styleUrls: ['./network-objects-groups.component.css']
})
export class NetworkObjectsGroupsComponent implements OnInit, OnDestroy, PendingChangesGuard {
  vrfs: Vrf[];
  currentVrf: Vrf;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  deletedNetworkObjects: Array<NetworkObject>;
  deletedNetworkObjectGroups: Array<NetworkObjectGroup>;
  navIndex = 0;

  editNetworkObjectIndex: number;
  editNetworkObjectGroupIndex: number;

  networkObjectModalMode: ModalMode;
  networkObjectGroupModalMode: ModalMode;
  dirty: boolean;

  networkObjectModalSubscription: Subscription;
  networkObjectGroupModalSubscription: Subscription;
  Subnets: Array<Subnet>;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(private ngx: NgxSmartModalService, private api: AutomationApiService, private papa: Papa, private hs: HelpersService,
              public helpText: NetworkObjectsGroupsHelpText) {
    this.networkObjects = new Array<NetworkObject>();
    this.networkObjectGroups = new Array<NetworkObjectGroup>();
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
    const networkObjectDto = this.hs.getJsonCustomField(vrf, 'network_objects') as NetworkObjectDto;

    if (!networkObjectDto) {
        this.networkObjects = new Array<NetworkObject>();
        this.networkObjectGroups = new Array<NetworkObjectGroup>();
      } else {
      this.networkObjects = networkObjectDto.NetworkObjects;
      this.networkObjectGroups = networkObjectDto.NetworkObjectGroups;
      }
    this.getVrfSubnets(vrf);
  }

  getVrfSubnets(vrf: Vrf) {
    this.api.getSubnets(vrf.id).subscribe(data => {
      const result = data as SubnetResponse;
      this.Subnets = result.subnets;
    });
  }

  createNetworkObject() {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Create;

    const dto = new NetworkObjectModalDto();
    dto.Subnets = this.Subnets;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectModal');
    this.ngx.getModal('networkObjectModal').open();
  }

  createNetworkObjectGroup() {
    this.subscribeToNetworkObjectGroupModal();
    this.networkObjectGroupModalMode = ModalMode.Create;

    const dto = new NetworkObjectGroupModalDto();
    dto.Subnets = this.Subnets;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectGroupModal');
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  editNetworkObject(networkObject: NetworkObject) {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Edit;

    const dto = new NetworkObjectModalDto();
    dto.Subnets = this.Subnets;
    dto.NetworkObject = networkObject;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectModal');
    this.editNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.ngx.getModal('networkObjectModal').open();
  }

  editNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    this.subscribeToNetworkObjectGroupModal() ;
    this.networkObjectGroupModalMode = ModalMode.Edit;

    const dto = new NetworkObjectGroupModalDto();
    dto.Subnets = this.Subnets;
    dto.NetworkObjectGroup = networkObjectGroup;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectGroupModal');
    this.editNetworkObjectGroupIndex = this.networkObjectGroups.indexOf(networkObjectGroup);
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription =
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as NetworkObjectModalDto;

      if (data && data.NetworkObject) {
        this.saveNetworkObject(data.NetworkObject);
      }
      this.ngx.resetModalData('networkObjectModal');
      this.networkObjectModalSubscription.unsubscribe();
    });
  }

  subscribeToNetworkObjectGroupModal() {
    this.networkObjectGroupModalSubscription =
    this.ngx.getModal('networkObjectGroupModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as NetworkObjectGroup;

      if (data !== undefined) {
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

      if (!this.deletedNetworkObjects) { this.deletedNetworkObjects = new Array<NetworkObject>(); }
      this.deletedNetworkObjects.push(networkObject);

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

      if (!this.deletedNetworkObjectGroups) { this.deletedNetworkObjectGroups = new Array<NetworkObjectGroup>(); }
      this.deletedNetworkObjectGroups.push(networkObjectGroup);

      this.dirty = true;
    }
  }

  saveAll() {
    // TODO: Display warning if objects will be deleted.

    this.dirty = false;
    const dto = new NetworkObjectDto();

    dto.NetworkObjects = this.networkObjects;
    dto.NetworkObjectGroups = this.networkObjectGroups;
    dto.VrfId = this.currentVrf.id;

    let extra_vars: {[k: string]: any} = {};
    extra_vars.network_object_dto = dto;
    extra_vars.vrf_name = this.currentVrf.name.split('-')[1];
    extra_vars.deleted_network_objects = this.deletedNetworkObjects;
    extra_vars.deleted_network_object_groups = this.deletedNetworkObjectGroups;

    const body = { extra_vars };

    this.api.launchTemplate('save-network-object-dto', body, true).subscribe(data => {
    }, error => { this.dirty = true; });

    this.deletedNetworkObjects = new Array<NetworkObject>();
    this.deletedNetworkObjectGroups = new Array<NetworkObjectGroup>();
  }

  private unsubAll() {
    [this.networkObjectModalSubscription,
    this.networkObjectGroupModalSubscription]
    .forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  importNetworkObjectConfig(config) {
    // TODO: Import Validation
    // TODO: Validate VRF Id and display warning with confirmation if not present or mismatch current vrf.
    this.networkObjects = config.NetworkObjects;
    this.networkObjectGroups = config.NetworkObjectGroups;

    this.dirty = true;
  }

  exportNetworkObjectConfig() {
    const dto = new NetworkObjectDto();

    dto.NetworkObjects = this.networkObjects;
    dto.NetworkObjectGroups = this.networkObjectGroups;
    dto.VrfId = this.currentVrf.id;

    return dto;
  }


  ngOnInit() {
    this.getVrfs();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
