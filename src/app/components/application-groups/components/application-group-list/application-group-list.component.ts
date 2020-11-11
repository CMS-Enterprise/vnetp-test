import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { V1ActifioApplicationGroupsService } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { Subscription } from 'rxjs';

export interface ApplicationGroupView {
  id: string;
  name: string;
  virtualMachineCount: number;
}

@Component({
  selector: 'app-application-group-list',
  templateUrl: './application-group-list.component.html',
})
export class ApplicationGroupListComponent implements OnInit, OnDestroy {
  @ViewChild('actions', { static: false }) actionsTemplate: TemplateRef<any>;

  public isLoading = false;
  public applicationGroups: ApplicationGroupView[] = [];

  public config: TableConfig<ApplicationGroupView> = {
    description: 'List of Application Groups',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'Virtual Machines',
        property: 'virtualMachineCount',
      },
      {
        name: '',
        template: () => this.actionsTemplate,
      },
    ],
  };

  private createSubscription: Subscription;

  constructor(private applicationGroupService: V1ActifioApplicationGroupsService, private ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.loadApplicationGroups();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.createSubscription]);
  }

  public openApplicationGroupModal(applicationGroupId?: string): void {
    this.ngx.setModalData({ id: applicationGroupId }, 'applicationGroupModal');

    this.createSubscription = this.ngx.getModal('applicationGroupModal').onCloseFinished.subscribe(() => {
      this.loadApplicationGroups();
    });

    this.ngx.getModal('applicationGroupModal').open();
  }

  // DPT-5274
  public deleteApplicationGroup(applicationGroup: ApplicationGroupView): void {
    const { name } = applicationGroup;
    const deleteFunction = () => this.loadApplicationGroups();
    const dto = new YesNoModalDto(
      'Delete Application Group',
      `Do you want to delete application group "${name}?"`,
      'Delete Application Group',
      'Cancel',
      'danger',
    );

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, deleteFunction);
  }

  public loadApplicationGroups(): void {
    this.applicationGroups = [];
    this.isLoading = true;
    this.applicationGroupService.v1ActifioApplicationGroupsGet().subscribe(applicationGroups => {
      this.applicationGroups = applicationGroups.map(this.mapApplicationGroup);
      this.isLoading = false;
    });
  }

  // TODO: fix back-end return type
  private mapApplicationGroup(applicationGroup: any): ApplicationGroupView {
    const { id, name, sequenceOrder } = applicationGroup;
    const virtualMachineCount = sequenceOrder.reduce((total: number, sequenceOrder: any) => {
      return total + sequenceOrder.vmMembers.length;
    }, 0);
    return { id, name, virtualMachineCount };
  }
}
