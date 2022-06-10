import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { TableConfig } from 'src/app/common/table/table.component';
import { Subscription } from 'rxjs';
import { ActifioRdsRecoveryPlanDto, V1ActifioRdsRecoveryPlansService } from 'client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { SearchColumnConfig } from '../../../../common/seach-bar/search-bar.component';

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
  public recoveryPlanDtos: ActifioRdsRecoveryPlanDto[] = [];
  public searchColumns: SearchColumnConfig[] = [];

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

  public openRecoveryPlanModal(recoveryPlanId?: string): void {
    const recPlanMatch = this.recoveryPlanDtos.find(recPlan => recPlan.id === recoveryPlanId);
    this.ngx.setModalData({ id: recoveryPlanId, recPlanMatch }, 'recoveryPlanModal');

    this.createSubscription = this.ngx.getModal('recoveryPlanModal').onCloseFinished.subscribe(() => {
      this.loadRecoveryPlans();
    });

    this.ngx.getModal('recoveryPlanModal').open();
  }

  public executeAllRecoveryPlans(): void {
    const executeAllFunction = () => {
      this.rdsRecoveryPlanService.executeAllRecoveryPlansRecoveryPlan().subscribe(() => {
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
      this.rdsRecoveryPlanService.executeRecoveryPlanRecoveryPlan({ id }).subscribe(() => {
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
      this.rdsRecoveryPlanService.deleteRecoveryPlanRecoveryPlan({ id }).subscribe(() => {
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
    this.rdsRecoveryPlanService.getRecoveryPlansRecoveryPlan().subscribe((recoveryPlans: unknown) => {
      this.recoveryPlanDtos = recoveryPlans as ActifioRdsRecoveryPlanDto[];
      this.recoveryPlans = (recoveryPlans as ActifioRdsRecoveryPlanDto[]).map(this.mapRecoveryPlan);
      this.isLoading = false;
    });
  }

  private mapRecoveryPlan(recoveryPlan: ActifioRdsRecoveryPlanDto): RecoveryPlanView {
    const { id, name, appliances, state } = recoveryPlan;
    return { id, name, state, appliances };
  }
}
