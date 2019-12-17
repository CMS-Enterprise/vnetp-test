import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { HelpersService } from 'src/app/services/helpers.service';
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
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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

  networkObjectModalSubscription: Subscription;
  networkObjectGroupModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.datacenterService.datacenterLockValue;
  }

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
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
    this.tierService
      .v1TiersIdGet({ id: this.currentTier.id, join: 'networkObjects' })
      .subscribe(data => {
        this.networkObjects = data.networkObjects;
      });
  }

  getNetworkObjectGroups() {
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
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getNetworkObjects();
        this.ngx.resetModalData('networkObjectModal');
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToNetworkObjectGroupModal() {
    this.networkObjectGroupModalSubscription = this.ngx
      .getModal('networkObjectGroupModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getNetworkObjectGroups();
        this.ngx.resetModalData('networkObjectGroupModal');
        this.datacenterService.unlockDatacenter();
      });
  }

  deleteNetworkObject(networkObject: NetworkObject) {
    if (networkObject.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = networkObject.deletedAt
      ? 'Delete'
      : 'Soft-Delete';

    const deleteFunction = () => {
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
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Network Object?`,
        `Do you want to ${deleteDescription} network object "${networkObject.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreNetworkObject(networkObject: NetworkObject) {
    if (networkObject.deletedAt) {
      this.networkObjectService
        .v1NetworkSecurityNetworkObjectsIdRestorePatch({ id: networkObject.id })
        .subscribe(data => {
          this.getNetworkObjects();
        });
    }
  }

  deleteNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    if (networkObjectGroup.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = networkObjectGroup.deletedAt
      ? 'Delete'
      : 'Soft-Delete';

    const deleteFunction = () => {
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
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Network Object Group`,
        `Do you want to ${deleteDescription} the network object group "${networkObjectGroup.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    if (networkObjectGroup.deletedAt) {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsIdRestorePatch({
          id: networkObjectGroup.id,
        })
        .subscribe(data => {
          this.getNetworkObjectGroups();
        });
    }
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          deleteFunction();
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  getObjectsForNavIndex() {
    if (this.navIndex === 0) {
      this.getNetworkObjects();
    } else {
      this.getNetworkObjectGroups();
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
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.tiers = cd.tiers;

          if (cd.tiers.length) {
            this.currentTier = cd.tiers[0];
            this.getObjectsForNavIndex();
          }
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
