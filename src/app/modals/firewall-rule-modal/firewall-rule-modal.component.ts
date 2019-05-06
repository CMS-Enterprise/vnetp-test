import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
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
    // TODO: Assign form values to firewall rule

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
  }

  getData() {
    const firewallRule = Object.assign({}, this.ngx.getModalData('firewallRuleModal') as NetworkSecurityProfileRule);
    if (firewallRule !== undefined) {

      this.form.controls.name.setValue(firewallRule.Name);
      this.form.controls.action.setValue(firewallRule.Action);
      this.form.controls.protocol.setValue(firewallRule.Protocol);
      this.form.controls.direction.setValue(firewallRule.Direction);

      this.form.controls.sourceIp.setValue(firewallRule.SourceIP);
      this.form.controls.sourceNetworkObject.setValue(firewallRule.SourceNetworkObject);
      this.form.controls.sourceNetworkObjectGroup.setValue(firewallRule.SourceNetworkObjectGroup);

      this.form.controls.sourcePorts.setValue(firewallRule.SourcePorts);
      this.form.controls.sourceServiceObject.setValue(firewallRule.SourceServiceObject);
      this.form.controls.sourceServiceObjectGroup.setValue(firewallRule.SourceServiceObjectGroup);

      this.form.controls.destinationIp.setValue(firewallRule.DestinationIP);
      this.form.controls.destinationNetworkObject.setValue(firewallRule.DestinationNetworkObject);
      this.form.controls.destinationNetworkObjectGroup.setValue(firewallRule.DestinationNetworkObjectGroup);

      this.form.controls.destinationPorts.setValue(firewallRule.DestinationPorts);
      this.form.controls.destinationServiceObject.setValue(firewallRule.DestinationServiceObject);
      this.form.controls.destinationServiceObjectGroup.setValue(firewallRule.DestinationServiceObjectGroup);

      this.form.controls.log.setValue(firewallRule.Log);

      }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      action: ['', Validators.required],
      protocol: ['', Validators.required], // TODO: Only required when using source ports, otherwise inherited from
                                           // service object/service object group.
      direction: [''],

      // Source Network Info
      sourceIp: ['', Validators.required],
      sourceNetworkObject: [''],
      sourceNetworkObjectGroup: [''],

      // Source Service Info
      sourcePorts: ['', Validators.required],
      sourceServiceObject: [''],
      sourceServiceObjectGroup: [''],

      // Destination Network Info
      destinationIp: ['', Validators.required],
      destinationNetworkObject: [''],
      destinationNetworkObjectGroup: [''],

      // Destination Service Info
      destinationPorts: ['', Validators.required],
      destinationServiceObject: [''],
      destinationServiceObjectGroup: [''],

      log: ['']
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }
}
