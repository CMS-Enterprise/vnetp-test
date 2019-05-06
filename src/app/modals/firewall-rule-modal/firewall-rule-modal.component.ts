import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NetworkSecurityProfileRule } from 'src/app/models/network-security-profile-rule';
import { ValidateIpv4Address } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-firewall-rule-modal',
  templateUrl: './firewall-rule-modal.component.html',
  styleUrls: ['./firewall-rule-modal.component.css']
})
export class FirewallRuleModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  sourceNetworkTypeSubscription: Subscription;
  sourceServiceTypeSubscription: Subscription;
  destinationNetworkTypeSubscription: Subscription;
  destinationServiceTypeSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const firewallRule = new NetworkSecurityProfileRule();
    // TODO: Assign form values to firewall rule
    // TODO: Look up network and service objects from VRF

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
    this.setFormValidators();
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

  private setFormValidators() {
    const sourceIp = this.form.controls.sourceIp;
    const sourceNetworkObject = this.form.controls.sourceNetworkObject;
    const sourceNetworkObjectGroup = this.form.controls.sourceNetworkObjectGroup;

    this.sourceNetworkTypeSubscription = this.form.controls.sourceNetworkType.valueChanges.subscribe(sourceNetworkType => {
      switch (sourceNetworkType) {
        case 'ip':
          sourceIp.setValidators(Validators.compose([Validators.required, ValidateIpv4Address]));
          sourceNetworkObject.setValue(null);
          sourceNetworkObject.setValidators(null);
          sourceNetworkObjectGroup.setValue(null);
          sourceNetworkObjectGroup.setValidators(null);
          break;
        case 'object':
          sourceIp.setValue(null);
          sourceIp.setValidators(null);
          sourceNetworkObject.setValidators(Validators.required);
          sourceNetworkObjectGroup.setValue(null);
          sourceNetworkObjectGroup.setValidators(null);
          break;
        case 'objectGroup':
          sourceIp.setValue(null);
          sourceIp.setValidators(null);
          sourceNetworkObject.setValue(null);
          sourceNetworkObject.setValidators(null);
          sourceNetworkObjectGroup.setValidators(Validators.required);
          break;
        default:
        break;
      }

      sourceIp.updateValueAndValidity();
      sourceNetworkObject.updateValueAndValidity();
      sourceNetworkObjectGroup.updateValueAndValidity();
    });

    const destinationIp = this.form.controls.destinationIp;
    const destinationNetworkObject = this.form.controls.destinationNetworkObject;
    const destinationNetworkObjectGroup = this.form.controls.destinationNetworkObjectGroup;

    this.destinationNetworkTypeSubscription = this.form.controls.destinationNetworkType.valueChanges.subscribe(destinationNetworkType => {
      switch (destinationNetworkType) {
        case 'ip':
          destinationIp.setValidators(Validators.compose([Validators.required, ValidateIpv4Address]));
          destinationNetworkObject.setValue(null);
          destinationNetworkObject.setValidators(null);
          destinationNetworkObjectGroup.setValue(null);
          destinationNetworkObjectGroup.setValidators(null);
          break;
        case 'object':
          destinationIp.setValue(null);
          destinationIp.setValidators(null);
          destinationNetworkObject.setValidators(Validators.required);
          destinationNetworkObjectGroup.setValue(null);
          destinationNetworkObjectGroup.setValidators(null);
          break;
        case 'objectGroup':
          destinationIp.setValue(null);
          destinationIp.setValidators(null);
          destinationNetworkObject.setValue(null);
          destinationNetworkObject.setValidators(null);
          destinationNetworkObjectGroup.setValidators(Validators.required);
          break;
        default:
        break;
      }

      destinationIp.updateValueAndValidity();
      destinationNetworkObject.updateValueAndValidity();
      destinationNetworkObjectGroup.updateValueAndValidity();
    });
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
      sourceNetworkType: ['ip'],
      sourceIp: ['', Validators.required],
      sourceNetworkObject: [''],
      sourceNetworkObjectGroup: [''],

      // Source Service Info
      sourceServiceType: ['port'],
      sourcePorts: ['', Validators.required],
      sourceServiceObject: [''],
      sourceServiceObjectGroup: [''],

      // Destination Network Info
      destinationNetworkType: ['ip'],
      destinationIp: ['', Validators.required],
      destinationNetworkObject: [''],
      destinationNetworkObjectGroup: [''],

      // Destination Service Info
      destinationServiceType: ['port'],
      destinationPorts: ['', Validators.required],
      destinationServiceObject: [''],
      destinationServiceObjectGroup: [''],

      log: ['']
    });
  }

  private unsubAll() {
    try {
      [ this.sourceNetworkTypeSubscription, this.sourceServiceTypeSubscription,
        this.destinationNetworkTypeSubscription, this.destinationServiceTypeSubscription]
        .forEach( sub => {
          if (sub) {
            sub.unsubscribe();
          }
        });
    } catch (e) {
       console.error(e);
    }
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
  }

  ngOnDestroy(){
    this.unsubAll();
  }
}
