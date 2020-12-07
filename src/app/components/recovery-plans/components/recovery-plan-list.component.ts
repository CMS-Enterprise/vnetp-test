import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { TableConfig } from 'src/app/common/table/table.component';
import { Subscription } from 'rxjs';
import { V1ActifioRdsRecoveryPlansService } from 'api_client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ActifioRdsRecoveryPlanDto } from 'api_client/model/actifioRdsRecoveryPlanDto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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
  @ViewChild('actions') actionsTemplate: TemplateRef<any>;

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
      {
        name: '',
        template: () => this.actionsTemplate,
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

  public executeAllRecoveryPlans(): void {
    const executeAllFunction = () => {
      this.rdsRecoveryPlanService.v1ActifioRdsRecoveryPlansExecutePost().subscribe(() => {
        this.loadRecoveryPlans();
      });
    };
    const dto = new YesNoModalDto(
      'Execute All Recovery Plans',
      `Do you want to execute all recovery plans?`,
      'Execute',
      'Cancel',
      'success',
    );

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, executeAllFunction);
  }

  public executeRecoveryPlan(recoveryPlan: RecoveryPlanView): void {
    const { id, name } = recoveryPlan;
    const executeFunction = () => {
      this.rdsRecoveryPlanService.v1ActifioRdsRecoveryPlansExecuteIdPost({ id }).subscribe(() => {
        this.loadRecoveryPlans();
      });
    };
    const dto = new YesNoModalDto(
      'Execute Recovery Plan',
      `Do you want to execute recovery plan "${name}"?`,
      'Execute Recovery Plan',
      'Cancel',
      'success',
    );

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, executeFunction);
  }

  public deleteRecoveryPlan(recoveryPlan: RecoveryPlanView): void {
    const { id, name } = recoveryPlan;
    const deleteFunction = () => {
      this.rdsRecoveryPlanService.v1ActifioRdsRecoveryPlansIdDelete({ id }).subscribe(() => {
        this.loadRecoveryPlans();
      });
    };
    const dto = new YesNoModalDto(
      'Delete Recovery Plan',
      `Do you want to delete recovery plan "${name}"?`,
      'Delete Recovery Plan',
      'Cancel',
      'danger',
    );

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, deleteFunction);
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
