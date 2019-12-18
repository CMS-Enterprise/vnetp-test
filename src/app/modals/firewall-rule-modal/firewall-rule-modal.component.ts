import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ValidateIpv4Any,
  ValidatePortRange,
} from 'src/app/validators/network-form-validators';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { Vrf } from 'src/app/models/d42/vrf';
import { FirewallRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  ServiceObject,
  ServiceObjectGroup,
  NetworkObjectGroup,
  NetworkObject,
  FirewallRuleSourceAddressType,
  FirewallRuleDestinationAddressType,
  FirewallRuleSourceServiceType,
  FirewallRuleDestinationServiceType,
  FirewallRule,
  V1NetworkSecurityFirewallRulesService,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';

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
  ModalMode: ModalMode;
  NetworkObjectId: any;
  FirewallRuleId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    public helpText: FirewallRuleModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log(this.form);
      return;
    }

    const modalFirewallRule = {} as FirewallRule;

    modalFirewallRule.name = this.form.controls.name.value;
    modalFirewallRule.action = this.form.controls.action.value;
    modalFirewallRule.protocol = this.form.controls.protocol.value;
    modalFirewallRule.direction = this.form.controls.direction.value;
    modalFirewallRule.logging = this.form.controls.log.value;
    modalFirewallRule.ruleIndex = this.form.controls.ruleIndex.value;

    modalFirewallRule.sourceAddressType = this.form.controls.sourceNetworkType.value;

    if (
      modalFirewallRule.sourceAddressType ===
      FirewallRuleSourceAddressType.IpAddress
    ) {
      modalFirewallRule.sourceIpAddress = this.form.controls.sourceIp.value;
    } else if (
      modalFirewallRule.sourceAddressType ===
      FirewallRuleSourceAddressType.NetworkObject
    ) {
      modalFirewallRule.sourceNetworkObjectId = this.form.controls.sourceNetworkObject.value;
    } else if (
      modalFirewallRule.sourceAddressType ===
      FirewallRuleSourceAddressType.NetworkObjectGroup
    ) {
      modalFirewallRule.sourceNetworkObjectGroupId = this.form.controls.sourceNetworkObjectGroup.value;
    }

    modalFirewallRule.sourceServiceType = this.form.controls.sourceServiceType.value;

    if (
      modalFirewallRule.sourceServiceType === FirewallRuleSourceServiceType.Port
    ) {
      modalFirewallRule.sourcePorts = this.form.controls.sourcePorts.value;
    } else if (
      modalFirewallRule.sourceServiceType ===
      FirewallRuleSourceServiceType.ServiceObject
    ) {
      modalFirewallRule.sourceServiceObjectId = this.form.controls.sourceServiceObject.value;
    } else if (
      modalFirewallRule.sourceServiceType ===
      FirewallRuleSourceServiceType.ServiceObjectGroup
    ) {
      modalFirewallRule.sourceServiceObjectGroupId = this.form.controls.sourceServiceObjectGroup.value;
    }

    modalFirewallRule.destinationAddressType = this.form.controls.destinationNetworkType.value;

    if (
      modalFirewallRule.destinationAddressType ===
      FirewallRuleDestinationAddressType.IpAddress
    ) {
      modalFirewallRule.destinationIpAddress = this.form.controls.destinationIp.value;
    } else if (
      modalFirewallRule.destinationAddressType ===
      FirewallRuleDestinationAddressType.NetworkObject
    ) {
      modalFirewallRule.destinationNetworkObjectId = this.form.controls.destinationNetworkObject.value;
    } else if (
      modalFirewallRule.destinationAddressType ===
      FirewallRuleDestinationAddressType.NetworkObjectGroup
    ) {
      modalFirewallRule.destinationNetworkObjectGroupId = this.form.controls.destinationNetworkObjectGroup.value;
    }

    modalFirewallRule.destinationServiceType = this.form.controls.destinationServiceType.value;

    if (
      modalFirewallRule.destinationServiceType ===
      FirewallRuleDestinationServiceType.Port
    ) {
      modalFirewallRule.destinationPorts = this.form.controls.destinationPorts.value;
    } else if (
      modalFirewallRule.destinationServiceType ===
      FirewallRuleDestinationServiceType.ServiceObject
    ) {
      modalFirewallRule.destinationServiceObjectId = this.form.controls.destinationServiceObject.value;
    } else if (
      modalFirewallRule.destinationServiceType ===
      FirewallRuleDestinationServiceType.ServiceObjectGroup
    ) {
      modalFirewallRule.destinationServiceObjectGroupId = this.form.controls.destinationServiceObjectGroup.value;
    }

    if (this.ModalMode === ModalMode.Create) {
      modalFirewallRule.firewallRuleGroupId = this.FirewallRuleGroupId;
      this.firewallRuleService
        .v1NetworkSecurityFirewallRulesPost({
          firewallRule: modalFirewallRule,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.firewallRuleService
        .v1NetworkSecurityFirewallRulesIdPut({
          id: this.FirewallRuleId,
          firewallRule: modalFirewallRule,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  closeModal() {
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
    const dto = this.ngx.getModalData(
      'firewallRuleModal',
    ) as FirewallRuleModalDto;

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.FirewallRuleId = dto.FirewallRule.id;
      }
    }

    this.TierId = dto.TierId;
    this.FirewallRuleGroupId = dto.FirewallRuleGroupId;
    this.networkObjects = dto.NetworkObjects;
    this.networkObjectGroups = dto.NetworkObjectGroups;
    this.serviceObjects = dto.ServiceObjects;
    this.serviceObjectGroups = dto.ServiceObjectGroups;

    const firewallRule = dto.FirewallRule;

    if (firewallRule !== undefined) {
      this.form.controls.name.setValue(firewallRule.name);
      this.form.controls.action.setValue(firewallRule.action);
      this.form.controls.protocol.setValue(firewallRule.protocol);
      this.form.controls.direction.setValue(firewallRule.direction);
      this.form.controls.ruleIndex.setValue(firewallRule.ruleIndex);

      if (firewallRule.logging) {
        this.form.controls.log.setValue(firewallRule.logging);
      }

      if (
        firewallRule.sourceAddressType ===
        FirewallRuleSourceAddressType.IpAddress
      ) {
        this.form.controls.sourceNetworkType.setValue(
          FirewallRuleSourceAddressType.IpAddress,
        );
        this.form.controls.sourceIp.setValue(firewallRule.sourceIpAddress);
      } else if (
        firewallRule.sourceAddressType ===
        FirewallRuleSourceAddressType.NetworkObject
      ) {
        this.form.controls.sourceNetworkType.setValue(
          FirewallRuleSourceAddressType.IpAddress,
        );
        this.form.controls.sourceNetworkObject.setValue(
          firewallRule.sourceNetworkObject,
        );
      } else if (
        firewallRule.sourceAddressType ===
        FirewallRuleSourceAddressType.NetworkObjectGroup
      ) {
        this.form.controls.sourceNetworkType.setValue(
          FirewallRuleSourceAddressType.IpAddress,
        );
        this.form.controls.sourceNetworkObjectGroup.setValue(
          firewallRule.sourceNetworkObjectGroup,
        );
      }

      if (
        firewallRule.sourceServiceType === FirewallRuleSourceServiceType.Port
      ) {
        this.form.controls.sourceServiceType.setValue(
          FirewallRuleSourceServiceType.Port,
        );
        this.form.controls.sourcePorts.setValue(firewallRule.sourcePorts);
      } else if (
        firewallRule.sourceServiceType ===
        FirewallRuleSourceServiceType.ServiceObject
      ) {
        this.form.controls.sourceServiceType.setValue(
          FirewallRuleSourceServiceType.ServiceObject,
        );
        this.form.controls.sourceServiceObject.setValue(
          firewallRule.sourceServiceObject,
        );
      } else if (
        firewallRule.sourceServiceType ===
        FirewallRuleSourceServiceType.ServiceObjectGroup
      ) {
        this.form.controls.sourceServiceType.setValue(
          FirewallRuleSourceServiceType.ServiceObjectGroup,
        );
        this.form.controls.sourceServiceObjectGroup.setValue(
          firewallRule.sourceServiceObjectGroup,
        );
      }

      if (
        firewallRule.destinationAddressType ===
        FirewallRuleDestinationAddressType.IpAddress
      ) {
        this.form.controls.destinationNetworkType.setValue(
          FirewallRuleDestinationAddressType.IpAddress,
        );
        this.form.controls.destinationIp.setValue(
          firewallRule.destinationIpAddress,
        );
      } else if (
        firewallRule.destinationAddressType ===
        FirewallRuleDestinationAddressType.NetworkObject
      ) {
        this.form.controls.destinationNetworkType.setValue(
          FirewallRuleDestinationAddressType.IpAddress,
        );
        this.form.controls.destinationNetworkObject.setValue(
          firewallRule.destinationNetworkObject,
        );
      } else if (
        firewallRule.destinationAddressType ===
        FirewallRuleDestinationAddressType.NetworkObjectGroup
      ) {
        this.form.controls.destinationNetworkType.setValue(
          FirewallRuleDestinationAddressType.IpAddress,
        );
        this.form.controls.destinationNetworkObjectGroup.setValue(
          firewallRule.destinationNetworkObjectGroup,
        );
      }

      if (
        firewallRule.destinationServiceType ===
        FirewallRuleDestinationServiceType.Port
      ) {
        this.form.controls.destinationServiceType.setValue(
          FirewallRuleDestinationServiceType.Port,
        );
        this.form.controls.destinationPorts.setValue(
          firewallRule.destinationPorts,
        );
      } else if (
        firewallRule.destinationServiceType ===
        FirewallRuleDestinationServiceType.ServiceObject
      ) {
        this.form.controls.destinationServiceType.setValue(
          FirewallRuleDestinationServiceType.ServiceObject,
        );
        this.form.controls.destinationServiceObject.setValue(
          firewallRule.destinationServiceObject,
        );
      } else if (
        firewallRule.destinationServiceType ===
        FirewallRuleDestinationServiceType.ServiceObjectGroup
      ) {
        this.form.controls.destinationServiceType.setValue(
          FirewallRuleDestinationServiceType.ServiceObjectGroup,
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
      protocol: ['', Validators.required],
      direction: ['', Validators.required],
      ruleIndex: [
        0,
        Validators.compose([Validators.required, Validators.min(1)]),
      ],

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
