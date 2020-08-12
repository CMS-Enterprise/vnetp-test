import { Component, OnInit } from '@angular/core';
import { PriorityGroup, VmwareVirtualMachine, V1VmwareVirtualMachinesService, V1PriorityGroupsService } from 'api_client';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import ConversionUtil from 'src/app/utils/conversion.util';

@Component({
  selector: 'app-priority-group-modal',
  templateUrl: './priority-group-modal.component.html',
})
export class PriorityGroupModalComponent implements OnInit {
  public ConversionUtil = ConversionUtil;
  public ModalMode = ModalMode;

  public datacenterId: string;
  public modalMode = ModalMode.Create;
  public form: FormGroup;
  public priorityGroup: PriorityGroup;
  public submitted = false;
  public virtualMachines: SelectableVM[] = [];

  private priorityGroupId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private priorityGroupService: V1PriorityGroupsService,
    private virtualMachineService: V1VmwareVirtualMachinesService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.buildForm();
  }

  public closeModal(): void {
    this.ngx.close('priorityGroupModal');
    this.reset();
  }

  public loadPriorityGroup(): void {
    this.buildForm();
    const { modalMode, datacenterId, priorityGroup } = this.ngx.getModalData('priorityGroupModal');
    this.modalMode = modalMode;
    this.datacenterId = datacenterId;
    this.priorityGroup = priorityGroup || {};
    this.priorityGroupId = this.priorityGroup.id;

    if (modalMode === ModalMode.Edit) {
      this.f.name.setValue(priorityGroup.name);
      this.f.priority.setValue(priorityGroup.priority);
    }

    this.loadVirtualMachines(this.priorityGroupId);
  }

  public reset(): void {
    this.submitted = false;
    this.datacenterId = null;
    this.priorityGroupId = null;
    this.virtualMachines = [];
    this.ngx.resetModalData('priorityGroupModal');
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, priority } = this.form.value;
    const priorityGroup: PriorityGroup = {
      datacenterId: this.datacenterId,
      name,
      priority,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createPriorityGroup(priorityGroup);
    } else {
      this.updatePriorityGroup(priorityGroup);
    }
  }

  private loadVirtualMachines(priorityGroupId: string): void {
    const datacenterFilter = `datacenterId||eq||${this.datacenterId}`;
    const priorityGroupFilter = priorityGroupId ? `priorityGroupId||eq||${priorityGroupId}` : 'priorityGroupId||isnull';
    const filter = `${datacenterFilter},${priorityGroupFilter}`;
    this.virtualMachineService.v1VmwareVirtualMachinesGet({ filter }).subscribe(data => {
      this.virtualMachines = data.map(vm => {
        return {
          ...vm,
          isSelected: !!vm.priorityGroupId,
        };
      });
    });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      priority: [1, Validators.compose([Validators.required, Validators.min(1)])],
    });
  }

  private createPriorityGroup(priorityGroup: PriorityGroup): void {
    this.priorityGroupService
      .v1PriorityGroupsPost({
        createPriorityGroupDto: {
          ...priorityGroup,
          vmwareVirtualMachineIds: this.virtualMachines.filter(vm => vm.isSelected).map(vm => vm.id),
        },
      })
      .subscribe(() => {
        this.closeModal();
      });
  }

  private updatePriorityGroup(priorityGroup: PriorityGroup): void {
    priorityGroup.datacenterId = null;

    this.priorityGroupService
      .v1PriorityGroupsIdPut({
        id: this.priorityGroupId,
        priorityGroup,
      })
      .subscribe(() => {
        this.closeModal();
      });
  }
}

export interface SelectableVM extends VmwareVirtualMachine {
  isSelected: boolean;
}
