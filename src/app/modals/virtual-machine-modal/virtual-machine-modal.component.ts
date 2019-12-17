import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { VirtualMachine } from 'src/app/models/vmware/virtual-machine';

@Component({
  selector: 'app-virtual-machine-modal',
  templateUrl: './virtual-machine-modal.component.html',
  styleUrls: ['./virtual-machine-modal.component.css'],
})
export class VirtualMachineModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualMachine = new VirtualMachine();
    virtualMachine.Name = this.form.value.name;
    virtualMachine.Description = this.form.value.description;
    virtualMachine.CpuCount = this.form.value.cpuCount;
    virtualMachine.CoreCount = this.form.value.coreCount;
    virtualMachine.CpuReserved = this.form.value.cpuReserved;
    virtualMachine.MemorySize = this.form.value.memorySize;
    virtualMachine.MemoryReserved = this.form.value.memoryReserved;
    virtualMachine.VirtualDatacenter = this.form.value.virtualDatacenter;

    this.ngx.resetModalData('virtualMachineModal');
    this.ngx.setModalData(
      Object.assign({}, virtualMachine),
      'virtualMachineModal',
    );
    this.ngx.close('virtualMachineModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('virtualMachineModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const virtualMachine = Object.assign(
      {},
      this.ngx.getModalData('virtualMachineModal') as VirtualMachine,
    );
    if (virtualMachine !== undefined) {
      this.form.controls.name.setValue(virtualMachine.Name);
      this.form.controls.description.setValue(virtualMachine.Description);
      this.form.controls.virtualDatacenter.setValue(
        virtualMachine.VirtualDatacenter,
      );
      this.form.controls.cpuCount.setValue(virtualMachine.CpuCount);
      this.form.controls.coreCount.setValue(virtualMachine.CoreCount);
      this.form.controls.cpuReserved.setValue(virtualMachine.CpuReserved);
      this.form.controls.memorySize.setValue(virtualMachine.MemorySize);
      this.form.controls.memoryReserved.setValue(virtualMachine.MemoryReserved);
    }
    this.ngx.resetModalData('virtualMachineModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      virtualDatacenter: [''],
      cpuCount: [''],
      coreCount: [''],
      cpuReserved: [''],
      memorySize: [''],
      memoryReserved: [''],
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
