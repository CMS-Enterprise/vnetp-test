import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  GetManyLoadBalancerPolicyResponseDto,
  LoadBalancerPolicy,
  LoadBalancerPolicyTypeEnum,
  Tier,
  V1LoadBalancerPoliciesService,
} from 'client';
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
import { PolicyModalDto } from '../policy-modal/policy-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import UndeployedChangesUtil from '../../../../utils/UndeployedChangesUtil';

export interface PolicyView extends LoadBalancerPolicy {
  nameView: string;
  state: string;
}

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
})
export class PolicyListComponent implements OnInit, OnDestroy {
  public currentTier: Tier;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [{ displayName: 'Type', propertyName: 'type', propertyType: LoadBalancerPolicyTypeEnum }];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<PolicyView> = {
    description: 'Policies in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public policies = {} as GetManyLoadBalancerPolicyResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private policyChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private policiesService: V1LoadBalancerPoliciesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<LoadBalancerPolicy>();
    advancedSearchAdapterObject.setService(this.policiesService);
    advancedSearchAdapterObject.setServiceName('V1LoadBalancerPoliciesService');
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.policyChanges, this.dataChanges]);
  }

  public delete(policy: PolicyView): void {
    this.entityService.deleteEntity(policy, {
      entityName: 'Policy',
      delete$: this.policiesService.deleteOneLoadBalancerPolicy({ id: policy.id }),
      softDelete$: this.policiesService.softDeleteOneLoadBalancerPolicy({ id: policy.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadPolicies(this.tableComponentDto);
        } else {
          this.loadPolicies();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadPolicies(event);
  }

  public loadPolicies(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.tableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'name') {
        eventParams = propertyName + '||cont||' + searchText;
      } else if (propertyName) {
        eventParams = propertyName + '||eq||' + searchText;
      }
    }
    this.policiesService
      .getManyLoadBalancerPolicy({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        sort: ['updatedAt,DESC'],
      })
      .subscribe(
        response => {
          this.policies = response;
          this.policies.data = (this.policies.data as PolicyView[]).map(p => ({
            ...p,
            nameView: p.name.length >= 20 ? p.name.slice(0, 19) + '...' : p.name,
            state: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
          }));
        },
        () => {
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(policies: ImportPolicy[]): void {
    const bulk = policies.map(policy => {
      const { tierName } = policy;
      if (!tierName) {
        return policy;
      }

      const tierId = ObjectUtil.getObjectId(tierName, this.tiers);
      return {
        ...policy,
        tierId,
      };
    });

    this.policiesService
      .createManyLoadBalancerPolicy({
        createManyLoadBalancerPolicyDto: { bulk },
      })
      .subscribe(() => this.loadPolicies());
  }

  public openModal(policy?: PolicyView): void {
    const dto: PolicyModalDto = {
      tierId: this.currentTier.id,
      policy,
    };
    this.subscribeToPolicyModal();
    this.ngx.setModalData(dto, 'policyModal');
    this.ngx.open('policyModal');
  }

  public restore(policy: PolicyView): void {
    if (!policy.deletedAt) {
      return;
    }
    this.policiesService.restoreOneLoadBalancerPolicy({ id: policy.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadPolicies(this.tableComponentDto);
      } else {
        this.loadPolicies();
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
      this.loadPolicies();
    });
  }

  private subscribeToPolicyModal(): void {
    this.policyChanges = this.ngx.getModal('policyModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadPolicies(this.tableComponentDto);
      } else {
        this.loadPolicies();
      }
      this.ngx.resetModalData('policyModal');
      this.policyChanges.unsubscribe();
    });
  }

  checkUndeployedChanges(object) {
    return UndeployedChangesUtil.hasUndeployedChanges(object);
  }
}

export interface ImportPolicy extends LoadBalancerPolicy {
  tierName?: string;
}
