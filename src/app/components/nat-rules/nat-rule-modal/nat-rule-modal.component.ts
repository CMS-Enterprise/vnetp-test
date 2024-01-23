import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NameValidator } from 'src/app/validators/name-validator';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import {
  NatRuleDirectionEnum,
  NatRuleOriginalDestinationAddressTypeEnum,
  NatRuleOriginalServiceTypeEnum,
  NatRuleOriginalSourceAddressTypeEnum,
  NatRuleTranslatedDestinationAddressTypeEnum,
  NatRuleTranslatedServiceTypeEnum,
  NatRuleTranslatedSourceAddressTypeEnum,
  NatRuleTranslationTypeEnum,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  Zone,
} from 'client';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NatRuleModalDto } from '../../../models/nat/nat-rule-modal-dto';
import FormUtils from '../../../utils/FormUtils';
import { NatRuleModalHelpText } from '../../../helptext/help-text-networking';

@Component({
  selector: 'app-nat-rule-modal',
  styleUrls: ['./nat-rule-modal.component.scss'],
  templateUrl: './nat-rule-modal.component.html',
})
export class NatRuleModalComponent implements OnInit, OnDestroy {
  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;

  public form: UntypedFormGroup;
  public submitted = false;
  public modalMode: ModalMode;
  public natRuleGroupId: string;
  public natRuleId: string;
  public zones: Zone[] = [];
  public selectedFromZones: Zone[] = [];

  // Enums
  public NatRuleDirection = NatRuleDirectionEnum;
  public NatRuleTranslationType = NatRuleTranslationTypeEnum;
  public NatRuleOriginalSourceAddressType = NatRuleOriginalSourceAddressTypeEnum;
  public NatRuleTranslatedSourceAddressType = NatRuleTranslatedSourceAddressTypeEnum;
  public NatRuleOriginalDestinationAddressType = NatRuleOriginalDestinationAddressTypeEnum;
  public NatRuleTranslatedDestinationAddressType = NatRuleTranslatedDestinationAddressTypeEnum;
  public NatRuleOriginalServiceType = NatRuleOriginalServiceTypeEnum;
  public NatRuleTranslatedServiceType = NatRuleTranslatedServiceTypeEnum;
  public NatRuleGroupType = 'Intervrf';

