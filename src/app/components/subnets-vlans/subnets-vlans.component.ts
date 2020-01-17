import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'api_client/model/tier';
import {
  V1TiersService,
  Subnet,
  Vlan,
  V1NetworkSubnetsService,
  V1NetworkVlansService,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-subnets-vlans',
  templateUrl: './subnets-vlans.component.html',
})
export class SubnetsVlansComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  tiers: Tier[];
  currentTier: Tier;

  subnets: Array<Subnet>;
  vlans: Array<Vlan>;

  navIndex = 0;
  showRadio = false;
  subnetModalSubscription: Subscription;
  vlanModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.datacenterService.datacenterLockValue;
  }

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    public helpText: SubnetsVlansHelpText,
    private tierService: V1TiersService,
    private vlanService: V1NetworkVlansService,
    private subnetService: V1NetworkSubnetsService,
  ) {
    this.subnets = new Array<Subnet>();
    this.vlans = new Array<Vlan>();
  }

  getSubnets() {
    this.tierService
      .v1TiersIdGet({ id: this.currentTier.id, join: 'subnets' })
      .subscribe(data => {
        this.subnets = data.subnets;
      });
  }

  getVlans(getSubnets = false) {
    this.tierService
      .v1TiersIdGet({ id: this.currentTier.id, join: 'vlans' })
      .subscribe(data => {
        this.vlans = data.vlans;

        if (getSubnets) {
          this.getSubnets();
        }
      });
  }

  openSubnetModal(modalMode: ModalMode, subnet?: Subnet) {
    if (modalMode === ModalMode.Edit && !subnet) {
      throw new Error('Service Object required.');
    }

    const dto = new SubnetModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;
    dto.Vlans = this.vlans;

    if (modalMode === ModalMode.Edit) {
      dto.Subnet = subnet;
    }

    this.subscribeToSubnetModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'subnetModal');
    this.ngx.getModal('subnetModal').open();
  }

  openVlanModal(modalMode: ModalMode, vlan: Vlan) {
    if (modalMode === ModalMode.Edit && !vlan) {
      throw new Error('VLAN Required');
    }

    const dto = new VlanModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.Vlan = vlan;
    }

    this.subscribeToVlanModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'vlanModal');
    this.ngx.getModal('vlanModal').open();
  }

  subscribeToSubnetModal() {
    this.subnetModalSubscription = this.ngx
      .getModal('subnetModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getSubnets();
        this.ngx.resetModalData('subnetModal');
        this.datacenterService.unlockDatacenter();
        this.subnetModalSubscription.unsubscribe();
      });
  }

  subscribeToVlanModal() {
    this.vlanModalSubscription = this.ngx
      .getModal('vlanModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getVlans();
        this.ngx.resetModalData('vlanModal');
        this.datacenterService.unlockDatacenter();
        this.vlanModalSubscription.unsubscribe();
      });
  }

  deleteSubnet(subnet: Subnet) {
    if (subnet.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = subnet.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!subnet.deletedAt) {
        this.subnetService
          .v1NetworkSubnetsIdSoftDelete({ id: subnet.id })
          .subscribe(data => {
            this.getSubnets();
          });
      } else {
        this.subnetService
          .v1NetworkSubnetsIdDelete({ id: subnet.id })
          .subscribe(data => {
            this.getSubnets();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Subnet?`,
        `Do you want to ${deleteDescription} subnet "${subnet.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreSubnet(subnet: Subnet) {
    if (subnet.deletedAt) {
      this.subnetService
        .v1NetworkSubnetsIdRestorePatch({ id: subnet.id })
        .subscribe(data => {
          this.getSubnets();
        });
    }
  }

  deleteVlan(vlan: Vlan) {
    if (vlan.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = vlan.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!vlan.deletedAt) {
        this.vlanService
          .v1NetworkVlansIdSoftDelete({
            id: vlan.id,
          })
          .subscribe(data => {
            this.getVlans();
          });
      } else {
        this.vlanService
          .v1NetworkVlansIdDelete({
            id: vlan.id,
          })
          .subscribe(data => {
            this.getVlans();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} VLAN`,
        `Do you want to ${deleteDescription} the VLAN "${vlan.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreVlan(vlan: Vlan) {
    if (vlan.deletedAt) {
      this.vlanService
        .v1NetworkVlansIdRestorePatch({
          id: vlan.id,
        })
        .subscribe(data => {
          this.getVlans();
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

  importSubnetConfig(event: Subnet[]) {
    this.showRadio = true;
    const modalDto = new YesNoModalDto(
      'Import Subnets',
      `Are you sure you would like to import ${event.length} subnet${
        event.length > 1 ? 's' : ''
      }?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const modalData = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (modalData && modalData.modalYes) {
          let dto = event;
          if (modalData.allowTierChecked) {
            dto = this.sanitizeData(event);
          }
          this.subnetService
            .v1NetworkSubnetsBulkPost({
              generatedSubnetBulkDto: { bulk: dto },
            })
            .subscribe(data => {
              this.getVlans(true);
            });
        }
        this.showRadio = false;
        yesNoModalSubscription.unsubscribe();
      });
  }

  importVlansConfig(event: Vlan[]) {
    this.showRadio = true;
    const modalDto = new YesNoModalDto(
      'Import Vlans',
      `Are you sure you would like to import ${event.length} vlan${
        event.length > 1 ? 's' : ''
      }?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const modalData = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (modalData && modalData.modalYes) {
          let dto = event;
          if (modalData.allowTierChecked) {
            dto = this.sanitizeData(event);
          }
          this.vlanService
            .v1NetworkVlansBulkPost({ generatedVlanBulkDto: { bulk: dto } })
            .subscribe(data => {
              this.getVlans();
            });
        }
        this.showRadio = false;
        yesNoModalSubscription.unsubscribe();
      });
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      if (entity.vlanNumber) {
        entity.vlanNumber = Number(entity.vlanNumber);
      }
      if (!entity.tierId) {
        entity.tierId = this.currentTier.id;
      }
      return entity;
    });
  }

  getObjectsForNavIndex() {
    if (!this.currentTier) {
      return;
    }

    if (this.navIndex === 0) {
      this.getVlans(true);
    } else {
      this.getVlans();
    }
  }

  getVlanName = (id: string) => {
    return this.getObjectName(id, this.vlans);
    // tslint:disable-next-line: semicolon
  };

  private getObjectName(id: string, objects: { name: string; id?: string }[]) {
    if (objects && objects.length) {
      return objects.find(o => o.id === id).name || 'N/A';
    }
  }

  private unsubAll() {
    [
      this.subnetModalSubscription,
      this.vlanModalSubscription,
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

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.tiers = cd.tiers;
          this.currentTier = null;
          this.subnets = [];
          this.vlans = [];

          if (cd.tiers.length) {
            this.currentTier = cd.tiers[0];
            this.getVlans(true);
          }
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
