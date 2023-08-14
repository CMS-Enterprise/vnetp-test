import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
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
  GetManyVlanResponseDto,
  GetManySubnetResponseDto,
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
import { TableConfig } from '../../common/table/table.component';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-subnets-vlans',
  templateUrl: './subnets-vlans.component.html',
})
export class SubnetsVlansComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  currentTier: Tier;

  perPage = 20;
  ModalMode = ModalMode;

  subnets = {} as GetManySubnetResponseDto;
  vlans = {} as GetManyVlanResponseDto;
  public subnetSearchColumns: SearchColumnConfig[] = [];
  public vlanSearchColumns: SearchColumnConfig[] = [];

  navIndex = 0;
  showRadio = false;

  public tabs: Tab[] = [{ name: 'Subnets' }, { name: 'VLANs' }];

  public isLoadingSubnets = false;
  public isLoadingVlans = false;

  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  private subnetModalSubscription: Subscription;
  private vlanModalSubscription: Subscription;

  subnetTableComponentDto = new TableComponentDto();
  vlanTableComponentDto = new TableComponentDto();

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('membersTemplate') membersTemplate: TemplateRef<any>;
  @ViewChild('addressTemplate') addressTemplate: TemplateRef<any>;
  @ViewChild('natServiceTemplate') natServiceTemplate: TemplateRef<any>;
  @ViewChild('subnetStateTemplate') subnetStateTemplate: TemplateRef<any>;
  @ViewChild('vlanStateTemplate') vlanStateTemplate: TemplateRef<any>;
  @ViewChild('vlanIdTemplate') vlanIdTemplate: TemplateRef<any>;

  public subnetConfig: TableConfig<any> = {
    description: 'Subnets in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'VLAN', template: () => this.vlanIdTemplate },
      { name: 'Network', property: 'network' },
      { name: 'Gateway', property: 'gateway' },
      { name: 'State', template: () => this.subnetStateTemplate },
      { name: 'Shared Between VRFs', property: 'sharedBetweenVrfs' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public vlanConfig: TableConfig<any> = {
    description: 'VLANs in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'VLAN Number', property: 'vlanNumber' },
      { name: 'VCD VLAN Type', property: 'vcdVlanType' },
      { name: 'State', template: () => this.vlanStateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    public tierContextService: TierContextService,
    public helpText: SubnetsVlansHelpText,
    private tierService: V1TiersService,
    private vlanService: V1NetworkVlansService,
    private subnetService: V1NetworkSubnetsService,
    private tableContextService: TableContextService,
  ) {}

  public handleTabChange(tab: Tab): void {
    // if user clicks on the same tab that they are currently on, don't load any new objects
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.tableContextService.removeSearchLocalStorage();
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  public onSubnetTableEvent(event: TableComponentDto): void {
    this.subnetTableComponentDto = event;
    this.getSubnets(event);
  }

  public onVlanTableEvent(event: TableComponentDto): void {
    this.vlanTableComponentDto = event;
    this.getVlans(false, event);
  }

  public openSubnetModal(modalMode: ModalMode, subnet?: Subnet): void {
    if (modalMode === ModalMode.Edit && !subnet) {
      throw new Error('Subnet required');
    }

    const dto = new SubnetModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

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
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.subnetTableComponentDto.searchColumn = params.searchColumn;
        this.subnetTableComponentDto.searchText = params.searchText;
        this.getSubnets(this.subnetTableComponentDto);
      } else {
        this.getSubnets();
      }
      this.ngx.resetModalData('subnetModal');
      this.datacenterService.unlockDatacenter();
      this.subnetModalSubscription.unsubscribe();
    });
  }

  subscribeToVlanModal() {
    this.vlanModalSubscription = this.ngx.getModal('vlanModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.vlanTableComponentDto.searchColumn = params.searchColumn;
        this.vlanTableComponentDto.searchText = params.searchText;
        this.getVlans(false, this.vlanTableComponentDto);
      } else {
        this.getVlans();
      }
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
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.subnetTableComponentDto.searchColumn = params.searchColumn;
          this.subnetTableComponentDto.searchText = params.searchText;
          this.getSubnets(this.subnetTableComponentDto);
        } else {
          this.getSubnets();
        }
      },
    });
  }

  restoreSubnet(subnet: Subnet) {
    if (subnet.deletedAt) {
      this.subnetService.restoreOneSubnet({ id: subnet.id }).subscribe(() => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.subnetTableComponentDto.searchColumn = params.searchColumn;
          this.subnetTableComponentDto.searchText = params.searchText;
          this.getSubnets(this.subnetTableComponentDto);
        } else {
          this.getSubnets();
        }
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
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.vlanTableComponentDto.searchColumn = params.searchColumn;
          this.vlanTableComponentDto.searchText = params.searchText;
          this.getVlans(false, this.vlanTableComponentDto);
        } else {
          this.getVlans();
        }
      },
    });
  }

  restoreVlan(vlan: Vlan) {
    if (vlan.deletedAt) {
      this.vlanService
        .restoreOneVlan({
          id: vlan.id,
        })
        .subscribe(() => {
          // get search params from local storage
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.vlanTableComponentDto.searchColumn = params.searchColumn;
            this.vlanTableComponentDto.searchText = params.searchText;
            this.getVlans(false, this.vlanTableComponentDto);
          } else {
            this.getVlans();
          }
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
    event.forEach(e => {
      e.vlanNumber = Number(e.vlanNumber);

      /* tslint:disable */
      e.tierId = this.getTierId(e['tierName']);
      /* tslint:enable */
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
      this.vlanTableComponentDto.page = 1;
      this.vlanTableComponentDto.perPage = 20;
      this.getSubnets();
    } else {
      this.subnetTableComponentDto.page = 1;
      this.subnetTableComponentDto.perPage = 20;
      this.getVlans();
    }
  }

  public getSubnets(event?): void {
    this.isLoadingSubnets = true;
    let eventParams;
    if (event) {
      this.subnetTableComponentDto.page = event.page ? event.page : 1;
      this.subnetTableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    if (!this.hasCurrentTier()) {
      return;
    }
    this.subnetService
      .getManySubnet({
        join: ['vlan'],
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.subnetTableComponentDto.page,
        limit: this.subnetTableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.subnets = response;
        },
        () => {
          this.subnets = null;
        },
        () => {
          this.isLoadingSubnets = false;
        },
      );
  }

  public getVlans(getSubnets = false, event?): void {
    this.isLoadingVlans = true;
    let eventParams;
    if (event) {
      this.vlanTableComponentDto.page = event.page ? event.page : 1;
      this.vlanTableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    if (!this.hasCurrentTier()) {
      return;
    }
    this.vlanService
      .getManyVlan({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.vlanTableComponentDto.page,
        limit: this.vlanTableComponentDto.perPage,
        sort: ['vlanNumber,ASC'],
      })
      .subscribe(
        response => {
          this.vlans = response;

          if (getSubnets) {
            this.getSubnets();
          }
        },
        () => {
          this.vlans = null;
        },
        () => {
          this.isLoadingVlans = false;
        },
      );
  }

  private hasCurrentTier(): boolean {
    return this.currentTier && !!this.currentTier.id;
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;

        if (cd.tiers.length) {
          this.getObjectsForNavIndex();
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
