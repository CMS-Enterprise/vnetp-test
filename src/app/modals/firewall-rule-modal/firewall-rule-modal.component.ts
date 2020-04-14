import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';
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
  FirewallRuleServiceType,
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
  destinationNetworkTypeSubscription: Subscription;
  serviceTypeSubscription: Subscription;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;
  FirewallRuleGroupId: string;
  ModalMode: ModalMode;
  NetworkObjectId: string;
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
      return;
    }

    // TODO: Setting these properties to null to prevent check constraint violations when changing a rule between types.
    // Move this to the backend.
    const modalFirewallRule = {
      sourceIpAddress: null,
      sourceNetworkObjectId: null,
      sourceNetworkObjectGroupId: null,
      sourcePorts: null,
      destinationIpAddress: null,
      destinationNetworkObjectId: null,
      destinationNetworkObjectGroupId: null,
      destinationPorts: null,
      serviceObjectId: null,
      serviceObjectGroupId: null,
    } as FirewallRule;

    modalFirewallRule.name = this.form.controls.name.value;
    modalFirewallRule.action = this.form.controls.action.value;
    modalFirewallRule.protocol = this.form.controls.protocol.value;
    modalFirewallRule.direction = this.form.controls.direction.value;
    modalFirewallRule.logging = this.form.controls.logging.value;
    modalFirewallRule.enabled = this.form.controls.enabled.value;
    modalFirewallRule.ruleIndex = this.form.controls.ruleIndex.value;

    modalFirewallRule.sourceAddressType = this.form.controls.sourceNetworkType.value;

    if (modalFirewallRule.sourceAddressType === FirewallRuleSourceAddressType.IpAddress) {
      modalFirewallRule.sourceIpAddress = this.form.controls.sourceIpAddress.value;
    } else if (modalFirewallRule.sourceAddressType === FirewallRuleSourceAddressType.NetworkObject) {
      modalFirewallRule.sourceNetworkObjectId = this.form.controls.sourceNetworkObject.value;
    } else if (modalFirewallRule.sourceAddressType === FirewallRuleSourceAddressType.NetworkObjectGroup) {
      modalFirewallRule.sourceNetworkObjectGroupId = this.form.controls.sourceNetworkObjectGroup.value;
    }

    modalFirewallRule.destinationAddressType = this.form.controls.destinationNetworkType.value;

    if (modalFirewallRule.destinationAddressType === FirewallRuleDestinationAddressType.IpAddress) {
      modalFirewallRule.destinationIpAddress = this.form.controls.destinationIpAddress.value;
    } else if (modalFirewallRule.destinationAddressType === FirewallRuleDestinationAddressType.NetworkObject) {
      modalFirewallRule.destinationNetworkObjectId = this.form.controls.destinationNetworkObject.value;
    } else if (modalFirewallRule.destinationAddressType === FirewallRuleDestinationAddressType.NetworkObjectGroup) {
      modalFirewallRule.destinationNetworkObjectGroupId = this.form.controls.destinationNetworkObjectGroup.value;
    }

    modalFirewallRule.serviceType = this.form.controls.serviceType.value;

    if (modalFirewallRule.serviceType === FirewallRuleServiceType.Port) {
      modalFirewallRule.sourcePorts = this.form.controls.sourcePorts.value;
      modalFirewallRule.destinationPorts = this.form.controls.destinationPorts.value;
    } else if (modalFirewallRule.serviceType === FirewallRuleServiceType.ServiceObject) {
      modalFirewallRule.serviceObjectId = this.form.controls.serviceObject.value;
    } else if (modalFirewallRule.serviceType === FirewallRuleServiceType.ServiceObjectGroup) {
      modalFirewallRule.serviceObjectGroupId = this.form.controls.serviceObjectGroup.value;
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
    const dto = this.ngx.getModalData('firewallRuleModal') as FirewallRuleModalDto;

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
      this.form.controls.logging.setValue(firewallRule.logging);
      this.form.controls.enabled.setValue(firewallRule.enabled);

      if (firewallRule.sourceAddressType === FirewallRuleSourceAddressType.IpAddress) {
        this.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressType.IpAddress);
        this.form.controls.sourceIpAddress.setValue(firewallRule.sourceIpAddress);
      } else if (firewallRule.sourceAddressType === FirewallRuleSourceAddressType.NetworkObject) {
        this.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressType.NetworkObject);
        this.form.controls.sourceNetworkObject.setValue(firewallRule.sourceNetworkObjectId);
      } else if (firewallRule.sourceAddressType === FirewallRuleSourceAddressType.NetworkObjectGroup) {
        this.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressType.NetworkObjectGroup);
        this.form.controls.sourceNetworkObjectGroup.setValue(firewallRule.sourceNetworkObjectGroupId);
      }

      if (firewallRule.destinationAddressType === FirewallRuleDestinationAddressType.IpAddress) {
        this.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressType.IpAddress);
        this.form.controls.destinationIpAddress.setValue(firewallRule.destinationIpAddress);
      } else if (firewallRule.destinationAddressType === FirewallRuleDestinationAddressType.NetworkObject) {
        this.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressType.NetworkObject);
        this.form.controls.destinationNetworkObject.setValue(firewallRule.destinationNetworkObjectId);
      } else if (firewallRule.destinationAddressType === FirewallRuleDestinationAddressType.NetworkObjectGroup) {
        this.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressType.NetworkObjectGroup);
        this.form.controls.destinationNetworkObjectGroup.setValue(firewallRule.destinationNetworkObjectGroupId);
      }

      if (firewallRule.serviceType === FirewallRuleServiceType.Port) {
        this.form.controls.serviceType.setValue(FirewallRuleServiceType.Port);
        this.form.controls.sourcePorts.setValue(firewallRule.sourcePorts);
        this.form.controls.destinationPorts.setValue(firewallRule.destinationPorts);
      } else if (firewallRule.serviceType === FirewallRuleServiceType.ServiceObject) {
        this.form.controls.serviceType.setValue(FirewallRuleServiceType.ServiceObject);
        this.form.controls.serviceObject.setValue(firewallRule.serviceObjectId);
      } else if (firewallRule.serviceType === FirewallRuleServiceType.ServiceObjectGroup) {
        this.form.controls.serviceType.setValue(FirewallRuleServiceType.ServiceObjectGroup);
        this.form.controls.serviceObjectGroup.setValue(firewallRule.serviceObjectGroupId);
      }

      this.form.updateValueAndValidity();
    }
    this.ngx.resetModalData('firewallRuleModal');
  }

  private setFormValidators() {
    const sourceIpAddress = this.form.controls.sourceIpAddress;
    const sourceNetworkObject = this.form.controls.sourceNetworkObject;
    const sourceNetworkObjectGroup = this.form.controls.sourceNetworkObjectGroup;

    this.sourceNetworkTypeSubscription = this.form.controls.sourceNetworkType.valueChanges.subscribe(sourceNetworkType => {
      switch (sourceNetworkType) {
        case 'IpAddress':
          sourceIpAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
          sourceNetworkObject.setValue(null);
          sourceNetworkObject.setValidators(null);
          sourceNetworkObjectGroup.setValue(null);
          sourceNetworkObjectGroup.setValidators(null);
          break;
        case 'NetworkObject':
          sourceIpAddress.setValue(null);
          sourceIpAddress.setValidators(null);
          sourceNetworkObject.setValidators(Validators.required);
          sourceNetworkObjectGroup.setValue(null);
          sourceNetworkObjectGroup.setValidators(null);
          break;
        case 'NetworkObjectGroup':
          sourceIpAddress.setValue(null);
          sourceIpAddress.setValidators(null);
          sourceNetworkObject.setValue(null);
          sourceNetworkObject.setValidators(null);
          sourceNetworkObjectGroup.setValidators(Validators.required);
          break;
        default:
          break;
      }

      sourceIpAddress.updateValueAndValidity();
      sourceNetworkObject.updateValueAndValidity();
      sourceNetworkObjectGroup.updateValueAndValidity();
    });

    const destinationIpAddress = this.form.controls.destinationIpAddress;
    const destinationNetworkObject = this.form.controls.destinationNetworkObject;
    const destinationNetworkObjectGroup = this.form.controls.destinationNetworkObjectGroup;

    this.destinationNetworkTypeSubscription = this.form.controls.destinationNetworkType.valueChanges.subscribe(destinationNetworkType => {
      switch (destinationNetworkType) {
        case 'IpAddress':
          destinationIpAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
          destinationNetworkObject.setValue(null);
          destinationNetworkObject.setValidators(null);
          destinationNetworkObjectGroup.setValue(null);
          destinationNetworkObjectGroup.setValidators(null);
          break;
        case 'NetworkObject':
          destinationIpAddress.setValue(null);
          destinationIpAddress.setValidators(null);
          destinationNetworkObject.setValidators(Validators.required);
          destinationNetworkObjectGroup.setValue(null);
          destinationNetworkObjectGroup.setValidators(null);
          break;
        case 'NetworkObjectGroup':
          destinationIpAddress.setValue(null);
          destinationIpAddress.setValidators(null);
          destinationNetworkObject.setValue(null);
          destinationNetworkObject.setValidators(null);
          destinationNetworkObjectGroup.setValidators(Validators.required);
          break;
        default:
          break;
      }

      destinationIpAddress.updateValueAndValidity();
      destinationNetworkObject.updateValueAndValidity();
      destinationNetworkObjectGroup.updateValueAndValidity();
    });

    const sourcePorts = this.form.controls.sourcePorts;
    const destinationPorts = this.form.controls.destinationPorts;
    const serviceObject = this.form.controls.serviceObject;
    const serviceObjectGroup = this.form.controls.serviceObjectGroup;

    this.serviceTypeSubscription = this.form.controls.serviceType.valueChanges.subscribe(serviceType => {
      switch (serviceType) {
        case 'Port':
          destinationPorts.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
          sourcePorts.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
          serviceObject.setValue(null);
          serviceObject.setValidators(null);
          serviceObjectGroup.setValue(null);
          serviceObjectGroup.setValidators(null);
          break;
        case 'ServiceObject':
          sourcePorts.setValue(null);
          sourcePorts.setValidators(null);
          destinationPorts.setValue(null);
          destinationPorts.setValidators(null);
          serviceObject.setValidators(Validators.compose([Validators.required]));
          serviceObjectGroup.setValue(null);
          serviceObjectGroup.setValidators(null);
          break;
        case 'ServiceObjectGroup':
          sourcePorts.setValue(null);
          sourcePorts.setValidators(null);
          destinationPorts.setValue(null);
          destinationPorts.setValidators(null);
          serviceObject.setValue(null);
          serviceObject.setValidators(null);
          serviceObjectGroup.setValidators(Validators.compose([Validators.required]));
          break;
        default:
          break;
      }

      sourcePorts.updateValueAndValidity();
      destinationPorts.updateValueAndValidity();
      serviceObject.updateValueAndValidity();
      serviceObjectGroup.updateValueAndValidity();
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.maxLength(28)])],
      description: [''],
      action: ['', Validators.required],
      protocol: ['', Validators.required],
      direction: ['', Validators.required],
      ruleIndex: [0, Validators.compose([Validators.required, Validators.min(1)])],

      // Source Network Info
      sourceNetworkType: ['IpAddress'],
      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      sourceNetworkObject: [''],
      sourceNetworkObjectGroup: [''],

      // Source Service Info
      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],

      // Destination Network Info
      destinationNetworkType: ['IpAddress'],
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      destinationNetworkObject: [''],
      destinationNetworkObjectGroup: [''],

      // Destination Service Info
      serviceType: ['Port'],
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      serviceObject: [''],
      serviceObjectGroup: [''],

      logging: [false],
      enabled: [true],
    });
  }

  private unsubAll() {
    [this.sourceNetworkTypeSubscription, this.destinationNetworkTypeSubscription, this.serviceTypeSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  public reset() {
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
