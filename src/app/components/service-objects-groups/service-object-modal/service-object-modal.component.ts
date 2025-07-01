import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ValidatePortRange } from 'src/app/validators/network-form-validators';
import { ServiceObject, V1NetworkSecurityServiceObjectsService } from 'client';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObjectModalHelpText } from 'src/app/helptext/help-text-networking';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-service-object-modal',
  templateUrl: './service-object-modal.component.html',
})
export class ServiceObjectModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  ModalMode: ModalMode;
  TierId: string;
  ServiceObjectId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    public helpText: ServiceObjectModalHelpText,
    private serviceObjectsService: V1NetworkSecurityServiceObjectsService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('serviceObjectModal');
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('serviceObjectModal') as ServiceObjectModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.ServiceObjectId = dto.ServiceObject.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.protocol.enable();
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

  public reset(): void {
    this.submitted = false;
    this.TierId = '';
    this.ServiceObjectId = '';
    this.ngx.resetModalData('serviceObjectModal');
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, protocol, sourcePorts, destinationPorts } = this.form.value;
    const serviceObject = {
      name,
      protocol,
      sourcePorts,
      destinationPorts,
    } as ServiceObject;

    if (this.ModalMode === ModalMode.Create) {
      this.createServiceObject(serviceObject);
    } else {
      this.editServiceObject(serviceObject);
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      protocol: ['', Validators.required],
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
    });
  }

  private createServiceObject(serviceObject: ServiceObject): void {
    serviceObject.tierId = this.TierId;
    this.serviceObjectsService.createOneServiceObject({ serviceObject }).subscribe(() => {
      this.closeModal();
    });
  }

  private editServiceObject(serviceObject: ServiceObject): void {
    delete serviceObject.name;
    delete serviceObject.protocol;
    delete serviceObject.tierId;
    this.serviceObjectsService
      .updateOneServiceObject({
        id: this.ServiceObjectId,
        serviceObject,
      })
      .subscribe(() => {
        this.closeModal();
      });
  }

  ngOnInit() {
    this.buildForm();
  }
}
