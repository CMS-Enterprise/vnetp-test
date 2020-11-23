import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ActifioApplicationGroupDto, ActifioSequenceOrderDto, V1ActifioRdcApplicationGroupsService } from 'api_client';
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
  @ViewChild('actions') actionsTemplate: TemplateRef<any>;

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

  constructor(private rdcApplicationGroupService: V1ActifioRdcApplicationGroupsService, private ngx: NgxSmartModalService) {}

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

  public deleteApplicationGroup(applicationGroup: ApplicationGroupView): void {
    const { id, name } = applicationGroup;
    const deleteFunction = () => {
      this.rdcApplicationGroupService.v1ActifioRdcApplicationGroupsIdDelete({ id }).subscribe(() => {
        this.loadApplicationGroups();
      });
    };
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
    this.rdcApplicationGroupService.v1ActifioRdcApplicationGroupsGet({}).subscribe(applicationGroups => {
      this.applicationGroups = applicationGroups.map(this.mapApplicationGroup);
      this.isLoading = false;
    });
  }

  private mapApplicationGroup(applicationGroup: ActifioApplicationGroupDto): ApplicationGroupView {
    const { id, name, sequenceOrders } = applicationGroup;
    const virtualMachineCount = sequenceOrders.reduce((total: number, sequenceOrder: ActifioSequenceOrderDto) => {
      return total + sequenceOrder.vmMembers.length;
    }, 0);
    return { id, name, virtualMachineCount };
  }
}
