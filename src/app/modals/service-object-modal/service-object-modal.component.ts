import { Component, OnInit } from '@angular/core';
import { ServiceObject } from 'src/app/models/service-object';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidatePortRange } from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-service-object-modal',
  templateUrl: './service-object-modal.component.html',
  styleUrls: ['./service-object-modal.component.css']
})
export class ServiceObjectModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  sourcePortSubscription: Subscription;
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

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();

    // Subscribe to our onOpen event so that we can load data to our form controls if it is passed.
    setTimeout(() => {
      this.ngx.getModal('serviceObjectModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        const serviceObject = Object.assign({}, modal.getData() as ServiceObject);
        if (serviceObject !== undefined) {
        this.form.controls.name.setValue(serviceObject.Name);
        this.form.controls.type.setValue(serviceObject.Type);
        this.form.controls.destinationPort.setValue(serviceObject.DestinationPort);
        this.form.controls.sourcePort.setValue(serviceObject.SourcePort);
        }
      });
    }, 2.5 * 1000);
    // Delay on subscribe since smart modal service
    // must first discover all modals.
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      destinationPort: ['', Validators.compose([Validators.required, ValidatePortRange])],
      sourcePort: ['', Validators.compose([ValidatePortRange])]
    });
  }

  private reset() {
    this.destinationPortSubscription.unsubscribe();
    this.submitted = false;
    this.buildForm();
  }
}
