import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { HelpersService } from 'src/app/services/helpers.service';
import { Subnet } from 'src/app/models/d42/subnet';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'api_client/model/tier';
import {
  V1TiersService,
  NetworkObject,
  V1NetworkSecurityNetworkObjectsService,
  NetworkObjectGroup,
  V1NetworkSecurityNetworkObjectGroupsService,
} from 'api_client';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
})
export class NetworkObjectsGroupsComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  tiers: Tier[];
  currentTier: Tier;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  navIndex = 0;
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
    private datacenterService: DatacenterContextService,
    private tierService: V1TiersService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private hs: HelpersService,
    public helpText: NetworkObjectsGroupsHelpText,
  ) {
    this.networkObjects = new Array<NetworkObject>();
    this.networkObjectGroups = new Array<NetworkObjectGroup>();
  }

  getNetworkObjects() {
    this.networkObjects = [];
    this.tierService
      .v1TiersIdGet({ id: this.currentTier.id, join: 'networkObjects' })
      .subscribe(data => {
        this.networkObjects = data.networkObjects;
      });
  }

  getNetworkObjectGroups() {
    this.networkObjectGroups = [];
    this.tierService
      .v1TiersIdGet({ id: this.currentTier.id, join: 'networkObjectGroups' })
      .subscribe(data => {
        this.networkObjectGroups = data.networkObjectGroups;
      });
  }

  openNetworkObjectModal(modalMode: ModalMode, networkObject?: NetworkObject) {
    if (modalMode === ModalMode.Edit && !networkObject) {
      throw new Error('Network Object required.');
    }

    const dto = new NetworkObjectModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.NetworkObject = networkObject;
    }

    this.subscribeToNetworkObjectModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectModal');
    this.ngx.getModal('networkObjectModal').open();
  }

  openNetworkObjectGroupModal(
    modalMode: ModalMode,
    networkObjectGroup: NetworkObjectGroup,
  ) {
    if (modalMode === ModalMode.Edit && !networkObjectGroup) {
      throw new Error('Network Object required.');
    }

    const dto = new NetworkObjectGroupModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.NetworkObjectGroup = networkObjectGroup;
    }

    this.subscribeToNetworkObjectGroupModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectGroupModal');
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription = this.ngx
      .getModal('networkObjectModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getNetworkObjects();
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
    // TODO: Warning Modal
    if (!networkObject.deletedAt) {
      this.networkObjectService
        .v1NetworkSecurityNetworkObjectsIdSoftDelete({ id: networkObject.id })
        .subscribe(data => {
          this.getNetworkObjects();
        });
    } else {
      this.networkObjectService
        .v1NetworkSecurityNetworkObjectsIdDelete({ id: networkObject.id })
        .subscribe(data => {
          this.getNetworkObjects();
        });
    }
  }

  deleteNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    // TODO: Warning Modal
    if (!networkObjectGroup.deletedAt) {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsIdSoftDelete({
          id: networkObjectGroup.id,
        })
        .subscribe(data => {
          this.getNetworkObjectGroups();
        });
    } else {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsIdDelete({
          id: networkObjectGroup.id,
        })
        .subscribe(data => {
          this.getNetworkObjectGroups();
        });
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
    // this.networkObjects = config.NetworkObjects;
    // this.networkObjectGroups = config.NetworkObjectGroups;
    // this.dirty = true;
  }

  exportNetworkObjectConfig() {
    // const dto = new NetworkObjectDto();
    // dto.NetworkObjects = this.networkObjects;
    // dto.NetworkObjectGroups = this.networkObjectGroups;
    // dto.VrfId = this.currentVrf.id;
    // return dto;
  }

  ngOnInit() {
    // TODO: Unsubscribe
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        // TODO: Consider refactor to use Subject instead of BehaviorSubject
        // so this null check isn't required.
        if (cd) {
          this.tiers = cd.tiers;
          this.currentTier = cd.tiers[0];
          this.getNetworkObjects();
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
