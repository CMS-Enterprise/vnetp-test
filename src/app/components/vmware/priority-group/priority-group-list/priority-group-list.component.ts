import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { PriorityGroup, V1PriorityGroupsService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-priority-group-list',
  templateUrl: './priority-group-list.component.html',
})
export class PriorityGroupListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() datacenterId: string;

  public ModalMode = ModalMode;
  public currentPage = 1;
  public perPage = 10;
  public priorityGroups: PriorityGroup[] = [];

  private priorityGroupSubscription: Subscription;

  constructor(
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private priorityGroupService: V1PriorityGroupsService,
  ) {}

  ngOnInit(): void {
    this.loadPriorityGroups();
  }

  ngAfterViewInit(): void {
    this.priorityGroupSubscription = this.subscribeToPriorityGroupChanges();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.priorityGroupSubscription]);
  }

  public deletePriorityGroup(priorityGroup: PriorityGroup): void {
    this.entityService.deleteEntity(priorityGroup, {
      entityName: 'Priority Group',
      delete$: this.priorityGroupService.v1PriorityGroupsIdDelete({ id: priorityGroup.id }),
      softDelete$: this.priorityGroupService.v1PriorityGroupsIdSoftDelete({ id: priorityGroup.id }),
      onSuccess: () => this.loadPriorityGroups(),
    });
  }

  public loadPriorityGroups(): void {
    this.priorityGroupService
      .v1PriorityGroupsGet({ filter: `datacenterId||eq||${this.datacenterId}`, join: 'vmwareVirtualMachines' })
      .subscribe(data => {
        this.priorityGroups = data;
      });
  }

  public openPriorityGroupModal(modalMode: ModalMode, priorityGroup?: PriorityGroup): void {
    this.ngx.setModalData(
      {
        datacenterId: this.datacenterId,
        modalMode,
        priorityGroup,
      },
      'priorityGroupModal',
    );
    this.ngx.getModal('priorityGroupModal').open();
  }

  public restorePriorityGroup(priorityGroup: PriorityGroup): void {
    if (!priorityGroup.deletedAt) {
      return;
    }

    this.priorityGroupService.v1PriorityGroupsIdRestorePatch({ id: priorityGroup.id }).subscribe(() => {
      this.loadPriorityGroups();
    });
  }

  private subscribeToPriorityGroupChanges(): Subscription {
    return this.ngx.getModal('priorityGroupModal').onAnyCloseEvent.subscribe(() => {
      this.loadPriorityGroups();
      this.ngx.resetModalData('priorityGroupModal');
    });
  }
}
