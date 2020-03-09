import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidatePortRange } from 'src/app/validators/network-form-validators';
import { ServiceObject, V1NetworkSecurityServiceObjectsService } from 'api_client';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObjectModalHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-service-object-modal',
  templateUrl: './service-object-modal.component.html',
})
export class ServiceObjectModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  ServiceObjectId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: ServiceObjectModalHelpText,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalServiceObject = {} as ServiceObject;
    modalServiceObject.name = this.form.value.name;
    modalServiceObject.protocol = this.form.value.protocol;
    modalServiceObject.sourcePorts = this.form.value.sourcePorts;
    modalServiceObject.destinationPorts = this.form.value.destinationPorts;

    if (this.ModalMode === ModalMode.Create) {
      modalServiceObject.tierId = this.TierId;
      this.serviceObjectService
        .v1NetworkSecurityServiceObjectsPost({
          serviceObject: modalServiceObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      modalServiceObject.protocol = null;
      this.serviceObjectService
        .v1NetworkSecurityServiceObjectsIdPut({
          id: this.ServiceObjectId,
          serviceObject: modalServiceObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('serviceObjectModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('serviceObjectModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {}

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('serviceObjectModal') as ServiceObjectModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.ServiceObjectId = dto.ServiceObject.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.protocol.enable();
      }
    }

    const serviceObject = dto.ServiceObject;

    if (serviceObject !== undefined) {
      this.form.controls.name.setValue(serviceObject.name);
      this.form.controls.name.disable();
      this.form.controls.protocol.setValue(serviceObject.protocol);
      this.form.controls.protocol.disable();
      this.form.controls.destinationPorts.setValue(serviceObject.destinationPorts);
      this.form.controls.sourcePorts.setValue(serviceObject.sourcePorts);
    }
    this.ngx.resetModalData('serviceObjectModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      protocol: ['', Validators.required],
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
    });
  }

  public reset() {
    this.submitted = false;
    this.TierId = '';
    this.ServiceObjectId = '';
    this.ngx.resetModalData('serviceObjectModal');
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {}
}
