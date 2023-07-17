import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GetManyLoadBalancerIruleResponseDto, LoadBalancerIrule, Tier, V1LoadBalancerIrulesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { IRuleModalDto } from '../irule-modal/irule-modal.dto';

export interface IRuleView extends LoadBalancerIrule {
  nameView: string;
  state: string;
  descriptionView: string;
  contentView: string;
}

@Component({
  selector: 'app-irule-list',
  templateUrl: './irule-list.component.html',
})
export class IRuleListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<IRuleView> = {
    description: 'iRules in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'Description', property: 'descriptionView' },
      { name: 'Content', property: 'contentView' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public iRules = {} as GetManyLoadBalancerIruleResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private iRuleChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private iRuleService: V1LoadBalancerIrulesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
  ) {}

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.iRuleChanges = this.subscribeToIRuleModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.iRuleChanges, this.dataChanges]);
  }

  public delete(iRule: IRuleView): void {
    this.entityService.deleteEntity(iRule, {
      entityName: 'iRule',
      delete$: this.iRuleService.deleteOneLoadBalancerIrule({ id: iRule.id }),
      softDelete$: this.iRuleService.softDeleteOneLoadBalancerIrule({ id: iRule.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadIRules(this.tableComponentDto);
        } else {
          this.loadIRules();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadIRules(event);
  }

  public loadIRules(event?): void {
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
    this.iRuleService
      .getManyLoadBalancerIrule({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.iRules = response;
          this.iRules.data = (this.iRules.data as IRuleView[]).map(i => ({
            ...i,
            nameView: i.name.length >= 20 ? i.name.slice(0, 19) + '...' : i.name,
            descriptionView: i.description ? (i.description.length >= 20 ? i.description.slice(0, 19) + '...' : i.description) : undefined,
            state: i.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            contentView: i.content ? (i.content.length >= 20 ? i.content.slice(0, 19) + '...' : i.content) : undefined,
          }));
        },
        () => {
          this.iRules = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(iRules: ImportIRule[]): void {
    const bulk = iRules.map(iRule => {
      const { vrfName } = iRule;
      if (!vrfName) {
        return iRule;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...iRule,
        tierId,
      };
    });

    this.iRuleService
      .createManyLoadBalancerIrule({
        createManyLoadBalancerIruleDto: { bulk },
      })
      .subscribe(() => this.loadIRules());
  }

  public openModal(iRule?: IRuleView): void {
    const dto: IRuleModalDto = {
      tierId: this.currentTier.id,
      iRule,
    };
    this.ngx.setModalData(dto, 'iRuleModal');
    this.ngx.open('iRuleModal');
  }

  public restore(iRule: IRuleView): void {
    if (!iRule.deletedAt) {
      return;
    }
    this.iRuleService.restoreOneLoadBalancerIrule({ id: iRule.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadIRules(this.tableComponentDto);
      } else {
        this.loadIRules();
      }
    });
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.tiers = datacenter.tiers;
      this.currentTier = tier;
      this.loadIRules();
    });
  }

  private subscribeToIRuleModal(): Subscription {
    return this.ngx.getModal('iRuleModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadIRules(this.tableComponentDto);
      } else {
        this.loadIRules();
      }
      this.ngx.resetModalData('iRuleModal');
    });
  }
}

export interface ImportIRule extends LoadBalancerIrule {
  vrfName?: string;
}
