import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { HelpersService } from 'src/app/services/helpers.service';
import { ServiceObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-service-object-group-modal',
  templateUrl: './service-object-group-modal.component.html',
  styleUrls: ['./service-object-group-modal.component.css']
})
export class ServiceObjectGroupModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  serviceObjects: Array<ServiceObject>;

  editServiceObjectIndex: number;

  serviceObjectModalSubscription: Subscription;

  serviceObjectModalMode: ModalMode;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private hs: HelpersService,
              public helpText: ServiceObjectGroupModalHelpText) { this.serviceObjects = new Array<ServiceObject>(); }

   save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const serviceObjectGroup = new ServiceObjectGroup();

    serviceObjectGroup.Name = this.form.value.name;
    serviceObjectGroup.Description = this.form.value.description;
    serviceObjectGroup.Type = this.form.value.type;
    serviceObjectGroup.ServiceObjects = Object.assign([], this.serviceObjects);

    this.ngx.resetModalData('serviceObjectGroupModal');
    this.ngx.setModalData(serviceObjectGroup, 'serviceObjectGroupModal');
    this.ngx.close('serviceObjectGroupModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('serviceObjectGroupModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  deleteServiceObject(serviceObject: ServiceObject) {
    const index = this.serviceObjects.indexOf(serviceObject);
    if ( index > -1) {
      this.serviceObjects.splice(index, 1);
    }
  }

  saveServiceObject(serviceObject: ServiceObject) {
    if (this.serviceObjectModalMode === ModalMode.Create) {
      this.serviceObjects.push(serviceObject);
    } else {
      this.serviceObjects[this.editServiceObjectIndex] = serviceObject;
    }
  }

  createServiceObject() {
    this.subscribeToServiceObjectModal();
    this.serviceObjectModalMode = ModalMode.Create;
    this.ngx.getModal('serviceObjectModal').toggle();
  }

  editServiceObject(serviceObject: ServiceObject) {
    this.subscribeToServiceObjectModal();
    this.serviceObjectModalMode = ModalMode.Edit;
    this.ngx.setModalData(this.hs.deepCopy(serviceObject), 'serviceObjectModal');
    this.editServiceObjectIndex = this.serviceObjects.indexOf(serviceObject);
    this.ngx.getModal('serviceObjectModal').toggle();
  }

  subscribeToServiceObjectModal() {
    this.serviceObjectModalSubscription =
    this.ngx.getModal('serviceObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as ServiceObject;
      if (data !== undefined) {
        this.saveServiceObject(data);
      }
      this.ngx.resetModalData('serviceObjectModal');
      this.serviceObjectModalSubscription.unsubscribe();
    });
  }

  getData() {
    const serviceObjectGroup = Object.assign({}, this.ngx.getModalData('serviceObjectGroupModal') as ServiceObjectGroup);
    if (serviceObjectGroup !== undefined) {
      this.form.controls.name.setValue(serviceObjectGroup.Name);
      this.form.controls.description.setValue(serviceObjectGroup.Description);
      this.form.controls.type.setValue(serviceObjectGroup.Type);
      if (serviceObjectGroup.ServiceObjects) {
        this.serviceObjects = serviceObjectGroup.ServiceObjects;
      } else {
        this.serviceObjects = new Array<ServiceObject>();
      }
    }
    this.ngx.resetModalData('serviceObjectGroupModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required]
    });
  }

  private reset() {
    this.submitted = false;
    this.serviceObjects = new Array<ServiceObject>();
    this.buildForm();
  }

  private unsubAll() {
    if (this.serviceObjectModalSubscription) {
      this.serviceObjectModalSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
