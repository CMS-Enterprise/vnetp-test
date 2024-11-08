import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Tier, V1TiersService, NatRuleGroup, V1NetworkSecurityNatRuleGroupsService } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-nat-rule-group',
  templateUrl: './nat-rule-group.component.html',
  styleUrls: ['./nat-rule-group.component.scss'],
})
export class NatRuleGroupComponent implements OnInit, OnDestroy {
  public currentPage = 1;
  public perPage = 20;
  public currentTier: Tier;
  tiers;
  natRuleGroups = { data: [], count: 1, page: 1, pageCount: 1, total: 1 } as any;
  public natRuleGroupModalSubscription: Subscription;
  dropdownOpen = false;
  filteredTier = false;
  filteredTierObject;
  public tableComponentDto = new TableComponentDto();

  private currentTierSubscription: Subscription;

  constructor(
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private tierService: V1TiersService,
  ) {}

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

  public filterTier(filterTier: Tier) {
    this.filteredTier = !this.filteredTier;
    this.filteredTierObject = filterTier;
    if (this.filteredTier) {
      return this.getTierByName(filterTier);
    } else {
      return this.getTiers();
    }
  }

  public getTierByName(singleTier?: Tier): void {
    this.natRuleGroups.data = [];
    this.filteredTier = true;
    this.tierService
      .getOneTier({
        id: singleTier.id,
        join: ['natRuleGroups'],
      })
      .subscribe(data => {
        data.natRuleGroups.map(group => {
          const fwGroup = group as any;
          fwGroup.tierName = singleTier.name;
          group = fwGroup;
        });
        this.natRuleGroups.data = data.natRuleGroups as any;
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
    // this.natRuleGroups.data = []
    // this.natRuleGroups.count = this.tableComponentDto.perPage;
    // this.natRuleGroups.page = this.tableComponentDto.page;

    this.natRuleGroups = { data: [], count: this.tableComponentDto.perPage, page: this.tableComponentDto.page };
    this.natRuleGroups;
    this.tierService
      .getManyTier({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        join: ['natRuleGroups'],
      })
      .subscribe(data => {
        this.tiers = data.data;
        this.tiers.map(tier => {
          tier.natRuleGroups = tier.natRuleGroups.filter(group => {
            const intravrfGroup = this.filterNatRuleGroup(group);
            if (!intravrfGroup) {
              return;
            }
            // console.log('group',group)
            group.tierName = tier.name;
            this.natRuleGroups.data.push(group);
          });
        });
        console.log('this.natRuleGroups', this.natRuleGroups);

        this.natRuleGroups.total = this.natRuleGroups.data.length;
        const pageCount = Math.ceil(this.natRuleGroups.total / this.natRuleGroups.count);
        console.log('pageCount', pageCount);
        this.natRuleGroups.pageCount = pageCount;
      });
  }

  public subscribeToNatRuleGroupModal(): void {
    this.natRuleGroupModalSubscription = this.ngx.getModal('natRuleGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('natRuleGroupModal');
      this.natRuleGroupModalSubscription.unsubscribe();
      if (this.filteredTier) {
        return this.getTierByName(this.filteredTierObject);
      }
      this.getTiers();
    });
  }

  public openFWRuleGroupModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToNatRuleGroupModal();
    this.ngx.setModalData(dto, 'natRuleGroupModal');
    this.ngx.getModal('natRuleGroupModal').open();
  }

  public filterNatRuleGroup = (natRuleGroup: NatRuleGroup): boolean => natRuleGroup.name !== 'Intravrf';

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, this.tiers, 'Error Resolving Name');
  }

  restoreNatRuleGroup(natRuleGroup): void {
    if (natRuleGroup.deletedAt) {
      this.natRuleGroupService.restoreOneNatRuleGroup({ id: natRuleGroup.id }).subscribe(() => {
        // const params = this.tableContextService.getSearchLocalStorage();
        // const { filteredResults } = params;
        // if (filteredResults) {
        //   this.tableComponentDto.searchColumn = params.searchColumn;
        //   this.tableComponentDto.searchText = params.searchText;
        //   this.getNatRules(this.tableComponentDto);
        // } else {
        //   this.getNatRules();
        // }
        this.getTiers();
      });
    }
  }

  public deleteNatRuleGroup(natRuleGroup: NatRuleGroup): void {
    this.entityService.deleteEntity(natRuleGroup, {
      entityName: 'Nat Rule',
      delete$: this.natRuleGroupService.deleteOneNatRuleGroup({ id: natRuleGroup.id }),
      softDelete$: this.natRuleGroupService.softDeleteOneNatRuleGroup({ id: natRuleGroup.id }),
      onSuccess: () => {
        // const params = this.tableContextService.getSearchLocalStorage();
        // const { filteredResults } = params;
        // if (filteredResults) {
        //   this.tableComponentDto.searchColumn = params.searchColumn;
        //   this.tableComponentDto.searchText = params.searchText;
        //   this.getNatRules(this.tableComponentDto);
        // } else {
        //   this.getNatRules();
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

  // public importNatRuleGroupsConfig(event): void {
  //   const modalDto = new YesNoModalDto(
  //     'Import Nat Rule Groups',
  //     `Are you sure you would like to import ${event.length} nat rule group${event.length > 1 ? 's' : ''}?`,
  //   );

  //   const onConfirm = () => {
  //     const dto = this.sanitizeData(event);
  //     this.natRuleGroupService
  //       .createManyNatRuleGroup({
  //         createManyNatRuleGroupDto: { bulk: dto },
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
