import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VmwareVirtualDisk, V1VmwareVirtualDisksService } from 'api_client';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import ConversionUtil from 'src/app/utils/conversion.util';

@Component({
  selector: 'app-virtual-disk-modal',
  templateUrl: './virtual-disk-modal.component.html',
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
    virtualDisk.diskSize = ConversionUtil.convertGbToBytes(this.form.value.diskSize);
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
    const dto = Object.assign({}, this.ngx.getModalData('virtualDiskModal') as VirtualMachineModalDto);
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
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      diskSize: [''],
      rawLun: [''],
    });
  }

  private closeModal() {
    this.ngx.close('virtualDiskModal');
    this.reset();
  }

  public reset() {
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
