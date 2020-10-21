import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActifioApplicationDto, V1AgmLogicalGroupsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';

interface SelectableVM extends ActifioApplicationDto {
  isSelected: boolean;
}

@Component({
  selector: 'app-logical-group-modal',
  templateUrl: './logical-group-modal.component.html',
})
export class LogicalGroupModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public modalTitle: string;
  public virtualMachines: SelectableVM[] = [];

  public config: TableConfig<SelectableVM> = {
    description: 'List of Selectable Virtual Machines',
    columns: [
      { name: 'Selected?', property: 'isSelected' },
      { name: 'Managed?', property: 'isManaged' },
      { name: 'Name', property: 'name' },
      { name: 'Folder Path', property: 'folderPath' },
    ],
  };

  private logicalGroupId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private logicalGroupService: V1AgmLogicalGroupsService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.logicalGroupId = null;
    this.virtualMachines = [];
  }

  public loadLogicalGroup(): void {
    const logicalGroup = this.ngx.getModalData('logicalGroupModal');
    if (!logicalGroup) {
      return;
    }
    this.logicalGroupId = logicalGroup.id;
    this.logicalGroupService.v1AgmLogicalGroupsIdMembersGet({ id: this.logicalGroupId }).subscribe(members => {
      this.virtualMachines = members.map(m => {
        return {
          ...m,
          isSelected: true,
        };
      });
    });
  }

  public onClose(): void {
    this.ngx.getModal('logicalGroupModal').close();
    this.ngx.resetModalData('logicalGroupModal');
    this.reset();
  }

  public save(): void {}

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: '',
    });
  }

  private reset(): void {
    this.virtualMachines = [];
    this.logicalGroupId = null;
  }
}
