import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder } from '@angular/forms';
// import { PhysicalServer } from 'src/app/models/physical-server/physical-server';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { V1PhysicalServersService, PhysicalServer } from 'api_client';
import { PhysicalServerModalDto } from 'src/app/models/physical-server/physical-server-modal-dto';

@Component({
  selector: 'app-physical-server-modal',
  templateUrl: './physical-server-modal.component.html',
})
export class PhysicalServerModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  DatacenterId: string;
  PhysicalServerId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private physicalServerService: V1PhysicalServersService,
  ) {}

  save() {
    if (this.form.invalid) {
      return;
    }

    const physicalServer = {} as PhysicalServer;
    physicalServer.name = this.form.value.name;
    physicalServer.description = this.form.value.description;
    physicalServer.serialNumber = this.form.value.serialNumber;
    physicalServer.deliveryDate = this.form.value.deliveryDate;
    physicalServer.localStorageType = this.form.value.localStorageType;
    physicalServer.localStorageSize = this.convertGbToBytes(
      this.form.value.localStorageSize,
    );
    physicalServer.localStorageRequired = this.form.value.localStorageRequired;
    physicalServer.sanType = this.form.value.sanType;
    physicalServer.sanRequired = this.form.value.sanRequired;
    physicalServer.sanStorageSize = this.convertGbToBytes(
      this.form.value.sanStorageSize,
    );

    this.ngx.resetModalData('physicalServerModal');
    this.ngx.setModalData(
      Object.assign({}, physicalServer),
      'physicalServerModal',
    );

    if (this.ModalMode === ModalMode.Create) {
      physicalServer.datacenterId = this.DatacenterId;

      this.physicalServerService
        .v1PhysicalServersPost({
          physicalServer,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.physicalServerService
        .v1PhysicalServersIdPut({
          id: this.PhysicalServerId,
          physicalServer,
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
      this.ngx.getModalData('physicalServerModal') as PhysicalServerModalDto,
    );

    if (dto.DatacenterId) {
      this.DatacenterId = dto.DatacenterId;
    }
    if (!dto.ModalMode) {
      throw Error('Modal Mode not set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.PhysicalServerId = dto.PhysicalServer.id;
      }
    }

    const physicalServer = dto.PhysicalServer;

    if (physicalServer !== undefined) {
      this.form.controls.name.setValue(physicalServer.name);
      this.form.controls.description.setValue(physicalServer.description);
      this.form.controls.serialNumber.setValue(physicalServer.serialNumber);
      // TO DO: date not showing up in edit form, displaying one day off
      this.form.controls.deliveryDate.setValue(physicalServer.deliveryDate);
      this.form.controls.localStorageType.setValue(
        physicalServer.localStorageType,
      );
      this.form.controls.localStorageRequired.setValue(
        physicalServer.localStorageRequired,
      );
      this.form.controls.localStorageSize.setValue(
        this.convertBytesToGb(physicalServer.localStorageSize),
      );
      this.form.controls.sanType.setValue(physicalServer.sanType);
      this.form.controls.sanRequired.setValue(physicalServer.sanRequired);
      this.form.controls.sanStorageSize.setValue(
        this.convertBytesToGb(physicalServer.sanStorageSize),
      );
    }
    this.ngx.resetModalData('physicalServerModal');
  }

  private convertGbToBytes(val) {
    const convertedVal = val * 1000000000;

    return convertedVal;
  }

  private convertBytesToGb(val) {
    const convertedVal = val / 1000000000;

    return convertedVal;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      description: [''],
      serialNumber: [''],
      deliveryDate: [''],
      localStorageType: [''],
      localStorageRequired: [''],
      localStorageSize: [''],
      sanType: [''],
      sanRequired: [''],
      sanStorageSize: [''],
    });
  }

  private closeModal() {
    this.ngx.close('physicalServerModal');
    this.reset();
  }

  public reset() {
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
