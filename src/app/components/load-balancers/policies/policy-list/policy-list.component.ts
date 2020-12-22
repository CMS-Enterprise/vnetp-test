import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerPolicy, Tier, V1LoadBalancerPoliciesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { PolicyModalDto } from '../policy-modal/policy-modal.dto';

interface PolicyView extends LoadBalancerPolicy {
  provisionedState: string;
}

@Component({
  selector: 'app-policy-list',
  templateUrl: './policy-list.component.html',
})
export class PolicyListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<PolicyView> = {
    description: 'Policies in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Provisioned', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public policies: PolicyView[] = [];
  public isLoading = false;

  private policyChanges: Subscription;

  constructor(
    private entityService: EntityService,
    private policiesService: V1LoadBalancerPoliciesService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit() {
    this.loadPolicies();
  }

  ngAfterViewInit() {
    this.policyChanges = this.subscribeToPolicyModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.policyChanges]);
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
              provisionedState: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
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
    this.ngx.getModal('policyModal').open();
  }

  public restore(policy: PolicyView): void {
    if (!policy.deletedAt) {
      return;
    }
    this.policiesService.v1LoadBalancerPoliciesIdRestorePatch({ id: policy.id }).subscribe(() => this.loadPolicies());
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
