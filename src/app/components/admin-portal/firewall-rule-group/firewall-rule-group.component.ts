import { Component, OnInit, OnDestroy, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { Tier, V1TiersService, FirewallRuleGroup, V1NetworkSecurityFirewallRuleGroupsService } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-firewall-rule-group',
  templateUrl: './firewall-rule-group.component.html',
  styleUrls: ['./firewall-rule-group.component.scss'],
})
export class FirewallRuleGroupComponent implements OnInit, OnDestroy {
  public currentPage = 1;
  public perPage = 20;
  public currentTier: Tier;
  tiers;
  firewallRuleGroups = { data: [], count: 1, page: 1, pageCount: 1, total: 1 } as any;
  public fwRuleGroupModalSubscription: Subscription;
  dropdownOpen = false;
  filteredTier = false;
  filteredTierObject;
  selectedTier;
  public tableComponentDto = new TableComponentDto();

  private currentTierSubscription: Subscription;

  @ViewChild('tierName') tierName: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Firewall Rule Groups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Rule Group Type', property: 'type' },
      { name: 'Tier Name', property: 'tierName' },
      // { name: 'tierName', template: () => this.tierName },
    ],
  };

  constructor(
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private tierService: V1TiersService,
    private fwRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.dropdown')) {
      console.log('this.selectedTier', this.selectedTier);
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  public filterTier(filterTier: Tier): void {
    this.filteredTier = !this.filteredTier;
    this.filteredTierObject = filterTier;
    this.selectedTier = filterTier.name;
    console.log('this.selectedTier', this.selectedTier);
    if (this.filteredTier) {
      return this.getTierByName(filterTier);
    } else {
      return this.getTiers();
    }
  }

  public getTierByName(singleTier?: Tier): void {
    this.firewallRuleGroups.data = [];
    this.filteredTier = true;
    this.tierService
      .getOneTier({
        id: singleTier.id,
        join: ['firewallRuleGroups'],
      })
      .subscribe(data => {
        data.firewallRuleGroups.map(group => {
          let fwGroup = group as any;
          fwGroup.tierName = singleTier.name;
          group = fwGroup;
        });
        this.firewallRuleGroups.data = data.firewallRuleGroups as any;
      });
  }

  public onTableEvent(event?: TableComponentDto): void {
    if (event) {
      this.tableComponentDto = event;
    }
    this.getTiers(event);
  }

  public getTiers(event?): void {
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
    console.log('this.tableComponentDto', this.tableComponentDto);
    // this.firewallRuleGroups.data = []
    // this.firewallRuleGroups.count = this.tableComponentDto.perPage;
    // this.firewallRuleGroups.page = this.tableComponentDto.page;

    this.firewallRuleGroups = { data: [], count: this.tableComponentDto.perPage, page: this.tableComponentDto.page };
    this.firewallRuleGroups;
    this.tierService
      .getManyTier({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        join: ['firewallRuleGroups'],
      })
      .subscribe(data => {
        this.tiers = data.data;
        this.tiers.map(tier => {
          tier.firewallRuleGroups = tier.firewallRuleGroups.filter(group => {
            const intravrfGroup = this.filterFirewallRuleGroup(group);
            if (!intravrfGroup) {
              return;
            }
            // console.log('group',group)
            group.tierName = tier.name;
            this.firewallRuleGroups.data.push(group);
          });
        });
        console.log('this.firewallRuleGroups', this.firewallRuleGroups);

        this.firewallRuleGroups.total = this.firewallRuleGroups.data.length;
        const pageCount = Math.ceil(this.firewallRuleGroups.total / this.firewallRuleGroups.count);
        console.log('pageCount', pageCount);
        this.firewallRuleGroups.pageCount = pageCount;
      });
  }

  public subscribeToFirewallRuleGroupModal(): void {
    this.fwRuleGroupModalSubscription = this.ngx.getModal('firewallRuleGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('firewallRuleGroupModal');
      this.fwRuleGroupModalSubscription.unsubscribe();
      if (this.filteredTier) {
        return this.getTierByName(this.filteredTierObject);
      }
      this.getTiers();
    });
  }

  public openFWRuleGroupModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToFirewallRuleGroupModal();
    this.ngx.setModalData(dto, 'firewallRuleGroupModal');
    this.ngx.getModal('firewallRuleGroupModal').open();
  }

  public filterFirewallRuleGroup = (firewallRuleGroup: FirewallRuleGroup): boolean => firewallRuleGroup.name !== 'Intravrf';

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, this.tiers, 'Error Resolving Name');
  }

  restoreFirewallRuleGroup(firewallRuleGroup): void {
    if (firewallRuleGroup.deletedAt) {
      this.fwRuleGroupService.restoreOneFirewallRuleGroup({ id: firewallRuleGroup.id }).subscribe(() => {
        // const params = this.tableContextService.getSearchLocalStorage();
        // const { filteredResults } = params;
        // if (filteredResults) {
        //   this.tableComponentDto.searchColumn = params.searchColumn;
        //   this.tableComponentDto.searchText = params.searchText;
        //   this.getFirewallRules(this.tableComponentDto);
        // } else {
        //   this.getFirewallRules();
        // }
        this.getTiers();
      });
    }
  }

  public deleteFirewallRuleGroup(firewallRuleGroup: FirewallRuleGroup): void {
    this.entityService.deleteEntity(firewallRuleGroup, {
      entityName: 'Firewall Rule',
      delete$: this.fwRuleGroupService.deleteOneFirewallRuleGroup({ id: firewallRuleGroup.id }),
      softDelete$: this.fwRuleGroupService.softDeleteOneFirewallRuleGroup({ id: firewallRuleGroup.id }),
      onSuccess: () => {
        // const params = this.tableContextService.getSearchLocalStorage();
        // const { filteredResults } = params;
        // if (filteredResults) {
        //   this.tableComponentDto.searchColumn = params.searchColumn;
        //   this.tableComponentDto.searchText = params.searchText;
        //   this.getFirewallRules(this.tableComponentDto);
        // } else {
        //   this.getFirewallRules();
        // }
        this.getTiers();
      },
    });
  }

  ngOnInit(): void {
    this.getTiers();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }

  // public importFirewallRuleGroupsConfig(event): void {
  //   const modalDto = new YesNoModalDto(
  //     'Import Firewall Rule Groups',
  //     `Are you sure you would like to import ${event.length} firewall rule group${event.length > 1 ? 's' : ''}?`,
  //   );

  //   const onConfirm = () => {
  //     const dto = this.sanitizeData(event);
  //     this.firewallRuleGroupService
  //       .createManyFirewallRuleGroup({
  //         createManyFirewallRuleGroupDto: { bulk: dto },
  //       })
  //       .subscribe(() => {
  //         this.getTiers();
  //       });
  //   };

  //   SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  // }

  // private sanitizeData(entities: any[]): any[] {
  //   return entities.map(entity => {
  //     this.mapToCsv(entity);
  //     return entity;
  //   });
  // }

  // private mapToCsv(obj: any): any {
  //   Object.entries(obj).forEach(([key, val]) => {
  //     if (val === null || val === '') {
  //       delete obj[key];
  //     }
  //     if (key === 'ipAddress') {
  //       obj[key] = String(val).trim();
  //     }
  //     if (key === 'vrf_name' || key === 'vrfName') {
  //       obj[key] = ObjectUtil.getObjectId(val as string, [this.currentTier]);
  //       obj.tierId = obj[key];
  //       delete obj[key];
  //     }
  //   });
  //   return obj;
  // }
}
