import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidatePortRange } from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-object-modal',
  templateUrl: './service-object-modal.component.html',
  styleUrls: ['./service-object-modal.component.css']
})
export class ServiceObjectModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  destinationPortSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const serviceObject = new ServiceObject();
    serviceObject.Name = this.form.value.name;
    serviceObject.Type = this.form.value.type;
    serviceObject.SourcePort = this.form.value.sourcePort;
    serviceObject.DestinationPort = this.form.value.destinationPort;

    this.ngx.resetModalData('serviceObjectModal');
    this.ngx.setModalData(Object.assign({}, serviceObject), 'serviceObjectModal');
    this.ngx.close('serviceObjectModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('serviceObjectModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
    const destinationPort = this.form.get('destinationPort');

    this.destinationPortSubscription = this.form.get('sourcePort').valueChanges
    .subscribe( value => {
      if (value) {
        destinationPort.setValidators(Validators.compose([ValidatePortRange]));
      } else {
        destinationPort.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
      }
      destinationPort.updateValueAndValidity();
    });
  }

  getData() {
    const serviceObject =  Object.assign({}, this.ngx.getModalData('serviceObjectModal') as ServiceObject);
    if (serviceObject !== undefined) {
      this.form.controls.name.setValue(serviceObject.Name);
      this.form.controls.type.setValue(serviceObject.Type);
      this.form.controls.destinationPort.setValue(serviceObject.DestinationPort);
      this.form.controls.sourcePort.setValue(serviceObject.SourcePort);
      }
    this.ngx.resetModalData('serviceObjectModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      destinationPort: ['', Validators.compose([Validators.required, ValidatePortRange])],
      sourcePort: ['', Validators.compose([ValidatePortRange])]
    });
  }

  private unsubAll() {
    if (this.destinationPortSubscription) {
      this.destinationPortSubscription.unsubscribe();
    }
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
