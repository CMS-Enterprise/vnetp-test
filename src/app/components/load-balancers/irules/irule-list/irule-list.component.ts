import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerIrule, Tier, V1LoadBalancerIrulesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { IRuleModalDto } from '../irule-modal/irule-modal.dto';

interface IRuleView extends LoadBalancerIrule {
  provisionedState: string;
  descriptionView: string;
}

@Component({
  selector: 'app-irule-list',
  templateUrl: './irule-list.component.html',
})
export class IRuleListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<IRuleView> = {
    description: 'Health Monitors in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'descriptionView' },
      { name: 'Content', property: 'content' },
      { name: 'State', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public iRules: IRuleView[] = [];
  public isLoading = false;

  private iRuleChanges: Subscription;

  constructor(private entityService: EntityService, private iRuleService: V1LoadBalancerIrulesService, private ngx: NgxSmartModalService) {}

  ngOnInit() {
    this.loadIRules();
  }

  ngAfterViewInit() {
    this.iRuleChanges = this.subscribeToIRuleModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.iRuleChanges]);
  }

  public delete(iRule: IRuleView): void {
    this.entityService.deleteEntity(iRule, {
      entityName: 'iRule',
      delete$: this.iRuleService.v1LoadBalancerIrulesIdDelete({ id: iRule.id }),
      softDelete$: this.iRuleService.v1LoadBalancerIrulesIdSoftDelete({ id: iRule.id }),
      onSuccess: () => this.loadIRules(),
    });
  }

  public loadIRules(): void {
    this.isLoading = true;
    this.iRuleService
      .v1LoadBalancerIrulesGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        iRules => {
          this.iRules = iRules.map(i => {
            return {
              ...i,
              descriptionView: i.description || '--',
              provisionedState: i.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.iRules = [];
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
      .v1LoadBalancerIrulesBulkPost({
        generatedLoadBalancerIruleBulkDto: { bulk },
      })
      .subscribe(() => this.loadIRules());
  }

  public openModal(iRule?: IRuleView): void {
    const dto: IRuleModalDto = {
      tierId: this.currentTier.id,
      iRule,
    };
    this.ngx.setModalData(dto, 'iRuleModal');
    this.ngx.getModal('iRuleModal').open();
  }

  public restore(iRule: IRuleView): void {
    if (!iRule.deletedAt) {
      return;
    }
    this.iRuleService.v1LoadBalancerIrulesIdRestorePatch({ id: iRule.id }).subscribe(() => this.loadIRules());
  }

  private subscribeToIRuleModal(): Subscription {
    return this.ngx.getModal('iRuleModal').onCloseFinished.subscribe(() => {
      this.loadIRules();
      this.ngx.resetModalData('iRuleModal');
    });
  }
}

export interface ImportIRule extends LoadBalancerIrule {
  vrfName?: string;
}
