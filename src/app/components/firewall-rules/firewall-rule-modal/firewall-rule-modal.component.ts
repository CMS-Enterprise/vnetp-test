import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { FirewallRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  ServiceObject,
  ServiceObjectGroup,
  NetworkObjectGroup,
  NetworkObject,
  FirewallRuleSourceAddressTypeEnum,
  FirewallRuleDestinationAddressTypeEnum,
  FirewallRuleServiceTypeEnum,
  FirewallRule,
  Zone,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  FirewallRuleGroupTypeEnum,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import FormUtils from '../../../utils/FormUtils';

@Component({
  selector: 'app-firewall-rule-modal',
  styleUrls: ['./firewall-rule-modal.component.scss'],
  templateUrl: './firewall-rule-modal.component.html',
})
export class FirewallRuleModalComponent implements OnInit, OnDestroy {
  form: UntypedFormGroup;
  submitted: boolean;
  TierId: string;

  sourceNetworkTypeSubscription: Subscription;
  destinationNetworkTypeSubscription: Subscription;
  serviceTypeSubscription: Subscription;
  objectInfoSubscription: Subscription;
  protocolChangeSubscription: Subscription;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;
  FirewallRuleGroupId: string;
  ModalMode: ModalMode;
  NetworkObjectId: string;
  FirewallRuleId: string;
  zones: Zone[];
  selectedToZones: Zone[];
  selectedFromZones: Zone[];
  firewallRuleGroupType = FirewallRuleGroupTypeEnum.Intervrf;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    public helpText: FirewallRuleModalHelpText,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log('form invalid');
      console.log(new FormUtils().findInvalidControlsRecursive(this.form));
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
    modalFirewallRule.logging = this.form.controls.logging.value;
    modalFirewallRule.enabled = this.form.controls.enabled.value;
    modalFirewallRule.ruleIndex = this.form.controls.ruleIndex.value;

    if (this.firewallRuleGroupType === FirewallRuleGroupTypeEnum.ZoneBased) {
      modalFirewallRule.toZone = this.selectedToZones;
      modalFirewallRule.fromZone = this.selectedFromZones;
      modalFirewallRule.direction = null;
    } else {
      modalFirewallRule.toZone = null;
      modalFirewallRule.fromZone = null;
      modalFirewallRule.direction = this.form.controls.direction.value;
    }

    modalFirewallRule.sourceAddressType = this.form.controls.sourceNetworkType.value;

    if (modalFirewallRule.sourceAddressType === FirewallRuleSourceAddressTypeEnum.IpAddress) {
      modalFirewallRule.sourceIpAddress = this.form.controls.sourceIpAddress.value;
    } else if (modalFirewallRule.sourceAddressType === FirewallRuleSourceAddressTypeEnum.NetworkObject) {
      modalFirewallRule.sourceNetworkObjectId = this.form.controls.sourceNetworkObject.value;
    } else if (modalFirewallRule.sourceAddressType === FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup) {
      modalFirewallRule.sourceNetworkObjectGroupId = this.form.controls.sourceNetworkObjectGroup.value;
    }

    modalFirewallRule.destinationAddressType = this.form.controls.destinationNetworkType.value;

    if (modalFirewallRule.destinationAddressType === FirewallRuleDestinationAddressTypeEnum.IpAddress) {
      modalFirewallRule.destinationIpAddress = this.form.controls.destinationIpAddress.value;
    } else if (modalFirewallRule.destinationAddressType === FirewallRuleDestinationAddressTypeEnum.NetworkObject) {
      modalFirewallRule.destinationNetworkObjectId = this.form.controls.destinationNetworkObject.value;
    } else if (modalFirewallRule.destinationAddressType === FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup) {
      modalFirewallRule.destinationNetworkObjectGroupId = this.form.controls.destinationNetworkObjectGroup.value;
    }

    modalFirewallRule.serviceType = this.form.controls.serviceType.value;

    if (modalFirewallRule.serviceType === FirewallRuleServiceTypeEnum.Port) {
      modalFirewallRule.sourcePorts = this.form.controls.sourcePorts.value;
      modalFirewallRule.destinationPorts = this.form.controls.destinationPorts.value;
    } else if (modalFirewallRule.serviceType === FirewallRuleServiceTypeEnum.ServiceObject) {
      modalFirewallRule.serviceObjectId = this.form.controls.serviceObject.value;
    } else if (modalFirewallRule.serviceType === FirewallRuleServiceTypeEnum.ServiceObjectGroup) {
      modalFirewallRule.serviceObjectGroupId = this.form.controls.serviceObjectGroup.value;
    }

    if (this.ModalMode === ModalMode.Create) {
      modalFirewallRule.firewallRuleGroupId = this.FirewallRuleGroupId;
      this.firewallRuleService
        .createOneFirewallRule({
          firewallRule: modalFirewallRule,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.firewallRuleService
        .updateOneFirewallRule({
          id: this.FirewallRuleId,
          firewallRule: modalFirewallRule,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
  }

  closeModal() {
    this.ngx.close('firewallRuleModal');
  }

  cancel() {
    this.ngx.close('firewallRuleModal');
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const dto = this.ngx.getModalData('firewallRuleModal') as FirewallRuleModalDto;
    this.ModalMode = dto.ModalMode;

    this.firewallRuleGroupType = dto.GroupType;

    if (this.firewallRuleGroupType === FirewallRuleGroupTypeEnum.ZoneBased) {
      this.zones = dto.Zones;
      this.selectedToZones = [];
      this.selectedFromZones = [];
      if (dto.FirewallRule.toZone != null) {
        this.selectedToZones = dto.FirewallRule.toZone;
      }
      if (dto.FirewallRule.fromZone != null) {
        this.selectedFromZones = dto.FirewallRule.fromZone;
      }
    }

    if (this.ModalMode === ModalMode.Edit) {
      this.FirewallRuleId = dto.FirewallRule.id;
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

      if (firewallRule.sourceAddressType === FirewallRuleSourceAddressTypeEnum.IpAddress) {
        this.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.IpAddress);
        this.form.controls.sourceIpAddress.setValue(firewallRule.sourceIpAddress);
      } else if (firewallRule.sourceAddressType === FirewallRuleSourceAddressTypeEnum.NetworkObject) {
        this.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.NetworkObject);
        this.form.controls.sourceNetworkObject.setValue(firewallRule.sourceNetworkObjectId);
      } else if (firewallRule.sourceAddressType === FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup) {
        this.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup);
        this.form.controls.sourceNetworkObjectGroup.setValue(firewallRule.sourceNetworkObjectGroupId);
      }

      if (firewallRule.destinationAddressType === FirewallRuleDestinationAddressTypeEnum.IpAddress) {
        this.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.IpAddress);
        this.form.controls.destinationIpAddress.setValue(firewallRule.destinationIpAddress);
      } else if (firewallRule.destinationAddressType === FirewallRuleDestinationAddressTypeEnum.NetworkObject) {
        this.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.NetworkObject);
        this.form.controls.destinationNetworkObject.setValue(firewallRule.destinationNetworkObjectId);
      } else if (firewallRule.destinationAddressType === FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup) {
        this.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup);
        this.form.controls.destinationNetworkObjectGroup.setValue(firewallRule.destinationNetworkObjectGroupId);
      }

      if (firewallRule.serviceType === FirewallRuleServiceTypeEnum.Port) {
        this.form.controls.serviceType.setValue(FirewallRuleServiceTypeEnum.Port);
        this.form.controls.sourcePorts.setValue(firewallRule.sourcePorts);
        this.form.controls.destinationPorts.setValue(firewallRule.destinationPorts);
      } else if (firewallRule.serviceType === FirewallRuleServiceTypeEnum.ServiceObject) {
        this.form.controls.serviceType.setValue(FirewallRuleServiceTypeEnum.ServiceObject);
        this.form.controls.serviceObject.setValue(firewallRule.serviceObjectId);
      } else if (firewallRule.serviceType === FirewallRuleServiceTypeEnum.ServiceObjectGroup) {
        this.form.controls.serviceType.setValue(FirewallRuleServiceTypeEnum.ServiceObjectGroup);
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

    const formServiceType = this.form.controls.serviceType;

    this.protocolChangeSubscription = this.form.controls.protocol.valueChanges.subscribe(protocol => {
      if (protocol === 'ICMP' || protocol === 'IP') {
        formServiceType.setValue('Port');
        sourcePorts.setValue('any');
        destinationPorts.setValue('any');
        formServiceType.disable();
        sourcePorts.disable();
        destinationPorts.disable();
      } else {
        formServiceType.setValue('Port');
        sourcePorts.setValue(null);
        destinationPorts.setValue(null);
        formServiceType.enable();
        sourcePorts.enable();
        destinationPorts.enable();
      }
      formServiceType.updateValueAndValidity();
      sourcePorts.updateValueAndValidity();
      destinationPorts.updateValueAndValidity();
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', NameValidator(3, 60)],
      description: [''],
      action: ['', Validators.required],
      protocol: ['', Validators.required],
      direction: [''],
      selectedToZone: [''],
      selectedFromZone: [''],
      ruleIndex: [1, Validators.compose([Validators.required, Validators.min(1)])],

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

  addZone(type: 'from' | 'to') {
    const zoneId = type === 'from' ? this.form.controls.selectedFromZone.value : this.form.controls.selectedToZone.value;
    const zone = this.zones.find(z => z.id === zoneId);
    if (type === 'from') {
      if (!this.selectedFromZones.find(z => z.id === zone.id)) {
        this.selectedFromZones.push(zone);
      }
      this.form.controls.selectedFromZone.setValue(null);
    } else if (type === 'to') {
      if (!this.selectedToZones.find(z => z.id === zone.id)) {
        this.selectedToZones.push(zone);
      }
      this.form.controls.selectedToZone.setValue(null);
    }
  }

  removeZone(type: 'from' | 'to', id: string) {
    if (type === 'from') {
      this.selectedFromZones = this.selectedFromZones.filter(z => z.id !== id);
    } else if (type === 'to') {
      this.selectedToZones = this.selectedToZones.filter(z => z.id !== id);
    }
  }

  getObjectInfo(property, objectType, objectId) {
    if (objectId) {
      switch (objectType) {
        case 'NetworkObject': {
          this.handleNetworkObject(property, objectId);
          break;
        }
        case 'NetworkObjectGroup': {
          this.handleNetworkObjectGroup(property, objectId);
          break;
        }
        case 'ServiceObject': {
          this.handleServiceObject(property, objectId);
          break;
        }
        case 'ServiceObjectGroup': {
          this.handleServiceObjectGroup(property, objectId);
          break;
        }
      }
    }
  }

  handleNetworkObject(property, objectId) {
    this.networkObjectService.getOneNetworkObject({ id: objectId }).subscribe(data => {
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      let value;
      if (data.type === 'Fqdn') {
        value = data.fqdn;
      } else if (data.type === 'Range') {
        value = `${data.startIpAddress} - ${data.endIpAddress}`;
      } else {
        value = data.ipAddress;
      }
      const modalBody = [`${data.type}: ${value}`];
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  handleNetworkObjectGroup(property, objectId) {
    this.networkObjectGroupService.getOneNetworkObjectGroup({ id: objectId, join: ['networkObjects'] }).subscribe(data => {
      const members = data.networkObjects;
      const memberDetails = members.map(member => {
        let returnValue = `Name: ${member.name} --- `;

        if (member.type === 'IpAddress') {
          returnValue += `IP Address: ${member.ipAddress}`;
        } else if (member.type === 'Range') {
          returnValue += `Range: ${member.startIpAddress}-${member.endIpAddress}`;
        } else if (member.type === 'Fqdn') {
          returnValue += `FQDN: ${member.fqdn}`;
        }

        return returnValue;
      });
      const modalBody = memberDetails;
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  handleServiceObject(property, objectId) {
    this.serviceObjectService.getOneServiceObject({ id: objectId }).subscribe(data => {
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      const modalBody = [`Protocol : ${data.protocol}, Source Ports: ${data.sourcePorts}, Destination Ports: ${data.destinationPorts}`];
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  handleServiceObjectGroup(property, objectId) {
    this.serviceObjectGroupService.getOneServiceObjectGroup({ id: objectId, join: ['serviceObjects'] }).subscribe(data => {
      const members = data.serviceObjects;
      const memberDetails = members.map(member => {
        let returnValue = `Name: ${member.name} ---`;

        /* eslint-disable-next-line */
        returnValue += `Protocol: ${member.protocol}, Source Ports: ${member.sourcePorts}, Destination Ports: ${member.destinationPorts}`;

        return returnValue;
      });
      const modalBody = memberDetails;
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  subscribeToObjectInfoModal() {
    this.objectInfoSubscription = this.ngx.getModal('firewallRuleObjectInfoModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('firewallRuleObjectInfoModal');
      this.objectInfoSubscription.unsubscribe();
    });
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([
      this.sourceNetworkTypeSubscription,
      this.destinationNetworkTypeSubscription,
      this.serviceTypeSubscription,
      this.protocolChangeSubscription,
    ]);
  }

  public reset() {
    this.unsubAll();
    this.TierId = null;
    this.selectedFromZones = [];
    this.selectedToZones = [];
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
