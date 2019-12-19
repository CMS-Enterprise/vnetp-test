import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  V1VmwareVirtualMachinesService,
  VmwareVirtualMachine,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';

@Component({
  selector: 'app-virtual-machine-modal',
  templateUrl: './virtual-machine-modal.component.html',
  styleUrls: ['./virtual-machine-modal.component.css'],
})
export class VirtualMachineModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  DatacenterId: string;
  VirtualMachineId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private virtualMachineService: V1VmwareVirtualMachinesService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualMachine = {} as VmwareVirtualMachine;

    virtualMachine.description = this.form.value.description;
    virtualMachine.cpuCores = this.form.value.cpuCount;
    virtualMachine.cpuCoresPerSocket = parseInt(this.form.value.coreCount); // TO DO - figure out type problem
    virtualMachine.cpuReserved = this.form.value.cpuReserved;
    virtualMachine.memorySize = parseInt(this.form.value.memorySize); // TO DO - convert to bytes, figure out type problem
    virtualMachine.memoryReserved = this.form.value.memoryReserved;

    this.ngx.resetModalData('virtualMachineModal');
    this.ngx.setModalData(
      Object.assign({}, virtualMachine),
      'virtualMachineModal',
    );

    if (this.ModalMode === ModalMode.Create) {
      virtualMachine.name = this.form.value.name;
      virtualMachine.datacenterId = this.DatacenterId;

      this.virtualMachineService
        .v1VmwareVirtualMachinesPost({
          vmwareVirtualMachine: virtualMachine,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.virtualMachineService
        .v1VmwareVirtualMachinesIdPut({
          id: this.VirtualMachineId,
          vmwareVirtualMachine: virtualMachine,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  cancel() {
    this.closeModal();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('virtualMachineModal') as VirtualMachineModalDto,
    );

    if (dto.DatacenterId) {
      this.DatacenterId = dto.DatacenterId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.VirtualMachineId = dto.VmwareVirtualMachine.id;
      }
    }

    const virtualMachine = dto.VmwareVirtualMachine;

    if (virtualMachine !== undefined) {
      this.form.controls.name.setValue(virtualMachine.name);
      this.form.controls.description.setValue(virtualMachine.description);
      this.form.controls.cpuCount.setValue(virtualMachine.cpuCores);
      this.form.controls.coreCount.setValue(virtualMachine.cpuCoresPerSocket);
      this.form.controls.cpuReserved.setValue(virtualMachine.cpuReserved);
      this.form.controls.memorySize.setValue(virtualMachine.memorySize);
      this.form.controls.memoryReserved.setValue(virtualMachine.memoryReserved);
    }
    this.ngx.resetModalData('virtualMachineModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      cpuCount: [''],
      coreCount: [''],
      cpuReserved: [''],
      memorySize: [''],
      memoryReserved: [''],
    });
  }

  private closeModal() {
    this.ngx.close('virtualMachineModal');
    this.reset();
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
