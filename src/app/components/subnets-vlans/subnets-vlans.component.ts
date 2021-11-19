import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'client/model/tier';
import {
  V1TiersService,
  Subnet,
  Vlan,
  V1NetworkSubnetsService,
  V1NetworkVlansService,
  SubnetImportCollectionDto,
  SubnetImport,
} from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';

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
    private entityService: EntityService,
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
    this.subnetModalSubscription = this.ngx.getModal('subnetModal').onCloseFinished.subscribe(() => {
      this.getSubnets();
      this.ngx.resetModalData('subnetModal');
      this.datacenterService.unlockDatacenter();
      this.subnetModalSubscription.unsubscribe();
    });
  }

  subscribeToVlanModal() {
    this.vlanModalSubscription = this.ngx.getModal('vlanModal').onCloseFinished.subscribe(() => {
      this.getVlans();
      this.ngx.resetModalData('vlanModal');
      this.datacenterService.unlockDatacenter();
      this.vlanModalSubscription.unsubscribe();
    });
  }

  public deleteSubnet(subnet: Subnet): void {
    this.entityService.deleteEntity(subnet, {
      entityName: 'Subnet',
      delete$: this.subnetService.deleteOneSubnet({ id: subnet.id }),
      softDelete$: this.subnetService.softDeleteOneSubnet({ id: subnet.id }),
      onSuccess: () => this.getSubnets(),
    });
  }

  restoreSubnet(subnet: Subnet) {
    if (subnet.deletedAt) {
      this.subnetService.restoreOneSubnet({ id: subnet.id }).subscribe(() => {
        this.getSubnets();
      });
    }
  }

  public deleteVlan(vlan: Vlan): void {
    this.entityService.deleteEntity(vlan, {
      entityName: 'VLAN',
      delete$: this.vlanService.deleteOneVlan({
        id: vlan.id,
      }),
      softDelete$: this.vlanService.softDeleteOneVlan({
        id: vlan.id,
      }),
      onSuccess: () => this.getVlans(),
    });
  }

  restoreVlan(vlan: Vlan) {
    if (vlan.deletedAt) {
      this.vlanService
        .restoreOneVlan({
          id: vlan.id,
        })
        .subscribe(() => {
          this.getVlans();
        });
    }
  }

  public importSubnetConfig(event: Subnet[]): void {
    const modalDto = new YesNoModalDto(
      'Import Subnets',
      `Are you sure you would like to import ${event.length} subnet${event.length > 1 ? 's' : ''}?`,
    );
    const onConfirm = () => {
      const subnetsDto = {} as SubnetImportCollectionDto;
      subnetsDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
      subnetsDto.subnets = event as SubnetImport[];

      this.subnetService
        .bulkImportSubnetsSubnet({
          subnetImportCollectionDto: subnetsDto,
        })
        .subscribe(() => {
          this.getVlans(true);
        });
    };

    const onClose = () => {
      this.showRadio = false;
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public importVlansConfig(event: Vlan[]): void {
    const modalDto = new YesNoModalDto(
      'Import VLANs',
      `Are you sure you would like to import ${event.length} VLAN${event.length > 1 ? 's' : ''}?`,
    );
    event.map(e => {
      e.vlanNumber = Number(e.vlanNumber);

      // TODO AFTER MERGE : refactor bulk upload files to all use consistent schema
      e.tierId = this.getTierId(e['vrfName']);
    });
    const onConfirm = () => {
      this.vlanService.createManyVlan({ createManyVlanDto: { bulk: event } }).subscribe(() => {
        this.getVlans();
      });
    };
    const onClose = () => {
      this.showRadio = false;
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public getTierName = (id: string) => ObjectUtil.getObjectName(id, this.tiers);
  public getTierId = (name: string) => ObjectUtil.getObjectId(name, this.tiers);

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

  public getVlanName = (id: string) => ObjectUtil.getObjectName(id, this.vlans);

  private getSubnets(): void {
    if (!this.hasCurrentTier()) {
      return;
    }
    this.tierService.getOneTier({ id: this.currentTier.id, join: ['subnets'] }).subscribe(data => {
      this.subnets = data.subnets;
    });
  }

  private getVlans(getSubnets = false): void {
    if (!this.hasCurrentTier()) {
      return;
    }
    this.tierService.getOneTier({ id: this.currentTier.id, join: ['vlans'] }).subscribe(data => {
      this.vlans = data.vlans;

      if (getSubnets) {
        this.getSubnets();
      }
    });
  }

  private hasCurrentTier(): boolean {
    return this.currentTier && !!this.currentTier.id;
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
    SubscriptionUtil.unsubscribe([
      this.subnetModalSubscription,
      this.vlanModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }
}
