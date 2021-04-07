import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerPolicy, Tier, V1LoadBalancerPoliciesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { PolicyModalDto } from '../policy-modal/policy-modal.dto';

export interface PolicyView extends LoadBalancerPolicy {
  nameView: string;
  state: string;
}

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
})
export class PolicyListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<PolicyView> = {
    description: 'Policies in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'Type', property: 'type' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public policies: PolicyView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private policyChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private policiesService: V1LoadBalancerPoliciesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.policyChanges = this.subscribeToPolicyModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.policyChanges, this.dataChanges]);
  }

  public delete(policy: PolicyView): void {
    this.entityService.deleteEntity(policy, {
      entityName: 'Policy',
      delete$: this.policiesService.v1LoadBalancerPoliciesIdDelete({ id: policy.id }),
      softDelete$: this.policiesService.v1LoadBalancerPoliciesIdSoftDelete({ id: policy.id }),
      onSuccess: () => this.loadPolicies(),
    });
  }

  public loadPolicies(): void {
    this.isLoading = true;
    this.policiesService
      .v1LoadBalancerPoliciesGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        policies => {
          this.policies = policies.map(p => {
            return {
              ...p,
              nameView: p.name.length >= 20 ? p.name.slice(0, 19) + '...' : p.name,
              state: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.policies = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(policies: ImportPolicy[]): void {
    const bulk = policies.map(policy => {
      const { vrfName } = policy;
      if (!vrfName) {
        return policy;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...policy,
        tierId,
      };
    });

    this.policiesService
      .v1LoadBalancerPoliciesBulkPost({
        generatedLoadBalancerPolicyBulkDto: { bulk },
      })
      .subscribe(() => this.loadPolicies());
  }

  public openModal(policy?: PolicyView): void {
    const dto: PolicyModalDto = {
      tierId: this.currentTier.id,
      policy,
    };
    this.ngx.setModalData(dto, 'policyModal');
    this.ngx.open('policyModal');
  }

  public restore(policy: PolicyView): void {
    if (!policy.deletedAt) {
      return;
    }
    this.policiesService.v1LoadBalancerPoliciesIdRestorePatch({ id: policy.id }).subscribe(() => this.loadPolicies());
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

  private subscribeToPolicyModal(): Subscription {
    return this.ngx.getModal('policyModal').onCloseFinished.subscribe(() => {
      this.loadPolicies();
      this.ngx.resetModalData('policyModal');
    });
  }
}

export interface ImportPolicy extends LoadBalancerPolicy {
  vrfName?: string;
}
