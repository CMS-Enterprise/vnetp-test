import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ValidateIpv4Any,
  ValidatePortRange,
} from 'src/app/validators/network-form-validators';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { ObjectService } from 'src/app/services/object.service';
import { RuleLocation } from 'src/app/models/firewall/rule-location';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { Vrf } from 'src/app/models/d42/vrf';
import { FirewallRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import { FirewallRule } from 'src/app/models/firewall/firewall-rule';
import { V1TiersService } from 'api_client';

@Component({
  selector: 'app-firewall-rule-modal',
  templateUrl: './firewall-rule-modal.component.html',
})
export class FirewallRuleModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  vrf: Vrf;

  sourceNetworkTypeSubscription: Subscription;
  sourceServiceTypeSubscription: Subscription;
  destinationNetworkTypeSubscription: Subscription;
  destinationServiceTypeSubscription: Subscription;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;
  FirewallRuleGroupId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private tierService: V1TiersService,
    public helpText: FirewallRuleModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.form);
      return;
    }

    const firewallRule = {} as FirewallRule;

    firewallRule.Name = this.form.controls.name.value;
    firewallRule.Action = this.form.controls.action.value;
    firewallRule.Protocol = this.form.controls.protocol.value;
    firewallRule.Direction = this.form.controls.direction.value;
    firewallRule.Log = this.form.controls.log.value;

    const sourceNetworkType = this.form.controls.sourceNetworkType.value;
    if (sourceNetworkType === 'ip') {
      firewallRule.SourceIP = this.form.controls.sourceIp.value;
    } else if (sourceNetworkType === 'NetworkObject') {
      ObjectService.mapNetworkObject(
        firewallRule,
        this.form.controls.sourceNetworkObject.value,
        this.networkObjects,
        RuleLocation.Source,
      );
    } else if (sourceNetworkType === 'NetworkObjectGroup') {
      ObjectService.mapNetworkObjectGroup(
        firewallRule,
        this.form.controls.sourceNetworkObjectGroup.value,
        this.networkObjectGroups,
        RuleLocation.Source,
      );
    }

    const sourceServiceType = this.form.controls.sourceServiceType.value;
    if (sourceServiceType === 'Port') {
      firewallRule.SourcePorts = this.form.controls.sourcePorts.value;
    } else if (sourceServiceType === 'ServiceObject') {
      ObjectService.mapServiceObject(
        firewallRule,
        this.form.controls.sourceServiceObject.value,
        this.serviceObjects,
        RuleLocation.Source,
      );
    } else if (sourceServiceType === 'ServiceObjectGroup') {
      ObjectService.mapServiceObjectGroup(
        firewallRule,
        this.form.controls.sourceServiceObjectGroup.value,
        this.serviceObjectGroups,
        RuleLocation.Source,
      );
    }

    const destinationNetworkType = this.form.controls.destinationNetworkType
      .value;
    if (destinationNetworkType === 'ip') {
      firewallRule.DestinationIP = this.form.controls.destinationIp.value;
    } else if (destinationNetworkType === 'NetworkObject') {
      ObjectService.mapNetworkObject(
        firewallRule,
        this.form.controls.destinationNetworkObject.value,
        this.networkObjects,
        RuleLocation.Destination,
      );
    } else if (destinationNetworkType === 'NetworkObjectGroup') {
      ObjectService.mapNetworkObjectGroup(
        firewallRule,
        this.form.controls.destinationNetworkObjectGroup.value,
        this.networkObjectGroups,
        RuleLocation.Destination,
      );
    }

    const destinationServiceType = this.form.controls.destinationServiceType
      .value;
    if (destinationServiceType === 'Port') {
      firewallRule.DestinationPorts = this.form.controls.destinationPorts.value;
    } else if (destinationServiceType === 'ServiceObject') {
      ObjectService.mapServiceObject(
        firewallRule,
        this.form.controls.destinationServiceObject.value,
        this.serviceObjects,
        RuleLocation.Destination,
      );
    } else if (destinationServiceType === 'ServiceObjectGroup') {
      ObjectService.mapServiceObjectGroup(
        firewallRule,
        this.form.controls.destinationServiceObjectGroup.value,
        this.serviceObjectGroups,
        RuleLocation.Destination,
      );
    }

    const dto = new FirewallRuleModalDto();
    // dto.FirewallRule = firewallRule;

    // TODO: Save.

    this.ngx.resetModalData('firewallRuleModal');
    this.ngx.setModalData(Object.assign({}, dto), 'firewallRuleModal');
    this.ngx.close('firewallRuleModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('firewallRuleModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const firewallRuleModalDto = Object.assign(
      {},
      this.ngx.getModalData('firewallRuleModal') as FirewallRuleModalDto,
    );

    this.TierId = firewallRuleModalDto.TierId;
    this.FirewallRuleGroupId = firewallRuleModalDto.FirewallRuleGroupId;

    const firewallRule = firewallRuleModalDto.FirewallRule;

    if (firewallRule !== undefined) {
      this.form.controls.name.setValue(firewallRule.name);
      this.form.controls.action.setValue(firewallRule.action);
      this.form.controls.protocol.setValue(firewallRule.protocol);
      this.form.controls.direction.setValue(firewallRule.direction);

      if (firewallRule.logging) {
        this.form.controls.log.setValue(firewallRule.logging);
      }

      if (firewallRule) {
        this.form.controls.sourceNetworkType.setValue('ip');
        this.form.controls.sourceIp.setValue(firewallRule.sourceIpAddress);
      } else if (firewallRule.sourceNetworkObject) {
        this.form.controls.sourceNetworkType.setValue('NetworkObject');
        this.form.controls.sourceNetworkObject.setValue(
          firewallRule.sourceNetworkObject,
        );
      } else if (firewallRule.sourceNetworkObjectGroup) {
        this.form.controls.sourceNetworkType.setValue('NetworkObjectGroup');
        this.form.controls.sourceNetworkObjectGroup.setValue(
          firewallRule.sourceNetworkObjectGroup,
        );
      }

      if (firewallRule.sourcePorts) {
        this.form.controls.sourceServiceType.setValue('Port');
        this.form.controls.sourcePorts.setValue(firewallRule.sourcePorts);
      } else if (firewallRule.sourceServiceObject) {
        this.form.controls.sourceServiceType.setValue('ServiceObject');
        this.form.controls.sourceServiceObject.setValue(
          firewallRule.sourceServiceObject,
        );
      } else if (firewallRule.sourceServiceObjectGroup) {
        this.form.controls.sourceServiceType.setValue('ServiceObjectGroup');
        this.form.controls.sourceServiceObjectGroup.setValue(
          firewallRule.sourceServiceObjectGroup,
        );
      }

      if (firewallRule.destinationIpAddress) {
        this.form.controls.destinationNetworkType.setValue('ip');
        this.form.controls.destinationIp.setValue(
          firewallRule.destinationIpAddress,
        );
      } else if (firewallRule.destinationNetworkObject) {
        this.form.controls.destinationNetworkType.setValue('NetworkObject');
        this.form.controls.destinationNetworkObject.setValue(
          firewallRule.destinationNetworkObject,
        );
      } else if (firewallRule.destinationNetworkObjectGroup) {
        this.form.controls.destinationNetworkType.setValue(
          'NetworkObjectGroup',
        );
        this.form.controls.destinationNetworkObjectGroup.setValue(
          firewallRule.destinationNetworkObjectGroup,
        );
      }

      if (firewallRule.destinationPorts) {
        this.form.controls.destinationServiceType.setValue('Port');
        this.form.controls.destinationPorts.setValue(
          firewallRule.destinationPorts,
        );
      } else if (firewallRule.destinationServiceObject) {
        this.form.controls.destinationServiceType.setValue('ServiceObject');
        this.form.controls.destinationServiceObject.setValue(
          firewallRule.destinationServiceObject,
        );
      } else if (firewallRule.destinationServiceObjectGroup) {
        this.form.controls.destinationServiceType.setValue(
          'ServiceObjectGroup',
        );
        this.form.controls.destinationServiceObjectGroup.setValue(
          firewallRule.destinationServiceObjectGroup,
        );
      }

      this.form.updateValueAndValidity();
    }
    this.ngx.resetModalData('firewallRuleModal');
  }

  private setFormValidators() {
    const sourceIp = this.form.controls.sourceIp;
    const sourceNetworkObject = this.form.controls.sourceNetworkObject;
    const sourceNetworkObjectGroup = this.form.controls
      .sourceNetworkObjectGroup;

    this.sourceNetworkTypeSubscription = this.form.controls.sourceNetworkType.valueChanges.subscribe(
      sourceNetworkType => {
        switch (sourceNetworkType) {
          case 'IpAddress':
            sourceIp.setValidators(
              Validators.compose([Validators.required, ValidateIpv4Any]),
            );
            sourceNetworkObject.setValue(null);
            sourceNetworkObject.setValidators(null);
            sourceNetworkObjectGroup.setValue(null);
            sourceNetworkObjectGroup.setValidators(null);
            break;
          case 'NetworkObject':
            sourceIp.setValue(null);
            sourceIp.setValidators(null);
            sourceNetworkObject.setValidators(Validators.required);
            sourceNetworkObjectGroup.setValue(null);
            sourceNetworkObjectGroup.setValidators(null);
            break;
          case 'NetworkObjectGroup':
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
      },
    );

    const sourcePort = this.form.controls.sourcePorts;
    const sourceServiceObject = this.form.controls.sourceServiceObject;
    const sourceServiceObjectGroup = this.form.controls
      .sourceServiceObjectGroup;

    this.sourceServiceTypeSubscription = this.form.controls.sourceServiceType.valueChanges.subscribe(
      sourceServiceType => {
        switch (sourceServiceType) {
          case 'Port':
            sourcePort.setValidators(
              Validators.compose([Validators.required, ValidatePortRange]),
            );
            sourceServiceObject.setValue(null);
            sourceServiceObject.setValidators(null);
            sourceServiceObjectGroup.setValue(null);
            sourceServiceObjectGroup.setValidators(null);
            break;
          case 'ServiceObject':
            sourcePort.setValue(null);
            sourcePort.setValidators(null);
            sourceServiceObject.setValidators(
              Validators.compose([Validators.required]),
            );
            sourceServiceObjectGroup.setValue(null);
            sourceServiceObjectGroup.setValidators(null);
            break;
          case 'ServiceObjectGroup':
            sourcePort.setValue(null);
            sourcePort.setValidators(null);
            sourceServiceObject.setValue(null);
            sourceServiceObject.setValidators(null);
            sourceServiceObjectGroup.setValidators(
              Validators.compose([Validators.required]),
            );
            break;
          default:
            break;
        }

        sourcePort.updateValueAndValidity();
        sourceServiceObject.updateValueAndValidity();
        sourceServiceObjectGroup.updateValueAndValidity();
      },
    );

    const destinationIp = this.form.controls.destinationIp;
    const destinationNetworkObject = this.form.controls
      .destinationNetworkObject;
    const destinationNetworkObjectGroup = this.form.controls
      .destinationNetworkObjectGroup;

    this.destinationNetworkTypeSubscription = this.form.controls.destinationNetworkType.valueChanges.subscribe(
      destinationNetworkType => {
        switch (destinationNetworkType) {
          case 'IpAddress':
            destinationIp.setValidators(
              Validators.compose([Validators.required, ValidateIpv4Any]),
            );
            destinationNetworkObject.setValue(null);
            destinationNetworkObject.setValidators(null);
            destinationNetworkObjectGroup.setValue(null);
            destinationNetworkObjectGroup.setValidators(null);
            break;
          case 'NetworkObject':
            destinationIp.setValue(null);
            destinationIp.setValidators(null);
            destinationNetworkObject.setValidators(Validators.required);
            destinationNetworkObjectGroup.setValue(null);
            destinationNetworkObjectGroup.setValidators(null);
            break;
          case 'NetworkObjectGroup':
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
      },
    );

    const destinationPort = this.form.controls.destinationPorts;
    const destinationServiceObject = this.form.controls
      .destinationServiceObject;
    const destinationServiceObjectGroup = this.form.controls
      .destinationServiceObjectGroup;

    this.destinationServiceTypeSubscription = this.form.controls.destinationServiceType.valueChanges.subscribe(
      destinationServiceType => {
        switch (destinationServiceType) {
          case 'Port':
            destinationPort.setValidators(
              Validators.compose([Validators.required, ValidatePortRange]),
            );
            destinationServiceObject.setValue(null);
            destinationServiceObject.setValidators(null);
            destinationServiceObjectGroup.setValue(null);
            destinationServiceObjectGroup.setValidators(null);
            break;
          case 'ServiceObject':
            destinationPort.setValue(null);
            destinationPort.setValidators(null);
            destinationServiceObject.setValidators(
              Validators.compose([Validators.required]),
            );
            destinationServiceObjectGroup.setValue(null);
            destinationServiceObjectGroup.setValidators(null);
            break;
          case 'ServiceObjectGroup':
            destinationPort.setValue(null);
            destinationPort.setValidators(null);
            destinationServiceObject.setValue(null);
            destinationServiceObject.setValidators(null);
            destinationServiceObjectGroup.setValidators(
              Validators.compose([Validators.required]),
            );
            break;
          default:
            break;
        }

        destinationPort.updateValueAndValidity();
        destinationServiceObject.updateValueAndValidity();
        destinationServiceObjectGroup.updateValueAndValidity();
      },
    );
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(28)]),
      ],
      description: [''],
      action: ['', Validators.required],
      protocol: ['', Validators.required], // TODO: Only required when using source ports, otherwise inherited from
      // service object/service object group.
      direction: ['', Validators.required],

      // Source Network Info
      sourceNetworkType: ['IpAddress'],
      sourceIp: [
        '',
        Validators.compose([Validators.required, ValidateIpv4Any]),
      ],
      sourceNetworkObject: [''],
      sourceNetworkObjectGroup: [''],

      // Source Service Info
      sourceServiceType: ['Port'],
      sourcePorts: [
        '',
        Validators.compose([Validators.required, ValidatePortRange]),
      ],
      sourceServiceObject: [''],
      sourceServiceObjectGroup: [''],

      // Destination Network Info
      destinationNetworkType: ['IpAddress'],
      destinationIp: [
        '',
        Validators.compose([Validators.required, ValidateIpv4Any]),
      ],
      destinationNetworkObject: [''],
      destinationNetworkObjectGroup: [''],

      // Destination Service Info
      destinationServiceType: ['Port'],
      destinationPorts: [
        '',
        Validators.compose([Validators.required, ValidatePortRange]),
      ],
      destinationServiceObject: [''],
      destinationServiceObjectGroup: [''],

      log: [false],
    });
  }

  private unsubAll() {
    [
      this.sourceNetworkTypeSubscription,
      this.sourceServiceTypeSubscription,
      this.destinationNetworkTypeSubscription,
      this.destinationServiceTypeSubscription,
    ].forEach(sub => {
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
    this.TierId = null;
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
