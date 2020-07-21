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

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('virtualDiskModal');
    this.reset();
  }

  public save(): void {
    if (this.form.invalid) {
      return;
    }

    const { name, description, diskSize, rawLun } = this.form.value;
    const vmwareVirtualDisk = {
      name,
      description,
      rawLun,
      diskSize: ConversionUtil.convertGbToBytes(diskSize),
      virtualMachineId: this.VirtualMachineId,
    } as VmwareVirtualDisk;

    this.ngx.resetModalData('virtualDiskModal');
    this.ngx.setModalData(Object.assign({}, vmwareVirtualDisk), 'virtualDiskModal');

    this.virtualDiskService.v1VmwareVirtualDisksPost({ vmwareVirtualDisk }).subscribe(
      data => {
        this.closeModal();
      },
      error => {},
    );
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('virtualDiskModal') as VirtualMachineModalDto);
    this.VirtualMachineId = dto.VirtualMachineId;
  }

  public reset(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      diskSize: [''],
      rawLun: [''],
    });
  }

  ngOnInit() {
    this.buildForm();
  }
}
