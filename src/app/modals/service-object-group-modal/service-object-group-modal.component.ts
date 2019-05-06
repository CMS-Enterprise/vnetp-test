import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ServiceObject } from 'src/app/models/service-object';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceObjectGroup } from 'src/app/models/service-object-group';
import { ModalMode } from 'src/app/models/modal-mode';

@Component({
  selector: 'app-service-object-group-modal',
  templateUrl: './service-object-group-modal.component.html',
  styleUrls: ['./service-object-group-modal.component.css']
})
export class ServiceObjectGroupModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  serviceObjects: Array<ServiceObject>;

  editServiceObjectIndex: number;

  serviceObjectModalSubscription: Subscription;
  serviceObjectGroupModalSubscription: Subscription;

  serviceObjectModalMode: ModalMode;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
    this.serviceObjects = new Array<ServiceObject>();
   }

   save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const serviceObjectGroup = new ServiceObjectGroup();

    serviceObjectGroup.Name = this.form.value.name;
    serviceObjectGroup.Description = this.form.value.description;
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
    this.ngx.setModalData(Object.assign({}, serviceObject), 'serviceObjectModal');
    this.editServiceObjectIndex = this.serviceObjects.indexOf(serviceObject);
    this.ngx.getModal('serviceObjectModal').toggle();
  }

  subscribeToServiceObjectModal() {
    this.serviceObjectModalSubscription =
    this.ngx.getModal('serviceObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as ServiceObject;
      console.log(data);
      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveServiceObject(data);
      }
      this.ngx.resetModalData('serviceObjectModal');
      this.serviceObjectModalSubscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.buildForm();

    // Subscribe to our onOpen event so that we can load data to our form controls if it is passed.
    setTimeout(() => {
      this.ngx.getModal('serviceObjectGroupModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        const serviceObjectGroup = Object.assign({}, modal.getData() as ServiceObjectGroup);
        if (serviceObjectGroup !== undefined) {
        this.form.controls.name.setValue(serviceObjectGroup.Name);
        this.form.controls.description.setValue(serviceObjectGroup.Description);
        if (serviceObjectGroup.ServiceObjects) {
          this.serviceObjects = serviceObjectGroup.ServiceObjects;
        } else {
          this.serviceObjects = new Array<ServiceObject>();
        }
        }
      });
    }, 2.5 * 1000);
    // Delay on subscribe since smart modal service
    // must first discover all modals.
  }

  getData() {
    const serviceObjectGroup = Object.assign({}, this.ngx.getModalData('serviceObjectGroupModal') as ServiceObjectGroup);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  private reset() {
    this.submitted = false;
    this.serviceObjects = new Array<ServiceObject>();
    this.buildForm();
  }
}
