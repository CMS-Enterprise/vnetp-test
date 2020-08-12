import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'api_client/model/tier';
import {
  V1TiersService,
  Subnet,
  Vlan,
  V1NetworkSubnetsService,
  V1NetworkVlansService,
  SubnetImportCollectionDto,
  SubnetImport,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { Tab } from 'src/app/common/tabs/tabs.component';

@Component({
  selector: 'app-subnets-vlans',
  templateUrl: './subnets-vlans.component.html',
})
export class SubnetsVlansComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  currentTier: Tier;

  currentSubnetsPage = 1;
  currentVlansPage = 1;
  perPage = 20;
  ModalMode = ModalMode;

  subnets: Subnet[] = [];
  vlans: Vlan[] = [];

  navIndex = 0;
  showRadio = false;

  public tabs: Tab[] = [{ name: 'Subnets' }, { name: 'VLANs' }];

  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  private subnetModalSubscription: Subscription;
  private vlanModalSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    public tierContextService: TierContextService,
    public helpText: SubnetsVlansHelpText,
    private tierService: V1TiersService,
    private vlanService: V1NetworkVlansService,
    private subnetService: V1NetworkSubnetsService,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  public openSubnetModal(modalMode: ModalMode, subnet?: Subnet): void {
    if (modalMode === ModalMode.Edit && !subnet) {
      throw new Error('Subnet required');
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

  public openVlanModal(modalMode: ModalMode, vlan?: Vlan): void {
    if (modalMode === ModalMode.Edit && !vlan) {
      throw new Error('VLAN required');
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
    this.subnetModalSubscription = this.ngx.getModal('subnetModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      this.getSubnets();
      this.ngx.resetModalData('subnetModal');
      this.datacenterService.unlockDatacenter();
      this.subnetModalSubscription.unsubscribe();
    });
  }

  subscribeToVlanModal() {
    this.vlanModalSubscription = this.ngx.getModal('vlanModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      this.getVlans();
      this.ngx.resetModalData('vlanModal');
      this.datacenterService.unlockDatacenter();
      this.vlanModalSubscription.unsubscribe();
    });
  }

  deleteSubnet(subnet: Subnet) {
    if (subnet.provisionedAt) {
      throw new Error('Cannot delete provisioned subnet.');
    }

    const deleteDescription = subnet.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!subnet.deletedAt) {
        this.subnetService.v1NetworkSubnetsIdSoftDelete({ id: subnet.id }).subscribe(data => {
          this.getSubnets();
        });
      } else {
        this.subnetService.v1NetworkSubnetsIdDelete({ id: subnet.id }).subscribe(data => {
          this.getSubnets();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Subnet?`, `Do you want to ${deleteDescription} subnet "${subnet.name}"?`),
      deleteFunction,
    );
  }

  restoreSubnet(subnet: Subnet) {
    if (subnet.deletedAt) {
      this.subnetService.v1NetworkSubnetsIdRestorePatch({ id: subnet.id }).subscribe(data => {
        this.getSubnets();
      });
    }
  }

  deleteVlan(vlan: Vlan) {
    if (vlan.provisionedAt) {
      throw new Error('Cannot delete provisioned VLAN.');
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
      new YesNoModalDto(`${deleteDescription} VLAN`, `Do you want to ${deleteDescription} the VLAN "${vlan.name}"?`),
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

  private confirmDeleteObject(modalDto: YesNoModalDto, deleteFunction: () => void) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFunction();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  importSubnetConfig(event: Subnet[]) {
    const modalDto = new YesNoModalDto(
      'Import Subnets',
      `Are you sure you would like to import ${event.length} subnet${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        const subnetsDto = {} as SubnetImportCollectionDto;
        subnetsDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        subnetsDto.subnets = event as SubnetImport[];

        this.subnetService
          .v1NetworkSubnetsBulkImportPost({
            subnetImportCollectionDto: subnetsDto,
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
    const modalDto = new YesNoModalDto(
      'Import VLANs',
      `Are you sure you would like to import ${event.length} VLAN${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        this.vlanService.v1NetworkVlansBulkPost({ generatedVlanBulkDto: { bulk: event } }).subscribe(data => {
          this.getVlans();
        });
      }
      this.showRadio = false;
      yesNoModalSubscription.unsubscribe();
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

  private getSubnets(): void {
    if (!this.hasCurrentTier()) {
      return;
    }
    this.tierService.v1TiersIdGet({ id: this.currentTier.id, join: 'subnets' }).subscribe(data => {
      this.subnets = data.subnets;
    });
  }

  private getVlans(getSubnets = false): void {
    if (!this.hasCurrentTier()) {
      return;
    }
    this.tierService.v1TiersIdGet({ id: this.currentTier.id, join: 'vlans' }).subscribe(data => {
      this.vlans = data.vlans;

      if (getSubnets) {
        this.getSubnets();
      }
    });
  }

  private hasCurrentTier(): boolean {
    return this.currentTier && !!this.currentTier.id;
  }

  private unsubAll(): void {
    SubscriptionUtil.unsubscribe([
      this.subnetModalSubscription,
      this.vlanModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.subnets = [];
        this.vlans = [];

        if (cd.tiers.length) {
          this.getVlans(true);
        }
      }
    });

    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        this.currentTier = ct;
        this.getObjectsForNavIndex();
      }
    });
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
