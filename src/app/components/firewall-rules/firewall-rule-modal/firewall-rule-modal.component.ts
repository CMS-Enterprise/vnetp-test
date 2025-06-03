import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input } from '@angular/core';
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
  EndpointGroup,
  EndpointSecurityGroup,
  PanosApplication,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { AppIdRuntimeService } from '../../app-id-runtime/app-id-runtime.service';
import { AppIdModalDto } from '../../../models/other/app-id-modal.dto';
import { TierContextService } from '../../../services/tier-context.service';
import { LiteTableConfig } from '../../../common/lite-table/lite-table.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { RouteDataUtil } from '../../../utils/route-data.util';
import { ActivatedRoute } from '@angular/router';

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

  applicationMode: ApplicationMode;
  endpointGroups: Array<EndpointGroup>;
  endpointSecurityGroups: Array<EndpointSecurityGroup>;

  appIdModalSubscription: Subscription;

  firewallRule: FirewallRule;
  liteTableData: PanosApplication[];

  modalMode = ModalMode;

  isRefreshingAppId = false;

  disableAppIdIcmp = false;

  @Input() appIdEnabled: boolean;

  @ViewChild('appIdColumnTemplate') iconTemplate: TemplateRef<any>;

  config: LiteTableConfig<PanosApplication> = {
    columns: [
      { name: '', template: () => this.iconTemplate },
      { name: 'Name', property: 'name' },
      { name: 'Category', property: 'category' },
      { name: 'Sub Category', property: 'subCategory' },
      { name: 'Risk', property: 'risk' },
    ],
    rowStyle: (row: PanosApplication) => ((row as any).remove ? 'row-red' : 'row-green'),
  };

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    public helpText: FirewallRuleModalHelpText,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private activatedRoute: ActivatedRoute,
    private appIdService: AppIdRuntimeService,
    private tierContextService: TierContextService,
  ) {}

  public openAppIdModal(): void {
    const tier = this.tierContextService.currentTierValue;

    const dto: AppIdModalDto = {
      tier,
      firewallRule: this.firewallRule,
    };
    this.subscribeToAppIdModal();
    this.ngx.setModalData(dto, 'appIdModal');
    this.ngx.open('appIdModal');
  }

  private subscribeToAppIdModal(): void {
    this.appIdModalSubscription = this.ngx.getModal('appIdModal').onCloseFinished.subscribe(() => {
      const appsToAdd = this.appIdService.dto.panosApplicationsToAdd.map(app => ({ ...app, remove: false }));
      const appsToRemove = this.appIdService.dto.panosApplicationsToRemove.map(app => ({ ...app, remove: true }));
      this.liteTableData = [...appsToAdd, ...appsToRemove];
      this.ngx.resetModalData('appIdModal');
      this.appIdModalSubscription.unsubscribe();
    });
  }

  save() {
    this.submitted = true;
    if (Number.isNaN(this.form.controls.ruleIndex.value)) {
      this.form.controls.ruleIndex.setValue(null);
    }
    if (this.form.invalid) {
      return;
    }

    const modalFirewallRule = {
      sourceIpAddress: null,
      sourceNetworkObjectId: null,
      sourceNetworkObjectGroupId: null,
      sourceEndpointGroupId: null,
      sourceEndpointSecurityGroupId: null,
      sourcePorts: null,
      destinationIpAddress: null,
      destinationNetworkObjectId: null,
      destinationNetworkObjectGroupId: null,
      destinationEndpointGroupId: null,
      destinationEndpointSecurityGroupId: null,
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
    } else if (this.firewallRuleGroupType === FirewallRuleGroupTypeEnum.OneArmServiceGraph) {
      modalFirewallRule.toZone = null;
      modalFirewallRule.fromZone = null;
      modalFirewallRule.direction = null;
    } else {
      modalFirewallRule.toZone = null;
      modalFirewallRule.fromZone = null;
      modalFirewallRule.direction = this.form.controls.direction.value;
    }

    const sourceNetworkTypeValue = this.form.controls.sourceNetworkType.value;
    modalFirewallRule.sourceAddressType = sourceNetworkTypeValue as FirewallRuleSourceAddressTypeEnum;

    if (sourceNetworkTypeValue === FirewallRuleSourceAddressTypeEnum.IpAddress) {
      modalFirewallRule.sourceIpAddress = this.form.controls.sourceIpAddress.value;
    } else if (sourceNetworkTypeValue === FirewallRuleSourceAddressTypeEnum.NetworkObject) {
      modalFirewallRule.sourceNetworkObjectId = this.form.controls.sourceNetworkObject.value;
    } else if (sourceNetworkTypeValue === FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup) {
      modalFirewallRule.sourceNetworkObjectGroupId = this.form.controls.sourceNetworkObjectGroup.value;
    } else if (this.isTenantV2Mode && sourceNetworkTypeValue === FirewallRuleSourceAddressTypeEnum.EndpointGroup) {
      modalFirewallRule.sourceAddressType = FirewallRuleSourceAddressTypeEnum.EndpointGroup;
      modalFirewallRule.sourceEndpointGroupId = this.form.controls.sourceEndpointGroup.value;
    } else if (this.isTenantV2Mode && sourceNetworkTypeValue === FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup) {
      modalFirewallRule.sourceAddressType = FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup;
      modalFirewallRule.sourceEndpointSecurityGroupId = this.form.controls.sourceEndpointSecurityGroup.value;
    }

    const destinationNetworkTypeValue = this.form.controls.destinationNetworkType.value;
    modalFirewallRule.destinationAddressType = destinationNetworkTypeValue as FirewallRuleDestinationAddressTypeEnum;

    if (destinationNetworkTypeValue === FirewallRuleDestinationAddressTypeEnum.IpAddress) {
      modalFirewallRule.destinationIpAddress = this.form.controls.destinationIpAddress.value;
    } else if (destinationNetworkTypeValue === FirewallRuleDestinationAddressTypeEnum.NetworkObject) {
      modalFirewallRule.destinationNetworkObjectId = this.form.controls.destinationNetworkObject.value;
    } else if (destinationNetworkTypeValue === FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup) {
      modalFirewallRule.destinationNetworkObjectGroupId = this.form.controls.destinationNetworkObjectGroup.value;
    } else if (this.isTenantV2Mode && destinationNetworkTypeValue === FirewallRuleDestinationAddressTypeEnum.EndpointGroup) {
      modalFirewallRule.destinationAddressType = FirewallRuleDestinationAddressTypeEnum.EndpointGroup;
      modalFirewallRule.destinationEndpointGroupId = this.form.controls.destinationEndpointGroup.value;
    } else if (this.isTenantV2Mode && destinationNetworkTypeValue === FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup) {
      modalFirewallRule.destinationAddressType = FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup;
      modalFirewallRule.destinationEndpointSecurityGroupId = this.form.controls.destinationEndpointSecurityGroup.value;
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
      if (this.appIdEnabled === true) {
        const appIds = [...this.appIdService.dto.panosApplicationsToAdd];
        modalFirewallRule.panosApplications = appIds;
      }
      modalFirewallRule.firewallRuleGroupId = this.FirewallRuleGroupId;
      this.firewallRuleService
        .createOneFirewallRule({
          firewallRule: modalFirewallRule,
        })
        .subscribe(
          () => {
            this.closeModal();
            this.appIdService.resetDto();
          },
          () => {},
        );
    } else {
      if (this.appIdEnabled === true) {
        modalFirewallRule.panosApplications = [...this.firewallRule.panosApplications];
        this.appIdService.saveDto(modalFirewallRule);
      }

      this.firewallRuleService
        .updateOneFirewallRule({
          id: this.FirewallRuleId,
          firewallRule: modalFirewallRule,
        })
        .subscribe(() => {
          this.closeModal();
        });
    }
  }

  closeModal() {
    this.appIdService.resetDto();
    this.ngx.close('firewallRuleModal');
  }

  cancel() {
    this.appIdService.resetDto();

    this.ngx.close('firewallRuleModal');
  }

  get f() {
    return this.form.controls;
  }

  get isTenantV2Mode(): boolean {
    return this.applicationMode === ApplicationMode.TENANTV2;
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
    if (this.isTenantV2Mode) {
      this.endpointGroups = dto.EndpointGroups;
      this.endpointSecurityGroups = dto.EndpointSecurityGroups;
    }

    const firewallRule = dto.FirewallRule;
    this.firewallRule = firewallRule;

    if (firewallRule !== undefined) {
      this.form.controls.name.setValue(firewallRule.name);
      this.form.controls.action.setValue(firewallRule.action);
      this.form.controls.protocol.setValue(firewallRule.protocol);
      this.form.controls.direction.setValue(firewallRule.direction);
      this.form.controls.ruleIndex.setValue(firewallRule.ruleIndex);
      this.form.controls.logging.setValue(firewallRule.logging);
      this.form.controls.enabled.setValue(firewallRule.enabled);

      // Set source type and value
      const sourceAddressType = firewallRule.sourceAddressType;
      this.form.controls.sourceNetworkType.setValue(sourceAddressType);
      if (sourceAddressType === FirewallRuleSourceAddressTypeEnum.IpAddress) {
        this.form.controls.sourceIpAddress.setValue(firewallRule.sourceIpAddress);
      } else if (sourceAddressType === FirewallRuleSourceAddressTypeEnum.NetworkObject) {
        this.form.controls.sourceNetworkObject.setValue(firewallRule.sourceNetworkObjectId);
      } else if (sourceAddressType === FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup) {
        this.form.controls.sourceNetworkObjectGroup.setValue(firewallRule.sourceNetworkObjectGroupId);
      } else if (this.isTenantV2Mode && sourceAddressType === FirewallRuleSourceAddressTypeEnum.EndpointGroup) {
        this.form.controls.sourceEndpointGroup.setValue(firewallRule.sourceEndpointGroupId);
      } else if (this.isTenantV2Mode && sourceAddressType === FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup) {
        this.form.controls.sourceEndpointSecurityGroup.setValue(firewallRule.sourceEndpointSecurityGroupId);
      }

      // Set destination type and value
      const destinationAddressType = firewallRule.destinationAddressType;
      this.form.controls.destinationNetworkType.setValue(destinationAddressType);
      if (destinationAddressType === FirewallRuleDestinationAddressTypeEnum.IpAddress) {
        this.form.controls.destinationIpAddress.setValue(firewallRule.destinationIpAddress);
      } else if (destinationAddressType === FirewallRuleDestinationAddressTypeEnum.NetworkObject) {
        this.form.controls.destinationNetworkObject.setValue(firewallRule.destinationNetworkObjectId);
      } else if (destinationAddressType === FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup) {
        this.form.controls.destinationNetworkObjectGroup.setValue(firewallRule.destinationNetworkObjectGroupId);
      } else if (this.isTenantV2Mode && destinationAddressType === FirewallRuleDestinationAddressTypeEnum.EndpointGroup) {
        this.form.controls.destinationEndpointGroup.setValue(firewallRule.destinationEndpointGroupId);
      } else if (this.isTenantV2Mode && destinationAddressType === FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup) {
        this.form.controls.destinationEndpointSecurityGroup.setValue(firewallRule.destinationEndpointSecurityGroupId);
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
    const sourceEndpointGroup = this.form.controls.sourceEndpointGroup;
    const sourceEndpointSecurityGroup = this.form.controls.sourceEndpointSecurityGroup;

    this.sourceNetworkTypeSubscription = this.form.controls.sourceNetworkType.valueChanges.subscribe(sourceNetworkType => {
      // Reset all source validators and values first
      sourceIpAddress.setValue(null);
      sourceIpAddress.setValidators(null);
      sourceNetworkObject.setValue(null);
      sourceNetworkObject.setValidators(null);
      sourceNetworkObjectGroup.setValue(null);
      sourceNetworkObjectGroup.setValidators(null);
      if (this.isTenantV2Mode) {
        sourceEndpointGroup.setValue(null);
        sourceEndpointGroup.setValidators(null);
        sourceEndpointSecurityGroup.setValue(null);
        sourceEndpointSecurityGroup.setValidators(null);
      }

      switch (sourceNetworkType) {
        case FirewallRuleSourceAddressTypeEnum.IpAddress:
          sourceIpAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
          break;
        case FirewallRuleSourceAddressTypeEnum.NetworkObject:
          sourceNetworkObject.setValidators(Validators.required);
          break;
        case FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup:
          sourceNetworkObjectGroup.setValidators(Validators.required);
          break;
        case FirewallRuleSourceAddressTypeEnum.EndpointGroup:
          if (this.isTenantV2Mode) {
            sourceEndpointGroup.setValidators(Validators.required);
          }
          break;
        case FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup:
          if (this.isTenantV2Mode) {
            sourceEndpointSecurityGroup.setValidators(Validators.required);
          }
          break;
        default:
          break;
      }

      sourceIpAddress.updateValueAndValidity();
      sourceNetworkObject.updateValueAndValidity();
      sourceNetworkObjectGroup.updateValueAndValidity();
      if (this.isTenantV2Mode) {
        sourceEndpointGroup.updateValueAndValidity();
        sourceEndpointSecurityGroup.updateValueAndValidity();
      }
    });

    const destinationIpAddress = this.form.controls.destinationIpAddress;
    const destinationNetworkObject = this.form.controls.destinationNetworkObject;
    const destinationNetworkObjectGroup = this.form.controls.destinationNetworkObjectGroup;
    const destinationEndpointGroup = this.form.controls.destinationEndpointGroup;
    const destinationEndpointSecurityGroup = this.form.controls.destinationEndpointSecurityGroup;

    this.destinationNetworkTypeSubscription = this.form.controls.destinationNetworkType.valueChanges.subscribe(destinationNetworkType => {
      // Reset all destination validators and values first
      destinationIpAddress.setValue(null);
      destinationIpAddress.setValidators(null);
      destinationNetworkObject.setValue(null);
      destinationNetworkObject.setValidators(null);
      destinationNetworkObjectGroup.setValue(null);
      destinationNetworkObjectGroup.setValidators(null);
      if (this.isTenantV2Mode) {
        destinationEndpointGroup.setValue(null);
        destinationEndpointGroup.setValidators(null);
        destinationEndpointSecurityGroup.setValue(null);
        destinationEndpointSecurityGroup.setValidators(null);
      }

      switch (destinationNetworkType) {
        case FirewallRuleDestinationAddressTypeEnum.IpAddress:
          destinationIpAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
          break;
        case FirewallRuleDestinationAddressTypeEnum.NetworkObject:
          destinationNetworkObject.setValidators(Validators.required);
          break;
        case FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup:
          destinationNetworkObjectGroup.setValidators(Validators.required);
          break;
        case FirewallRuleDestinationAddressTypeEnum.EndpointGroup:
          if (this.isTenantV2Mode) {
            destinationEndpointGroup.setValidators(Validators.required);
          }
          break;
        case FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup:
          if (this.isTenantV2Mode) {
            destinationEndpointSecurityGroup.setValidators(Validators.required);
          }
          break;
        default:
          break;
      }

      destinationIpAddress.updateValueAndValidity();
      destinationNetworkObject.updateValueAndValidity();
      destinationNetworkObjectGroup.updateValueAndValidity();
      if (this.isTenantV2Mode) {
        destinationEndpointGroup.updateValueAndValidity();
        destinationEndpointSecurityGroup.updateValueAndValidity();
      }
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
      this.disableAppIdIcmp = false;

      if (protocol === 'ICMP') {
        this.disableAppIdIcmp = true;
        this.appIdService.resetDto();
      }

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
      sourceNetworkType: [FirewallRuleSourceAddressTypeEnum.IpAddress],
      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      sourceNetworkObject: [''],
      sourceNetworkObjectGroup: [''],
      sourceEndpointGroup: [''],
      sourceEndpointSecurityGroup: [''],

      // Source Service Info
      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],

      // Destination Network Info
      destinationNetworkType: [FirewallRuleDestinationAddressTypeEnum.IpAddress],
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      destinationNetworkObject: [''],
      destinationNetworkObjectGroup: [''],
      destinationEndpointGroup: [''],
      destinationEndpointSecurityGroup: [''],

      // Destination Service Info
      serviceType: ['Port'],
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      serviceObject: [''],
      serviceObjectGroup: [''],

      logging: [false, Validators.required],
      enabled: [true, Validators.required],
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

  getToolTipMessage(): string {
    if (this.isRefreshingAppId) {
      return 'The App ID is currently refreshing, please wait.';
    }

    if (this.disableAppIdIcmp) {
      return 'App ID unvailable for ICMP.';
    }

    return '';
  }

  getObjectInfo(property, objectType, objectId) {
    if (objectId) {
      switch (objectType) {
        case FirewallRuleSourceAddressTypeEnum.NetworkObject:
        case FirewallRuleDestinationAddressTypeEnum.NetworkObject: {
          this.handleNetworkObject(property, objectId);
          break;
        }
        case FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup:
        case FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup: {
          this.handleNetworkObjectGroup(property, objectId);
          break;
        }
        case FirewallRuleServiceTypeEnum.ServiceObject: {
          this.handleServiceObject(property, objectId);
          break;
        }
        case FirewallRuleServiceTypeEnum.ServiceObjectGroup: {
          this.handleServiceObjectGroup(property, objectId);
          break;
        }
        // TODO: Add cases for EndpointGroup and EndpointSecurityGroup if info popups are needed
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

  handleAppIdRefresh(isRefreshing: boolean): void {
    this.isRefreshingAppId = isRefreshing;
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
    this.endpointGroups = [];
    this.endpointSecurityGroups = [];
    this.buildForm();
    this.setFormValidators();
    this.appIdService.resetDto();
  }

  public isAppIdEmpty(): boolean {
    return this.appIdService.isDtoEmpty();
  }

  ngOnInit() {
    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(this.activatedRoute);
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
