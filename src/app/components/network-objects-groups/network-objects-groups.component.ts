import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObjectDto } from 'src/app/models/network-objects/network-object-dto';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Subscription, Observable } from 'rxjs';
import { Papa } from 'ngx-papaparse';
import { HelpersService } from 'src/app/services/helpers.service';
import { Subnet } from 'src/app/models/d42/subnet';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'api_client/model/tier';
import { V1TiersService, NetworkObject } from 'api_client';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
})
export class NetworkObjectsGroupsComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  vrfs: Tier[];
  currentVrf: Tier;

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
  Subnets: Array<Subnet>;
  currentDatacenterSubscription: Subscription;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private ngx: NgxSmartModalService,
    private api: AutomationApiService,
    private datacenterService: DatacenterContextService,
    private tierService: V1TiersService,
    private papa: Papa,
    private hs: HelpersService,
    public helpText: NetworkObjectsGroupsHelpText,
  ) {
    this.networkObjects = new Array<NetworkObject>();
    this.networkObjectGroups = new Array<NetworkObjectGroup>();
  }

  getNetworkObjects() {
    this.networkObjects = [];
    this.tierService
      .v1TiersIdGet({ id: this.currentVrf.id, join: 'networkObjects' })
      .subscribe(data => {
        this.networkObjects = data.networkObjects;
      });
  }

  createNetworkObject() {
    this.datacenterService.lockDatacenter();
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Create;

    const dto = new NetworkObjectModalDto();
    dto.TierId = this.currentVrf.id;
    dto.ModalMode = ModalMode.Create;

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
    dto.NetworkObject = networkObject;
    dto.TierId = this.currentVrf.id;
    dto.ModalMode = ModalMode.Edit;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectModal');
    this.editNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.ngx.getModal('networkObjectModal').open();
  }

  editNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    this.subscribeToNetworkObjectGroupModal();
    this.networkObjectGroupModalMode = ModalMode.Edit;

    const dto = new NetworkObjectGroupModalDto();
    dto.Subnets = this.Subnets;
    dto.NetworkObjectGroup = networkObjectGroup;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectGroupModal');
    this.editNetworkObjectGroupIndex = this.networkObjectGroups.indexOf(
      networkObjectGroup,
    );
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription = this.ngx
      .getModal('networkObjectModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as NetworkObjectModalDto;

        if (data) {
          this.getNetworkObjects();
        }

        this.ngx.resetModalData('networkObjectModal');
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToNetworkObjectGroupModal() {
    this.networkObjectGroupModalSubscription = this.ngx
      .getModal('networkObjectGroupModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as NetworkObjectGroup;

        if (data !== undefined) {
          throw new Error('Not Implemented');
        }
        this.ngx.resetModalData('networkObjectGroupModal');
      });
  }

  deleteNetworkObject(networkObject: NetworkObject) {
    const index = this.networkObjects.indexOf(networkObject);
    if (index > -1) {
      this.networkObjects.splice(index, 1);
      this.dirty = true;
    }
  }

  deleteNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    const index = this.networkObjectGroups.indexOf(networkObjectGroup);
    if (index > -1) {
      this.networkObjectGroups.splice(index, 1);
      this.dirty = true;
    }
  }

  private unsubAll() {
    [
      this.networkObjectModalSubscription,
      this.networkObjectGroupModalSubscription,
      this.currentDatacenterSubscription,
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

  importNetworkObjectConfig(config) {
    // TODO: Import Validation
    // TODO: Validate VRF Id and display warning with confirmation if not present or mismatch current vrf.
    this.networkObjects = config.NetworkObjects;
    this.networkObjectGroups = config.NetworkObjectGroups;

    this.dirty = true;
  }

  exportNetworkObjectConfig() {
    const dto = new NetworkObjectDto();

    // dto.NetworkObjects = this.networkObjects;
    dto.NetworkObjectGroups = this.networkObjectGroups;
    // dto.VrfId = this.currentVrf.id;

    return dto;
  }

  ngOnInit() {
    // TODO: Unsubscribe
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        // TODO: Consider refactor to use Subject instead of BehaviorSubject
        // so this null check isn't required.
        if (cd) {
          this.vrfs = cd.tiers;
          this.currentVrf = cd.tiers[0];
          this.getNetworkObjects();
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
