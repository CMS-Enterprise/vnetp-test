import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Subscription } from 'rxjs';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';
import {
  V1TiersService,
  Tier,
  Datacenter,
  V1TierGroupsService,
  TierGroup,
  GetManyTierResponseDto,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
} from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableConfig } from '../../common/table/table.component';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
})
export class TiersComponent implements OnInit, OnDestroy {
  public ModalMode = ModalMode;
  public currentDatacenter: Datacenter;
  public currentTiersPage = 1;
  public perPage = 20;
  public tierGroups: TierGroup[];
  public tiers = {} as GetManyTierResponseDto;
  public tableComponentDto = new TableComponentDto();
  public exportTiers = [];
  public exportTiersLoaded = false;

  private currentDatacenterSubscription: Subscription;
  private tierModalSubscription: Subscription;
  private typeDeletemodalSubscription: Subscription;

  public isLoading = false;

  selectedTierToDelete;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('stateTemplate') stateTemplate: TemplateRef<any>;
  @ViewChild('tierGroupTemplate') tierGroupTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Tiers in the currently selected Datacenter',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'Tier Class', property: 'tierClass' },
      { name: 'Tier Type', property: 'tierType' },
      { name: 'Tier Group', template: () => this.tierGroupTemplate },
      { name: 'State', template: () => this.stateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private tierGroupService: V1TierGroupsService,
    private tierService: V1TiersService,
    private tableContextService: TableContextService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
  ) {}

  public getTierGroups(loadTiers = false): void {
    this.tierGroupService
      .getManyTierGroup({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`],
      })
      .subscribe(response => {
        this.tierGroups = response.data;

        if (loadTiers) {
          this.getTiers();
        }
      });
  }

  // gets all DCS objects belonging to every tier for ease of exporting
  public getExportTiers(): void {
    if (this.tiers.data) {
      this.exportTiersLoaded = false;
      this.tiers.data.map(tier => {
        const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
          filter: [`tierId||eq||${tier.id}`],
          sort: ['updatedAt,ASC'],
          page: 1,
          perPage: 50000,
        });
        const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
          filter: [`tierId||eq||${tier.id}`],
          sort: ['updatedAt,ASC'],
          page: 1,
          perPage: 50000,
        });
        const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
          filter: [`tierId||eq||${tier.id}`],
          sort: ['updatedAt,ASC'],
          page: 1,
          perPage: 50000,
        });

        const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
          filter: [`tierId||eq||${tier.id}`],
          sort: ['updatedAt,ASC'],
          page: 1,
          perPage: 50000,
        });

        const firewallRuleGroupRequest = this.firewallRuleGroupService.getManyFirewallRuleGroup({
          filter: [`tierId||eq||${tier.id}`],
          join: ['firewallRules'],
          page: 1,
          perPage: 50000,
        });

        const natRuleGroupRequest = this.natRuleGroupService.getManyNatRuleGroup({
          filter: [`tierId||eq||${tier.id}`],
          join: ['natRules'],
          page: 1,
          perPage: 50000,
        });
        forkJoin([
          networkObjectRequest,
          networkObjectGroupRequest,
          serviceObjectRequest,
          serviceObjectGroupRequest,
          firewallRuleGroupRequest,
          natRuleGroupRequest,
        ]).subscribe(result => {
          const networkObjects = result[0].data;
          const netObjGroups = result[1].data;
          const serviceObjects = result[2].data;
          const serviceObjectGroups = result[3].data;
          const firewallRuleGroups = result[4].data;
          const natRuleGroups = result[5].data;
          const exportTier: any = tier;
          firewallRuleGroups.map(group => {
            group.firewallRules.sort((a, b) => a.ruleIndex - b.ruleIndex);
          });
          natRuleGroups.map(group => {
            group.natRules.sort((a, b) => a.ruleIndex - b.ruleIndex);
          });
          exportTier.networkObjects = networkObjects;
          exportTier.netObjGroups = netObjGroups;
          exportTier.serviceObjects = serviceObjects;
          exportTier.serviceObjectGroups = serviceObjectGroups;
          exportTier.firewallRuleGroups = firewallRuleGroups;
          exportTier.natRuleGroups = natRuleGroups;
          this.exportTiers.push(exportTier);
          this.exportTiersLoaded = true;
        });
      });
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getTiers(event);
  }

  public getTiers(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        sort: ['updatedAt,ASC'],
      })
      .subscribe(
        data => {
          this.tiers = data;
        },
        () => {
          this.tiers = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public openTierModal(modalMode: ModalMode, tier?: Tier): void {
    const dto = new TierModalDto();

    dto.ModalMode = modalMode;
    dto.DatacenterId = this.currentDatacenter.id;

    if (modalMode === ModalMode.Edit) {
      dto.Tier = tier;
    }

    this.subscribeToTierModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'tierModal');
    this.ngx.getModal('tierModal').open();
  }

  public subscribeToTypeDeleteModal() {
    this.typeDeletemodalSubscription = this.ngx.getModal('typeDeleteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('typeDeleteModal');
      this.typeDeletemodalSubscription.unsubscribe();
      this.getTiers();
    });
  }

  public openTypeDeleteModal(tier) {
    this.selectedTierToDelete = tier;
    this.subscribeToTypeDeleteModal();
    this.ngx.getModal('typeDeleteModal').open();
  }

  public deleteTier(tier: Tier): void {
    if (tier.deletedAt) {
      this.openTypeDeleteModal(tier);
    } else {
      this.entityService.deleteEntity(tier, {
        entityName: 'Tier',
        delete$: this.tierService.deleteOneTier({ id: tier.id }),
        softDelete$: this.tierService.softDeleteOneTier({ id: tier.id }),
        onSuccess: () => {
          // get search params from local storage
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getTiers(params);
          } else {
            this.getTiers();
          }
        },
      });
    }
  }

  public restoreTier(tier: Tier): void {
    if (!tier.deletedAt) {
      return;
    }
    this.tierService.restoreOneTier({ id: tier.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getTiers(params);
      } else {
        this.getTiers();
      }
    });
  }

  public importTiersConfig(tiers: Tier[]): void {
    const tierEnding = tiers.length > 1 ? 's' : '';
    const modalDto = new YesNoModalDto(
      `Import Tier${tierEnding}`,
      `Would you like to import ${tiers.length} tier${tierEnding}?`,
      `Import Tier${tierEnding}`,
      'Cancel',
    );
    const onConfirm = () => {
      this.tierService
        .createManyTier({
          createManyTierDto: { bulk: this.sanitizeTiers(tiers) },
        })
        .subscribe(() => {
          this.getTiers();
        });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private sanitizeTiers(tiers: Tier[]): Tier[] {
    const sanitizeTier = (tier: Tier) => {
      Object.entries(tier).forEach(([key, val]) => {
        if (val === 'false' || val === 'f') {
          tier[key] = false;
        }
        if (val === 'true' || val === 't') {
          tier[key] = true;
        }
        if (val === null || val === '') {
          delete tier[key];
        }
      });
      return tier;
    };

    return tiers.map(sanitizeTier);
  }

  public getTierGroupName = (id: string): string => ObjectUtil.getObjectName(id, this.tierGroups);

  private subscribeToTierModal(): void {
    this.tierModalSubscription = this.ngx.getModal('tierModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('tierModal');
      this.datacenterContextService.unlockDatacenter();
      this.tierModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getTiers(params);
      } else {
        this.getTiers();
      }
    });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getTierGroups(true);
        // this.getExportTiers();
      }
    });
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.tierModalSubscription, this.currentDatacenterSubscription]);
  }
}
