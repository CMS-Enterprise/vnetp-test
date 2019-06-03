import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirewallRule } from 'src/app/models/firewall/firewall-rule';
import { ValidateIpv4Any, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { ServiceObject } from 'src/app/models/service-object';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { ServiceObjectGroup } from 'src/app/models/service-object-group';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { NetworkObjectDto } from 'src/app/models/network-objects/network-object-dto';
import { ServiceObjectDto } from 'src/app/models/service-object-dto';
import { ObjectService } from 'src/app/services/object.service';
import { RuleLocation } from 'src/app/models/rule-location';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { Vrf } from 'src/app/models/d42/vrf';

@Component({
  selector: 'app-firewall-rule-modal',
  templateUrl: './firewall-rule-modal.component.html',
  styleUrls: ['./firewall-rule-modal.component.css']
})
export class FirewallRuleModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  vrfId: number;
  vrf: Vrf;

  sourceNetworkTypeSubscription: Subscription;
  sourceServiceTypeSubscription: Subscription;
  destinationNetworkTypeSubscription: Subscription;
  destinationServiceTypeSubscription: Subscription;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private automationApiService: AutomationApiService) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.form);
      return;
    }

    const firewallRule = new FirewallRule();

    firewallRule.Name = this.form.controls.name.value;
    firewallRule.Action = this.form.controls.action.value;
    firewallRule.Protocol = this.form.controls.protocol.value;
    firewallRule.Direction = this.form.controls.direction.value;
    firewallRule.Log = this.form.controls.log.value;

    const sourceNetworkType = this.form.controls.sourceNetworkType.value;
    if (sourceNetworkType  === 'ip') {
    firewallRule.SourceIP = this.form.controls.sourceIp.value;
    } else if (sourceNetworkType === 'object') {
      ObjectService.mapNetworkObject(firewallRule, this.form.controls.sourceNetworkObject.value,
         this.networkObjects, RuleLocation.Source);
    } else if (sourceNetworkType === 'objectGroup') {
      ObjectService.mapNetworkObjectGroup(firewallRule, this.form.controls.sourceNetworkObjectGroup.value,
         this.networkObjectGroups, RuleLocation.Source);
      }

    const sourceServiceType = this.form.controls.sourceServiceType.value;
    if (sourceServiceType === 'port') {
      firewallRule.SourcePorts = this.form.controls.sourcePorts.value;
    } else if (sourceServiceType === 'object') {
      ObjectService.mapServiceObject(firewallRule, this.form.controls.sourceServiceObject.value,
        this.serviceObjects, RuleLocation.Source);
    } else if (sourceServiceType === 'objectGroup') {
      ObjectService.mapServiceObjectGroup(firewallRule, this.form.controls.sourceServiceObjectGroup.value,
        this.serviceObjectGroups, RuleLocation.Source);
    }

    const destinationNetworkType = this.form.controls.destinationNetworkType.value;
    if (destinationNetworkType === 'ip') {
      firewallRule.DestinationIP = this.form.controls.destinationIp.value;
    } else if (destinationNetworkType === 'object') {
      ObjectService.mapNetworkObject(firewallRule, this.form.controls.destinationNetworkObject.value,
        this.networkObjects, RuleLocation.Destination);
    } else if (destinationNetworkType === 'objectGroup') {
      ObjectService.mapNetworkObjectGroup(firewallRule, this.form.controls.destinationNetworkObjectGroup.value,
        this.networkObjectGroups, RuleLocation.Destination);
    }

    const destinationServiceType = this.form.controls.destinationServiceType.value;
    if (destinationServiceType === 'port') {
      firewallRule.DestinationPorts = this.form.controls.destinationPorts.value;
    } else if (destinationServiceType === 'object') {
      ObjectService.mapServiceObject(firewallRule, this.form.controls.destinationServiceObject.value,
        this.serviceObjects, RuleLocation.Destination);
    } else if (destinationServiceType === 'objectGroup') {
      ObjectService.mapServiceObjectGroup(firewallRule, this.form.controls.destinationServiceObjectGroup.value,
        this.serviceObjectGroups, RuleLocation.Destination);
    }

    const dto = new FirewallRuleModalDto();
    dto.FirewallRule = firewallRule;

    this.ngx.resetModalData('firewallRuleModal');
    this.ngx.setModalData(Object.assign({}, dto), 'firewallRuleModal');
    this.ngx.close('firewallRuleModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('firewallRuleModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  getData() {
    const firewallRuleModalDto = Object.assign({}, this.ngx.getModalData('firewallRuleModal') as FirewallRuleModalDto);

    this.vrfId = firewallRuleModalDto.VrfId;
    const firewallRule = firewallRuleModalDto.FirewallRule;

    if (firewallRule !== undefined) {

        this.form.controls.name.setValue(firewallRule.Name);
        this.form.controls.action.setValue(firewallRule.Action);
        this.form.controls.protocol.setValue(firewallRule.Protocol);
        this.form.controls.direction.setValue(firewallRule.Direction);

        if (firewallRule.Log) {
          this.form.controls.log.setValue(firewallRule.Log);
        }

        if (firewallRule.SourceIP) {
          this.form.controls.sourceNetworkType.setValue('ip');
          this.form.controls.sourceIp.setValue(firewallRule.SourceIP);
        } else if (firewallRule.SourceNetworkObject) {
          this.form.controls.sourceNetworkType.setValue('object');
          this.form.controls.sourceNetworkObject.setValue(firewallRule.SourceNetworkObject);
        } else if (firewallRule.SourceNetworkObjectGroup) {
          this.form.controls.sourceNetworkType.setValue('objectGroup');
          this.form.controls.sourceNetworkObjectGroup.setValue(firewallRule.SourceNetworkObjectGroup);
        }

        if (firewallRule.SourcePorts) {
          this.form.controls.sourceServiceType.setValue('port');
          this.form.controls.sourcePorts.setValue(firewallRule.SourcePorts);
        } else if (firewallRule.SourceServiceObject) {
          this.form.controls.sourceServiceType.setValue('object');
          this.form.controls.sourceServiceObject.setValue(firewallRule.SourceServiceObject);
        } else if (firewallRule.SourceServiceObjectGroup) {
          this.form.controls.sourceServiceType.setValue('objectGroup');
          this.form.controls.sourceServiceObjectGroup.setValue(firewallRule.SourceServiceObjectGroup);
        }

        if (firewallRule.DestinationIP) {
          this.form.controls.destinationNetworkType.setValue('ip');
          this.form.controls.destinationIp.setValue(firewallRule.DestinationIP);
        } else if (firewallRule.DestinationNetworkObject) {
          this.form.controls.destinationNetworkType.setValue('object');
          this.form.controls.destinationNetworkObject.setValue(firewallRule.DestinationNetworkObject);
        } else if (firewallRule.DestinationNetworkObjectGroup) {
          this.form.controls.destinationNetworkType.setValue('objectGroup');
          this.form.controls.destinationNetworkObjectGroup.setValue(firewallRule.DestinationNetworkObjectGroup);
        }

        if (firewallRule.DestinationPorts) {
          this.form.controls.destinationServiceType.setValue('port');
          this.form.controls.destinationPorts.setValue(firewallRule.DestinationPorts);
        } else if (firewallRule.DestinationServiceObject) {
          this.form.controls.destinationServiceType.setValue('object');
          this.form.controls.destinationServiceObject.setValue(firewallRule.DestinationServiceObject);
        } else if (firewallRule.DestinationServiceObjectGroup) {
          this.form.controls.destinationServiceType.setValue('objectGroup');
          this.form.controls.destinationServiceObjectGroup.setValue(firewallRule.DestinationServiceObjectGroup);
        }

        this.form.updateValueAndValidity();
     }
    this.getVrfCustomFields();
    this.ngx.resetModalData('firewallRuleModal');
  }

  getVrfCustomFields() {
    this.automationApiService.getVrfs().subscribe(data => {

      const result = data;

      const vrf = result.find(v => v.id === this.vrfId);

      const networkObjectDto = JSON.parse(vrf.custom_fields.find(c => c.key === 'network_objects').value) as NetworkObjectDto;

      if (networkObjectDto) {
        this.networkObjects = networkObjectDto.NetworkObjects;
        this.networkObjectGroups = networkObjectDto.NetworkObjectGroups;
      }

      const serviceObjectDto = JSON.parse(vrf.custom_fields.find(c => c.key === 'service_objects').value) as ServiceObjectDto;

      if (serviceObjectDto) {
        this.serviceObjects = serviceObjectDto.ServiceObjects;
        this.serviceObjectGroups = serviceObjectDto.ServiceObjectGroups;
      }

    }, error => { console.log(error); });
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
      sourceIp: ['', Validators.compose([Validators.required, ValidateIpv4Any])],
      sourceNetworkObject: [''],
      sourceNetworkObjectGroup: [''],

      // Source Service Info
      sourceServiceType: ['port'],
      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      sourceServiceObject: [''],
      sourceServiceObjectGroup: [''],

      // Destination Network Info
      destinationNetworkType: ['ip'],
      destinationIp: ['', Validators.compose([Validators.required, ValidateIpv4Any])],
      destinationNetworkObject: [''],
      destinationNetworkObjectGroup: [''],

      // Destination Service Info
      destinationServiceType: ['port'],
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      destinationServiceObject: [''],
      destinationServiceObjectGroup: [''],

      log: [false]
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
    this.vrfId = null;
    this.submitted = false;
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
