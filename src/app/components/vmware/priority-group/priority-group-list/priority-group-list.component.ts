import { Component, OnInit, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { PriorityGroup, V1PriorityGroupsService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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

  constructor(private ngx: NgxSmartModalService, private priorityGroupService: V1PriorityGroupsService) {}

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
    if (priorityGroup.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const { deletedAt, id, name } = priorityGroup;
    const deleteDescription = priorityGroup.deletedAt ? 'Delete' : 'Soft-Delete';
    const deleteFn = () => {
      if (deletedAt) {
        this.priorityGroupService.v1PriorityGroupsIdDelete({ id }).subscribe(() => this.loadPriorityGroups());
      } else {
        this.priorityGroupService.v1PriorityGroupsIdSoftDelete({ id }).subscribe(() => this.loadPriorityGroups());
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Priority Group?`, `Do you want to ${deleteDescription} priority group "${name}"?`),
      deleteFn,
    );
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

  private confirmDeleteObject(modalDto: YesNoModalDto, deleteFunction: () => void): void {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFunction();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  private subscribeToPriorityGroupChanges(): Subscription {
    return this.ngx.getModal('priorityGroupModal').onAnyCloseEvent.subscribe(() => {
      this.loadPriorityGroups();
      this.ngx.resetModalData('priorityGroupModal');
    });
  }
}
