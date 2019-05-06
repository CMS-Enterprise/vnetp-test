import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NetworkSecurityProfileRule } from 'src/app/models/network-security-profile-rule';
import { ValidateIpv4Address, ValidateIpv4Any, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { ServiceObject } from 'src/app/models/service-object';
import { NetworkObject } from 'src/app/models/network-object';
import { ServiceObjectGroup } from 'src/app/models/service-object-group';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';

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

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;

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
          sourceIp.setValidators(Validators.compose([Validators.required, ValidateIpv4Any]));
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

    const sourcePort = this.form.controls.sourcePorts;
    const sourceServiceObject = this.form.controls.sourceServiceObject;
    const sourceServiceObjectGroup = this.form.controls.sourceServiceObjectGroup;

    this.sourceServiceTypeSubscription = this.form.controls.sourceServiceType.valueChanges.subscribe(sourceServiceType => {
      switch (sourceServiceType) {
        case 'port':
          sourcePort.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
          sourceServiceObject.setValue(null);
          sourceServiceObject.setValidators(null);
          sourceServiceObjectGroup.setValue(null);
          sourceServiceObjectGroup.setValidators(null);
          break;
        case 'object':
          sourcePort.setValue(null);
          sourcePort.setValidators(null);
          sourceServiceObject.setValidators(Validators.compose([Validators.required]));
          sourceServiceObjectGroup.setValue(null);
          sourceServiceObjectGroup.setValidators(null);
          break;
          case 'objectGroup':
          sourcePort.setValue(null);
          sourcePort.setValidators(null);
          sourceServiceObject.setValue(null);
          sourceServiceObject.setValidators(null);
          sourceServiceObjectGroup.setValidators(Validators.compose([Validators.required]));
          break;
        default:
          break;
      }

      sourcePort.updateValueAndValidity();
      sourceServiceObject.updateValueAndValidity();
      sourceServiceObjectGroup.updateValueAndValidity();
    });

    const destinationIp = this.form.controls.destinationIp;
    const destinationNetworkObject = this.form.controls.destinationNetworkObject;
    const destinationNetworkObjectGroup = this.form.controls.destinationNetworkObjectGroup;

    this.destinationNetworkTypeSubscription = this.form.controls.destinationNetworkType.valueChanges.subscribe(destinationNetworkType => {
      switch (destinationNetworkType) {
        case 'ip':
          destinationIp.setValidators(Validators.compose([Validators.required, ValidateIpv4Any]));
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

    const destinationPort = this.form.controls.destinationPorts;
    const destinationServiceObject = this.form.controls.destinationServiceObject;
    const destinationServiceObjectGroup = this.form.controls.destinationServiceObjectGroup;

    this.destinationServiceTypeSubscription = this.form.controls.destinationServiceType.valueChanges.subscribe(destinationServiceType => {
      switch (destinationServiceType) {
        case 'port':
          destinationPort.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
          destinationServiceObject.setValue(null);
          destinationServiceObject.setValidators(null);
          destinationServiceObjectGroup.setValue(null);
          destinationServiceObjectGroup.setValidators(null);
          break;
        case 'object':
          destinationPort.setValue(null);
          destinationPort.setValidators(null);
          destinationServiceObject.setValidators(Validators.compose([Validators.required]));
          destinationServiceObjectGroup.setValue(null);
          destinationServiceObjectGroup.setValidators(null);
          break;
          case 'objectGroup':
          destinationPort.setValue(null);
          destinationPort.setValidators(null);
          destinationServiceObject.setValue(null);
          destinationServiceObject.setValidators(null);
          destinationServiceObjectGroup.setValidators(Validators.compose([Validators.required]));
          break;
        default:
          break;
      }

      destinationPort.updateValueAndValidity();
      destinationServiceObject.updateValueAndValidity();
      destinationServiceObjectGroup.updateValueAndValidity();
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
      [this.sourceNetworkTypeSubscription, this.sourceServiceTypeSubscription,
        this.destinationNetworkTypeSubscription, this.destinationServiceTypeSubscription]
        .forEach( sub => {
          try {
            if (sub) {
              sub.unsubscribe();
            }
          } catch (e) {
            console.error(e);
         }
        });
        }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