  private subscriptions: Subscription[] = [];
  private objectInfoSubscription: Subscription;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private natRuleService: V1NetworkSecurityNatRulesService,
    public helpText: NatRuleModalHelpText,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe(this.subscriptions);
  }

  public initNatRule(): void {
    const dto = Object.assign({}, this.ngx.getModalData('natRuleModal') as NatRuleModalDto);
    this.modalMode = dto.modalMode;
    this.NatRuleGroupType = dto.GroupType;

    if (this.NatRuleGroupType === 'ZoneBased') {
      this.zones = dto.Zones;
      if (dto.natRule.fromZone != null) {
        this.selectedFromZones = dto.natRule.fromZone;
      } else {
        this.selectedFromZones = [];
      }
      this.form.controls.direction.setValidators(null);
      this.form.controls.direction.updateValueAndValidity();
      this.form.controls.toZone.setValue(dto.natRule.toZoneId);
      this.form.controls.toZone.setValidators(Validators.required);
      this.form.controls.toZone.updateValueAndValidity();
    } else {
      this.form.controls.direction.setValidators(Validators.required);
      this.form.controls.direction.updateValueAndValidity();
      this.form.controls.toZone.setValidators(null);
      this.form.controls.toZone.updateValueAndValidity();
    }

    const { natRule } = dto;
    if (dto.modalMode === ModalMode.Edit) {
      this.natRuleId = natRule.id;
    }
    if (natRule !== undefined) {
      this.modalPropertyChecker(natRule);
      this.form.patchValue(natRule);
    }
    this.networkObjects = dto.NetworkObjects;
    this.networkObjectGroups = dto.NetworkObjectGroups;
    this.serviceObjects = dto.ServiceObjects;
    this.natRuleGroupId = dto.natRuleGroupId;
  }

  public closeModal(): void {
    this.ngx.close('natRuleModal');
    this.reset();
  }

  public reset(): void {
    SubscriptionUtil.unsubscribe(this.subscriptions);
    this.ngx.resetModalData('natRuleModal');
    this.submitted = false;
    this.initForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      console.log('form invalid');
      console.log(new FormUtils().findInvalidControlsRecursive(this.form));
      return;
    }
    const modalNatRule = this.form.getRawValue();
    modalNatRule.originalServiceObjectId = null;
    modalNatRule.originalSourceNetworkObjectId = null;
    modalNatRule.originalSourceNetworkObjectGroupId = null;
    modalNatRule.originalDestinationNetworkObjectId = null;
    modalNatRule.originalDestinationNetworkObjectGroupId = null;
    modalNatRule.translatedServiceObjectId = null;
    modalNatRule.translatedSourceNetworkObjectId = null;
    modalNatRule.translatedSourceNetworkObjectGroupId = null;
    modalNatRule.translatedDestinationNetworkObjectId = null;
    modalNatRule.translatedDestinationNetworkObjectGroupId = null;
    if (modalNatRule.originalServiceType === NatRuleOriginalServiceTypeEnum.ServiceObject) {
      modalNatRule.originalServiceObjectId = modalNatRule.originalServiceObject;
      delete modalNatRule.originalServiceObject;
    }
    if (modalNatRule.originalSourceAddressType === NatRuleOriginalSourceAddressTypeEnum.NetworkObject) {
      modalNatRule.originalSourceNetworkObjectId = modalNatRule.originalSourceNetworkObject;
      delete modalNatRule.originalSourceNetworkObject;
    } else if (modalNatRule.originalSourceAddressType === NatRuleOriginalSourceAddressTypeEnum.NetworkObjectGroup) {
      modalNatRule.originalSourceNetworkObjectGroupId = modalNatRule.originalSourceNetworkObjectGroup;
      delete modalNatRule.originalSourceNetworkObjectGroup;
    }
    if (modalNatRule.originalDestinationAddressType === NatRuleOriginalDestinationAddressTypeEnum.NetworkObject) {
      modalNatRule.originalDestinationNetworkObjectId = modalNatRule.originalDestinationNetworkObject;
      delete modalNatRule.originalDestinationNetworkObject;
    } else if (modalNatRule.originalDestinationAddressType === NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup) {
      modalNatRule.originalDestinationNetworkObjectGroupId = modalNatRule.originalDestinationNetworkObjectGroup;
      delete modalNatRule.originalDestinationNetworkObjectGroup;
    }
    if (modalNatRule.translatedServiceType === NatRuleTranslatedServiceTypeEnum.ServiceObject) {
      modalNatRule.translatedServiceObjectId = modalNatRule.translatedServiceObject;
      delete modalNatRule.translatedServiceObject;
    }
    if (modalNatRule.translatedSourceAddressType === NatRuleTranslatedSourceAddressTypeEnum.NetworkObject) {
      modalNatRule.translatedSourceNetworkObjectId = modalNatRule.translatedSourceNetworkObject;
      delete modalNatRule.translatedSourceNetworkObject;
    } else if (modalNatRule.translatedSourceAddressType === NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup) {
      modalNatRule.translatedSourceNetworkObjectGroupId = modalNatRule.translatedSourceNetworkObjectGroup;
      delete modalNatRule.translatedSourceNetworkObjectGroup;
    }
    if (modalNatRule.translatedDestinationAddressType === NatRuleTranslatedDestinationAddressTypeEnum.NetworkObject) {
      modalNatRule.translatedDestinationNetworkObjectId = modalNatRule.translatedDestinationNetworkObject;
      delete modalNatRule.translatedDestinationNetworkObject;
    } else if (modalNatRule.translatedDestinationAddressType === NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup) {
      modalNatRule.translatedDestinationNetworkObjectGroupId = modalNatRule.translatedDestinationNetworkObjectGroup;
      delete modalNatRule.translatedDestinationNetworkObjectGroup;
    }

    if (this.NatRuleGroupType === 'ZoneBased') {
      modalNatRule.toZoneId = modalNatRule.toZone;
      delete modalNatRule.toZone;
      modalNatRule.fromZone = this.selectedFromZones;
      modalNatRule.direction = null;
    } else {
      modalNatRule.toZoneId = null;
      modalNatRule.fromZone = null;
      modalNatRule.direction = this.form.controls.direction.value;
    }

    if (this.modalMode === ModalMode.Create) {
      modalNatRule.natRuleGroupId = this.natRuleGroupId;
      this.natRuleService
        .createOneNatRule({
          natRule: modalNatRule,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.natRuleService
        .updateOneNatRule({
          id: this.natRuleId,
          natRule: modalNatRule,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
  }

  private initForm(): void {
    if (this.form) {
      this.form.reset();
    }
    this.form = this.formBuilder.group({
      biDirectional: [false],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      direction: [NatRuleDirectionEnum.In],
      toZone: [null],
      selectedFromZone: [''],
      enabled: [true, Validators.required],
      name: ['', NameValidator(3, 60)],
      originalDestinationAddressType: [NatRuleOriginalDestinationAddressTypeEnum.None, Validators.required],
      originalDestinationNetworkObject: null,
      originalDestinationNetworkObjectGroup: null,
      originalServiceObject: null,
      originalServiceType: [NatRuleOriginalServiceTypeEnum.None, Validators.required],
      originalSourceAddressType: [NatRuleOriginalSourceAddressTypeEnum.None, Validators.required],
      originalSourceNetworkObject: null,
      originalSourceNetworkObjectGroup: null,
      ruleIndex: [1, Validators.compose([Validators.required, Validators.min(1)])],
      translatedDestinationAddressType: [NatRuleTranslatedDestinationAddressTypeEnum.None, Validators.required],
      translatedDestinationNetworkObject: null,
      translatedDestinationNetworkObjectGroup: null,
      translatedServiceObject: null,
      translatedServiceType: [NatRuleTranslatedServiceTypeEnum.None, Validators.required],
      translatedSourceAddressType: [NatRuleTranslatedSourceAddressTypeEnum.None, Validators.required],
      translatedSourceNetworkObject: null,
      translatedSourceNetworkObjectGroup: null,
      translationType: [NatRuleTranslationTypeEnum.Static, Validators.required],
    });

    this.form.updateValueAndValidity();

    this.subscriptions = [
      this.subscribeToBiDirectionalChanges(),
      this.subscribeToOriginalDestinationAddressTypeChanges(),
      this.subscribeToOriginalServiceTypeChanges(),
      this.subscribeToOriginalSourceAddressTypeChanges(),
      this.subscribeToTranslatedDestinationAddressTypeChanges(),
      this.subscribeToTranslatedServiceTypeChanges(),
      this.subscribeToTranslatedSourceAddressTypeChanges(),
      this.subscribeToTranslationTypeChanges(),
    ];
  }

  private subscribeToBiDirectionalChanges(): Subscription {
    const { biDirectional, translationType } = this.form.controls;

    const handler: Record<string, () => void> = {
      ['true']: () => {
        translationType.setValue(NatRuleTranslationTypeEnum.Static);
        translationType.updateValueAndValidity();
      },
    };
    return biDirectional.valueChanges.subscribe(
      (type: string) => {
        this.updateForm(type, handler);
      },
      () => {},
    );
  }

  // when the original service type is updated, update the appropriate form controls
  private subscribeToOriginalServiceTypeChanges(): Subscription {
    const { originalServiceType, originalServiceObject, translatedServiceType, translatedServiceObject } = this.form.controls;

    const handler: Record<NatRuleOriginalServiceTypeEnum, () => void> = {
      [NatRuleOriginalServiceTypeEnum.None]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.clearValidators();
        originalServiceObject.updateValueAndValidity();
        translatedServiceType.setValue(NatRuleTranslatedServiceTypeEnum.None);
        translatedServiceType.updateValueAndValidity();
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObject.updateValueAndValidity();
      },
      [NatRuleOriginalServiceTypeEnum.ServiceObject]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.setValidators(Validators.required);
        originalServiceObject.updateValueAndValidity();
      },
    };
    return originalServiceType.valueChanges.subscribe(
      (type: NatRuleOriginalServiceTypeEnum) => {
        this.updateForm(type, handler);
      },
      () => {},
    );
  }

  // when the translated service type is updated, update the appropriate form controls
  private subscribeToTranslatedServiceTypeChanges(): Subscription {
    const { translatedServiceType, translatedServiceObject, originalServiceType, originalServiceObject } = this.form.controls;

    const handler: Record<NatRuleTranslatedServiceTypeEnum, () => void> = {
      [NatRuleTranslatedServiceTypeEnum.None]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObject.updateValueAndValidity();
      },
      [NatRuleTranslatedServiceTypeEnum.ServiceObject]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.setValidators(Validators.required);
        if (originalServiceType.value !== NatRuleOriginalServiceTypeEnum.ServiceObject) {
          originalServiceType.setValue(NatRuleOriginalServiceTypeEnum.ServiceObject);
          originalServiceObject.setValidators(Validators.required);
          originalServiceObject.updateValueAndValidity();
          originalServiceType.updateValueAndValidity();
        }
        translatedServiceObject.updateValueAndValidity();
      },
    };
    return translatedServiceType.valueChanges.subscribe((type: NatRuleTranslatedServiceTypeEnum) => this.updateForm(type, handler));
  }

  // when the original destination address is updated, update the appropriate form controls
  private subscribeToOriginalDestinationAddressTypeChanges(): Subscription {
    const { originalDestinationAddressType, originalDestinationNetworkObject, originalDestinationNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalDestinationAddressTypeEnum, () => void> = {
      [NatRuleOriginalDestinationAddressTypeEnum.None]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.clearValidators();
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.clearValidators();
        originalDestinationNetworkObject.updateValueAndValidity();
        originalDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalDestinationAddressTypeEnum.NetworkObject]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.setValidators(Validators.required);
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.clearValidators();
        originalDestinationNetworkObject.updateValueAndValidity();
        originalDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.clearValidators();
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.setValidators(Validators.required);
        originalDestinationNetworkObject.updateValueAndValidity();
        originalDestinationNetworkObjectGroup.updateValueAndValidity();
      },
    };
    return originalDestinationAddressType.valueChanges.subscribe((type: NatRuleOriginalDestinationAddressTypeEnum) =>
      this.updateForm(type, handler),
    );
  }

  // when the translation type is updated, update the appropriate form controls
  private subscribeToTranslationTypeChanges(): Subscription {
    const { biDirectional, originalSourceAddressType, translatedDestinationAddressType, translatedSourceAddressType, translationType } =
      this.form.controls;

    const requireTranslatedFields = () => {
      if (translatedSourceAddressType.value === NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup) {
        translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressTypeEnum.None);
      }
      if (translatedDestinationAddressType.value === NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup) {
        translatedDestinationAddressType.setValue(NatRuleTranslatedDestinationAddressTypeEnum.None);
      }
      translatedSourceAddressType.setValidators(Validators.required);
      translatedDestinationAddressType.setValidators(Validators.required);
      translatedSourceAddressType.updateValueAndValidity();
      translatedDestinationAddressType.updateValueAndValidity();
    };

    const translationTypeNotStatic = () => {
      if (translatedSourceAddressType.value === NatRuleTranslatedSourceAddressTypeEnum.None) {
        translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressTypeEnum.NetworkObject);
        translatedSourceAddressType.setValidators(Validators.required);
      }
      if (originalSourceAddressType.value === NatRuleOriginalSourceAddressTypeEnum.None) {
        originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
        originalSourceAddressType.setValidators(Validators.required);
      }
      biDirectional.setValue(false);
      biDirectional.updateValueAndValidity();
      translatedSourceAddressType.updateValueAndValidity();
      originalSourceAddressType.updateValueAndValidity();
    };

    const handler: Record<NatRuleTranslationTypeEnum, () => void> = {
      [NatRuleTranslationTypeEnum.Static]: requireTranslatedFields,
      [NatRuleTranslationTypeEnum.DynamicIp]: translationTypeNotStatic,
      [NatRuleTranslationTypeEnum.DynamicIpAndPort]: translationTypeNotStatic,
    };
    return translationType.valueChanges.subscribe((type: NatRuleTranslationTypeEnum) => this.updateForm(type, handler));
  }

  // when the original source address type is updated, update the appropriate form controls
  private subscribeToOriginalSourceAddressTypeChanges(): Subscription {
    const { originalSourceAddressType, originalSourceNetworkObject, originalSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalSourceAddressTypeEnum, () => void> = {
      [NatRuleOriginalSourceAddressTypeEnum.None]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
        originalSourceNetworkObject.updateValueAndValidity();
        originalSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalSourceAddressTypeEnum.NetworkObject]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.setValidators(Validators.required);
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
        originalSourceNetworkObject.updateValueAndValidity();
        originalSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalSourceAddressTypeEnum.NetworkObjectGroup]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.setValidators(Validators.required);
        originalSourceNetworkObject.updateValueAndValidity();
        originalSourceNetworkObjectGroup.updateValueAndValidity();
      },
    };

    return originalSourceAddressType.valueChanges.subscribe((type: NatRuleOriginalSourceAddressTypeEnum) => this.updateForm(type, handler));
  }

  // when the translated service type is updated, update the appropriate form controls
  private subscribeToTranslatedSourceAddressTypeChanges(): Subscription {
    const { translatedSourceAddressType, originalSourceAddressType, translatedSourceNetworkObject, translatedSourceNetworkObjectGroup } =
      this.form.controls;

    const handler: Record<NatRuleTranslatedSourceAddressTypeEnum, () => void> = {
      [NatRuleTranslatedSourceAddressTypeEnum.None]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
        translatedSourceNetworkObject.updateValueAndValidity();
        translatedSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleTranslatedSourceAddressTypeEnum.NetworkObject]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.setValidators(Validators.required);
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
        translatedSourceNetworkObject.updateValueAndValidity();
        translatedSourceNetworkObjectGroup.updateValueAndValidity();
        if (originalSourceAddressType.value === NatRuleOriginalSourceAddressTypeEnum.None) {
          originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
          originalSourceAddressType.setValidators(Validators.required);
          originalSourceAddressType.updateValueAndValidity();
        }
      },
      [NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.setValidators(Validators.required);
        translatedSourceNetworkObject.updateValueAndValidity();
        translatedSourceNetworkObjectGroup.updateValueAndValidity();
        if (originalSourceAddressType.value === NatRuleOriginalSourceAddressTypeEnum.None) {
          originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
          originalSourceAddressType.setValidators(Validators.required);
          originalSourceAddressType.updateValueAndValidity();
        }
      },
    };
    return translatedSourceAddressType.valueChanges.subscribe((type: NatRuleTranslatedSourceAddressTypeEnum) =>
      this.updateForm(type, handler),
    );
  }

  // when the translated destination type is updated, update the appropriate form controls
  private subscribeToTranslatedDestinationAddressTypeChanges(): Subscription {
    const {
      translatedDestinationAddressType,
      originalDestinationAddressType,
      translatedDestinationNetworkObject,
      translatedDestinationNetworkObjectGroup,
    } = this.form.controls;

    const handler: Record<NatRuleTranslatedDestinationAddressTypeEnum, () => void> = {
      [NatRuleTranslatedDestinationAddressTypeEnum.None]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
        translatedDestinationNetworkObject.updateValueAndValidity();
        translatedDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleTranslatedDestinationAddressTypeEnum.NetworkObject]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.setValidators(Validators.required);
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
        translatedDestinationNetworkObject.updateValueAndValidity();
        translatedDestinationNetworkObjectGroup.updateValueAndValidity();
        if (originalDestinationAddressType.value === NatRuleOriginalDestinationAddressTypeEnum.None) {
          originalDestinationAddressType.setValue(NatRuleOriginalDestinationAddressTypeEnum.NetworkObject);
          originalDestinationAddressType.setValidators(Validators.required);
          originalDestinationAddressType.updateValueAndValidity();
        }
      },
      [NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.setValidators(Validators.required);
        translatedDestinationNetworkObject.updateValueAndValidity();
        translatedDestinationNetworkObjectGroup.updateValueAndValidity();
        if (originalDestinationAddressType.value === NatRuleOriginalDestinationAddressTypeEnum.None) {
          originalDestinationAddressType.setValue(NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup);
          originalDestinationAddressType.setValidators(Validators.required);
          originalDestinationAddressType.updateValueAndValidity();
        }
      },
    };
    return translatedDestinationAddressType.valueChanges.subscribe((type: NatRuleTranslatedDestinationAddressTypeEnum) =>
      this.updateForm(type, handler),
    );
  }

  private updateForm<T extends string>(newValue: T, valueHandler: Record<T, () => void>): void {
    const fn = valueHandler[newValue] || (() => {});
    fn();
    this.form.updateValueAndValidity();
  }

  private modalPropertyChecker(modalNatRule) {
    for (const [key, value] of Object.entries(modalNatRule)) {
      if (value != null) {
        const property = key.slice(0, key.length - 2);
        modalNatRule[property] = value;
      }
    }

    return modalNatRule;
  }

  subscribeToObjectInfoModal() {
    this.objectInfoSubscription = this.ngx.getModal('natRuleObjectInfoModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('natRuleObjectInfoModal');
    });
  }

  getObjectInfo(property, objectType, objectId) {
    if (objectId) {
      switch (objectType) {
        case 'NetworkObject': {
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
            this.ngx.setModalData(dto, 'natRuleObjectInfoModal');
            this.ngx.getModal('natRuleObjectInfoModal').open();
          });
          break;
        }
        case 'NetworkObjectGroup': {
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
            this.ngx.setModalData(dto, 'natRuleObjectInfoModal');
            this.ngx.getModal('natRuleObjectInfoModal').open();
          });
          break;
        }
        case 'ServiceObject': {
          this.serviceObjectService.getOneServiceObject({ id: objectId }).subscribe(data => {
            const objectName = data.name;
            const modalTitle = `${property} : ${objectName}`;
            const modalBody = [
              `Protocol : ${data.protocol}, Source Ports: ${data.sourcePorts}, Destination Ports: ${data.destinationPorts}`,
            ];
            const dto = {
              modalTitle,
              modalBody,
            };
            this.subscribeToObjectInfoModal();
            this.ngx.setModalData(dto, 'natRuleObjectInfoModal');
            this.ngx.getModal('natRuleObjectInfoModal').open();
          });
          break;
        }
        case 'ServiceObjectGroup': {
          this.serviceObjectGroupService.getOneServiceObjectGroup({ id: objectId, join: ['serviceObjects'] }).subscribe(data => {
            const members = data.serviceObjects;
            const memberDetails = members.map(member => {
              let returnValue = `Name: ${member.name} ---`;

              // eslint-disable-next-line
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
            this.ngx.setModalData(dto, 'natRuleObjectInfoModal');
            this.ngx.getModal('natRuleObjectInfoModal').open();
          });
          break;
        }
      }
    }
  }

  addZone() {
    const zoneId = this.form.controls.selectedFromZone.value;
    const zone = this.zones.find(z => z.id === zoneId);
    if (!this.selectedFromZones.find(z => z.id === zone.id)) {
      this.selectedFromZones.push(zone);
    }
    this.form.controls.selectedFromZone.setValue(null);
  }

  removeZone(id: string) {
    this.selectedFromZones = this.selectedFromZones.filter(z => z.id !== id);
  }
}
