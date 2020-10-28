import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { V1PhysicalServersService, PhysicalServer } from 'api_client';
import { PhysicalServerModalDto } from 'src/app/models/physical-server/physical-server-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import ConversionUtil from 'src/app/utils/ConversionUtil';

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
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const physicalServer = {} as PhysicalServer;
    physicalServer.name = this.form.value.name;
    physicalServer.description = this.form.value.description;
    physicalServer.serialNumber = this.form.value.serialNumber;
    physicalServer.deliveryDate = this.form.value.deliveryDate;
    physicalServer.localStorageType = this.form.value.localStorageType;
    physicalServer.localStorageSize = ConversionUtil.convertGbToBytes(this.form.value.localStorageSize);
    physicalServer.localStorageRequired = ConversionUtil.convertStringToBoolean(this.form.value.localStorageRequired);
    physicalServer.sanType = this.form.value.sanType;
    physicalServer.sanRequired = ConversionUtil.convertStringToBoolean(this.form.value.sanRequired);
    physicalServer.sanStorageSize = ConversionUtil.convertGbToBytes(this.form.value.sanStorageSize);

    this.ngx.resetModalData('physicalServerModal');
    this.ngx.setModalData(Object.assign({}, physicalServer), 'physicalServerModal');

    if (this.ModalMode === ModalMode.Create) {
      physicalServer.datacenterId = this.DatacenterId;

      this.physicalServerService
        .v1PhysicalServersPost({
          physicalServer,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.physicalServerService
        .v1PhysicalServersIdPut({
          id: this.PhysicalServerId,
          physicalServer,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
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
    const dto = Object.assign({}, this.ngx.getModalData('physicalServerModal') as PhysicalServerModalDto);

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
      // TO DO: type mismatch between API and client model
      const date = new Date(String(physicalServer.deliveryDate));
      const deliveryDate = date.toISOString().substring(0, 10);

      this.form.controls.name.setValue(physicalServer.name);
      this.form.controls.description.setValue(physicalServer.description);
      this.form.controls.serialNumber.setValue(physicalServer.serialNumber);
      this.form.controls.deliveryDate.setValue(deliveryDate);
      this.form.controls.localStorageType.setValue(physicalServer.localStorageType);
      this.form.controls.localStorageRequired.setValue(physicalServer.localStorageRequired);
      this.form.controls.localStorageSize.setValue(ConversionUtil.convertBytesToGb(physicalServer.localStorageSize));
      this.form.controls.sanType.setValue(physicalServer.sanType);
      this.form.controls.sanRequired.setValue(physicalServer.sanRequired);
      this.form.controls.sanStorageSize.setValue(ConversionUtil.convertBytesToGb(physicalServer.sanStorageSize));
    }
    this.ngx.resetModalData('physicalServerModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      serialNumber: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      localStorageType: ['', Validators.required],
      localStorageRequired: ['', Validators.required],
      localStorageSize: ['', Validators.required],
      sanType: ['', Validators.required],
      sanRequired: ['', Validators.required],
      sanStorageSize: ['', Validators.required],
    });
  }

  private closeModal() {
    this.ngx.close('physicalServerModal');
    this.reset();
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
