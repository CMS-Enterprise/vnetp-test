import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { TableConfig } from 'src/app/common/table/table.component';
import { Subscription } from 'rxjs';
import { V1ActifioRdsRecoveryPlansService } from 'api_client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ActifioRdsRecoveryPlanDto } from 'api_client/model/actifioRdsRecoveryPlanDto';

export interface RecoveryPlanView {
  id: string;
  name: string;
  state: string;
  appliances: string[];
}

@Component({
  selector: 'app-recovery-plan-list',
  templateUrl: './recovery-plan-list.component.html',
})
export class RecoveryPlanListComponent implements OnInit, OnDestroy {
  @ViewChild('actions', { static: false }) actionsTemplate: TemplateRef<any>;

  public isLoading = false;
  public recoveryPlans: RecoveryPlanView[] = [];

  public config: TableConfig<RecoveryPlanView> = {
    description: 'List of Recovery Plans',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'Status',
        property: 'state',
      },
      {
        name: 'Appliances',
        property: 'appliances',
      },
    ],
  };

  private createSubscription: Subscription;

  constructor(private rdsRecoveryPlanService: V1ActifioRdsRecoveryPlansService, private ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.loadRecoveryPlans();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.createSubscription]);
  }

  public loadRecoveryPlans(): void {
    this.recoveryPlans = [];
    this.isLoading = true;
    this.rdsRecoveryPlanService.v1ActifioRdsRecoveryPlansGet().subscribe(recoveryPlans => {
      this.recoveryPlans = recoveryPlans.map(this.mapRecoveryPlan);
      this.isLoading = false;
    });
  }

  private mapRecoveryPlan(recoveryPlan: ActifioRdsRecoveryPlanDto): RecoveryPlanView {
    const { id, name, appliances, state } = recoveryPlan;
    return { id, name, state, appliances };
  }
}
