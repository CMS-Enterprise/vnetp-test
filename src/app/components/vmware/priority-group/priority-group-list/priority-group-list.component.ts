import { Component, OnInit } from '@angular/core';
import { PriorityGroup, V1PriorityGroupsService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { PriorityGroupModalComponent } from '../priority-group-modal/priority-group-modal.component';

@Component({
  selector: 'app-priority-group-list',
  templateUrl: './priority-group-list.component.html',
})
export class PriorityGroupListComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentPage = 1;
  public perPage = 10;
  public priorityGroups: PriorityGroup[] = [];

  constructor(private priorityGroupService: V1PriorityGroupsService) {}

  ngOnInit(): void {
    this.loadPriorityGroups();
  }

  public deletePriorityGroup(priorityGroup: PriorityGroup): void {
    const deleteFn = () => {
      const { deletedAt, id } = priorityGroup;
      if (deletedAt) {
        this.priorityGroupService.v1PriorityGroupsIdDelete({ id }).subscribe(() => this.loadPriorityGroups());
      } else {
        this.priorityGroupService.v1PriorityGroupsIdSoftDelete({ id }).subscribe(() => this.loadPriorityGroups());
      }
    };
  }

  public loadPriorityGroups(): void {
    this.priorityGroupService.v1PriorityGroupsGet({}).subscribe(data => {
      this.priorityGroups = data;
    });
  }

  public openPriorityGroupModal(modalMode: ModalMode, priorityGroup?: PriorityGroup): void {}

  public restorePriorityGroup(priorityGroup: PriorityGroup): void {}
}
