import { Component, OnInit, OnDestroy, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { Tier, V1TiersService, FirewallRuleGroup } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableConfig } from 'src/app/common/table/table.component';

@Component({
  selector: 'app-firewall-rule-group',
  templateUrl: './firewall-rule-group.component.html',
  styleUrls: ['./firewall-rule-group.component.scss'],
})
export class FirewallRuleGroupComponent implements OnInit, OnDestroy {
  public currentPage = 1;
  public perPage = 500;
  public currentTier: Tier;
  tiers;
  firewallRuleGroups: any;
  public fwRuleGroupModalSubscription: Subscription;
  dropdownOpen = false;
  filteredTier = false;
  filteredTierObject;
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

  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  public filterTier(filterTier: Tier): void {
    this.filteredTier = !this.filteredTier;
    this.filteredTierObject = filterTier;
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
    this.tableComponentDto = event;
    this.getTiers(event);
  }

  public getTiers(event?): void {
    // let eventParams;
    // if (event) {
    //   this.tableComponentDto.page = event.page ? event.page : 1;
    //   this.tableComponentDto.perPage = event.perPage ? event.perPage : 500;
    //   const { searchText } = event;
    //   const propertyName = event.searchColumn ? event.searchColumn : null;
    //   if (propertyName) {
    //     eventParams = `${propertyName}||cont||${searchText}`;
    //   }
    // }
    console.log('this.tableComponentDto', this.tableComponentDto);
    this.firewallRuleGroups = { data: [] };
    this.tierService
      .getManyTier({
        page: 1,
        perPage: 500,
        join: ['firewallRuleGroups'],
      })
      .subscribe(data => {
        this.tiers = data.data;
        this.tiers.map(tier => {
          tier.firewallRuleGroups.map(group => {
            console.log('group', group);
            group.tierName = tier.name;
            this.firewallRuleGroups.data.push(group);
          });
        });
        this.firewallRuleGroups.total = this.firewallRuleGroups.data.length;
        console.log('this.firewallRuleGroups', this.firewallRuleGroups);
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
