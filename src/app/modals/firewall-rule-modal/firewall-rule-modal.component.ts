import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NetworkSecurityProfileRule } from 'src/app/models/network-security-profile-rule';

@Component({
  selector: 'app-firewall-rule-modal',
  templateUrl: './firewall-rule-modal.component.html',
  styleUrls: ['./firewall-rule-modal.component.css']
})
export class FirewallRuleModalComponent implements OnInit {
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

    const firewallRule = new NetworkSecurityProfileRule();
    firewallRule.Name = this.form.value.name;
    firewallRule.Action = this.form.value.action;
    firewallRule.SourceIP = this.form.value.sourceIp;
    firewallRule.SourcePorts = this.form.value.sourcePort;
    firewallRule.DestinationIP = this.form.value.destinationIp;
    firewallRule.DestinationPorts = this.form.value.destinationPort;

    this.ngx.resetModalData('firewallRuleModal');
    this.ngx.setModalData(Object.assign({}, firewallRule), 'firewallRuleModal');
    this.ngx.close('firewallRuleModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('firewallRuleModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.buildForm();

    // Subscribe to our onOpen event so that we can load data to our form controls if it is passed.
    setTimeout(() => {
      this.ngx.getModal('firewallRuleModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        const firewallRule = Object.assign({}, modal.getData() as NetworkSecurityProfileRule);
        if (firewallRule !== undefined) {
        this.form.controls.name.setValue(firewallRule.Name);
        this.form.controls.action.setValue(firewallRule.Action);
        this.form.controls.sourceIp.setValue(firewallRule.SourceIP);
        this.form.controls.sourcePorts.setValue(firewallRule.SourcePorts);
        this.form.controls.destinationIp.setValue(firewallRule.SourceIP);
        this.form.controls.destinationPorts.setValue(firewallRule.SourcePorts);
        }
      });
    }, 2.5 * 1000);
    // Delay on subscribe since smart modal service
    // must first discover all modals.
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      action: ['', Validators.required],
      sourceIp: ['', Validators.required],
      sourcePorts: ['', Validators.required],
      destinationIp: ['', Validators.required],
      destinationPorts: ['', Validators.required]
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }
}
