import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-firewall-rule-packet-tracer',
  templateUrl: './firewall-rule-packet-tracer.component.html',
})
export class FirewallRulePacketTracerComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  modalBody;
  modalTitle;
  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    console.log('initialized@!');
    this.buildForm();
  }

  save() {}

  get f() {
    return this.form.controls;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      protocol: ['', Validators.required],
      direction: ['', Validators.required],
      // Source Network Info

      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],

      // Source Service Info
      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],

      // Destination Network Info
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],

      // Destination Service Info
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      enabled: [true],
    });
  }
}
