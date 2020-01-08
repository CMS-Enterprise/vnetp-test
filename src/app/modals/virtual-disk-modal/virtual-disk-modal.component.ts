import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VmwareVirtualDisk, V1VmwareVirtualDisksService } from 'api_client';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';

@Component({
  selector: 'app-virtual-disk-modal',
  templateUrl: './virtual-disk-modal.component.html',
  styleUrls: ['./virtual-disk-modal.component.css'],
})
export class VirtualDiskModalComponent implements OnInit {
  form: FormGroup;
  VirtualMachineId: string;
  submitted: boolean;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private virtualDiskService: V1VmwareVirtualDisksService,
  ) {}

  save() {
    if (this.form.invalid) {
      return;
    }

    const virtualDisk = {} as VmwareVirtualDisk;
    virtualDisk.name = this.form.value.name;
    virtualDisk.description = this.form.value.description;
    virtualDisk.diskSize = this.form.value.diskSize;
    virtualDisk.rawLun = this.form.value.rawLun;
    virtualDisk.virtualMachineId = this.VirtualMachineId;

    this.ngx.resetModalData('virtualDiskModal');
    this.ngx.setModalData(Object.assign({}, virtualDisk), 'virtualDiskModal');

    this.virtualDiskService
      .v1VmwareVirtualDisksPost({
        vmwareVirtualDisk: virtualDisk,
      })
      .subscribe(
        data => {
          this.closeModal();
        },
        error => {},
      );
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('virtualDiskModal') as VirtualMachineModalDto,
    );
    this.VirtualMachineId = dto.VirtualMachineId;
  }

  cancel() {
    this.closeModal();
  }

  get f() {
    return this.form.controls;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      diskSize: [''],
      rawLun: [''],
    });
  }

  private closeModal() {
    this.ngx.close('virtualDiskModal');
    this.reset();
  }

  private reset() {
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
