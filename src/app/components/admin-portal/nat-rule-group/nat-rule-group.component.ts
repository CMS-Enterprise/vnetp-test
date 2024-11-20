import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Tier, V1TiersService, NatRuleGroup, V1NetworkSecurityNatRuleGroupsService } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';

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
  natRuleGroups;
  public natRuleGroupModalSubscription: Subscription;
  public isLoadingObjects = false;
  public tableComponentDto = new TableComponentDto();

  private currentTierSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('stateTemplate') stateTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Tier Name', propertyName: 'tierId' },
    { displayName: 'Rule Group Type', propertyName: 'type' },
  ];

  public config: TableConfig<any> = {
    description: 'Nat Rule Groups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Rule Group Type', property: 'type' },
      { name: 'Tier Name', property: 'tierName' },
      { name: 'State', template: () => this.stateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideAdvancedSearch: true,
  };

  constructor(
    private tableContextService: TableContextService,
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private tierService: V1TiersService,
  ) {}

  public getNatRuleGroups(event?) {
    this.isLoadingObjects = true;
    const eventParams = [];
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        if (propertyName === 'tierId') {
          const tierId = this.getTierId(searchText);
          eventParams.push(`{"${`${propertyName}`}": {"eq": "${tierId}"}}`);
        } else if (propertyName === 'type') {
          eventParams.push(`{"${`${propertyName}`}": {"eq": "${searchText}"}}`);
        } else {
          eventParams.push(`{"${`${propertyName}`}": {"cont": "${searchText}"}}`);
        }
      }
    }
    this.natRuleGroupService
      .getManyNatRuleGroup({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        s: `{"AND": [${eventParams}], "OR": [{"name": {"eq": "External"}}, {"name": {"eq": "Intervrf"}}, {"type": {"eq": "ZoneBased"}}]}`,
      })
      .subscribe(
        data => {
          this.natRuleGroups = data;
          this.natRuleGroups.data.map(group => {
            group.tierName = this.getTierName(group.tierId);
          });
        },
        () => {
          this.isLoadingObjects = false;
        },
        () => {
          this.isLoadingObjects = false;
        },
      );
  }

  public getTiers(): void {
    this.tierService
      .getManyTier({
        page: 1,
        perPage: 500,
      })
      .subscribe(data => {
        this.tiers = data.data;
      });
  }

  public onTableEvent(event?: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getNatRuleGroups(event);
  }

  public subscribeToNatRuleGroupModal(): void {
    this.natRuleGroupModalSubscription = this.ngx.getModal('natRuleGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('natRuleGroupModal');
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults, searchString } = params;
      if (filteredResults && !searchString) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.getNatRuleGroups(this.tableComponentDto);
      } else if (filteredResults && searchString) {
        this.getNatRuleGroups(searchString);
      } else {
        this.getNatRuleGroups();
      }
      this.natRuleGroupModalSubscription.unsubscribe();
    });
  }

  public openNatRuleGroupModal(modalMode?): void {
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

  public getTierId(tierName: string): string {
    return ObjectUtil.getObjectId(tierName, this.tiers, 'Error Resolving Name');
  }

  restoreNatRuleGroup(natRuleGroup): void {
    if (natRuleGroup.deletedAt) {
      this.natRuleGroupService.restoreOneNatRuleGroup({ id: natRuleGroup.id }).subscribe(() => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getNatRuleGroups(this.tableComponentDto);
        } else if (filteredResults && searchString) {
          this.getNatRuleGroups(searchString);
        } else {
          this.getNatRuleGroups();
        }
      });
    }
  }

  public deleteNatRuleGroup(natRuleGroup: NatRuleGroup): void {
    this.entityService.deleteEntity(natRuleGroup, {
      entityName: 'Nat Rule Group',
      delete$: this.natRuleGroupService.deleteOneNatRuleGroup({ id: natRuleGroup.id }),
      softDelete$: this.natRuleGroupService.softDeleteOneNatRuleGroup({ id: natRuleGroup.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getNatRuleGroups(this.tableComponentDto);
        } else if (filteredResults && searchString) {
          this.getNatRuleGroups(searchString);
        } else {
          this.getNatRuleGroups();
        }
      },
    });
  }

  ngOnInit(): void {
    this.getTiers();
    this.getNatRuleGroups();
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
