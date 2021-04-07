import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerIrule, Tier, V1LoadBalancerIrulesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
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
  public iRules: IRuleView[] = [];
  public iRulesTable: IRuleView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private iRuleChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private iRuleService: V1LoadBalancerIrulesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.iRuleChanges = this.subscribeToIRuleModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.iRuleChanges, this.dataChanges]);
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
              nameView: i.name.length >= 20 ? i.name.slice(0, 19) + '...' : i.name,
              descriptionView: i.description
                ? i.description.length >= 20
                  ? i.description.slice(0, 19) + '...'
                  : i.description
                : undefined,
              state: i.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              contentView: i.content ? (i.content.length >= 20 ? i.content.slice(0, 19) + '...' : i.content) : undefined,
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
    this.ngx.open('iRuleModal');
  }

  public restore(iRule: IRuleView): void {
    if (!iRule.deletedAt) {
      return;
    }
    this.iRuleService.v1LoadBalancerIrulesIdRestorePatch({ id: iRule.id }).subscribe(() => this.loadIRules());
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
      this.loadIRules();
      this.ngx.resetModalData('iRuleModal');
    });
  }
}

export interface ImportIRule extends LoadBalancerIrule {
  vrfName?: string;
}
