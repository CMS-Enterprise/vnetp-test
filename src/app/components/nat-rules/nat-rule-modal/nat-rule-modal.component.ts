import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NameValidator } from 'src/app/validators/name-validator';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import {
  NatRuleDirection,
  NatRuleOriginalDestinationAddressType,
  NatRuleOriginalServiceType,
  NatRuleOriginalSourceAddressType,
  NatRuleTranslatedDestinationAddressType,
  NatRuleTranslatedServiceType,
  NatRuleTranslatedSourceAddressType,
  NatRuleTranslationType,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  V1NetworkSecurityNatRulesService,
} from 'api_client';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NatRuleModalDto } from '../../../models/nat/nat-rule-modal-dto';

@Component({
  selector: 'app-nat-rule-modal',
  templateUrl: './nat-rule-modal.component.html',
})
export class NatRuleModalComponent implements OnInit, OnDestroy {
  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;

  serviceObjects: Array<ServiceObject>;

  public form: FormGroup;
  public submitted = false;
  public modalMode: ModalMode;
  public natRuleGroupId: string;
  public natRuleId: string;

  // Enums
  public NatRuleDirection = NatRuleDirection;
  public NatRuleTranslationType = NatRuleTranslationType;
  public NatRuleOriginalSourceAddressType = NatRuleOriginalSourceAddressType;
  public NatRuleTranslatedSourceAddressType = NatRuleTranslatedSourceAddressType;
  public NatRuleOriginalDestinationAddressType = NatRuleOriginalDestinationAddressType;
  public NatRuleTranslatedDestinationAddressType = NatRuleTranslatedDestinationAddressType;
  public NatRuleOriginalServiceType = NatRuleOriginalServiceType;
  public NatRuleTranslatedServiceType = NatRuleTranslatedServiceType;

  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private natRuleService: V1NetworkSecurityNatRulesService,
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
    const { natRule } = dto;
    if (dto.modalMode === ModalMode.Edit) {
      this.natRuleId = natRule.id;
    } else {
      this.f.name.enable();
    }
    if (natRule !== undefined) {
      this.modalPropertyChecker(natRule);
      this.form.patchValue(natRule);
      this.f.name.disable();
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
      return;
    }
    const modalNatRule = this.form.value;
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
    if (modalNatRule.biDirectional === 'false') {
      modalNatRule.biDirectional = false;
    } else {
      modalNatRule.biDirectional = true;
    }
    if (modalNatRule.originalServiceType === NatRuleOriginalServiceType.ServiceObject) {
      modalNatRule.originalServiceObjectId = modalNatRule.originalServiceObject;
      modalNatRule.originalServiceObject = null;
    }
    if (modalNatRule.originalSourceAddressType === NatRuleOriginalSourceAddressType.NetworkObject) {
      modalNatRule.originalSourceNetworkObjectId = modalNatRule.originalSourceNetworkObject;
      modalNatRule.originalSourceNetworkObject = null;
    } else if (modalNatRule.originalSourceAddressType === NatRuleOriginalSourceAddressType.NetworkObjectGroup) {
      modalNatRule.originalSourceNetworkObjectGroupId = modalNatRule.originalSourceNetworkObjectGroup;
      modalNatRule.originalSourceNetworkObjectGroup = null;
    }
    if (modalNatRule.originalDestinationAddressType === NatRuleOriginalDestinationAddressType.NetworkObject) {
      modalNatRule.originalDestinationNetworkObjectId = modalNatRule.originalDestinationNetworkObject;
      modalNatRule.originalDestinationNetworkObject = null;
    } else if (modalNatRule.originalDestinationAddressType === NatRuleOriginalDestinationAddressType.NetworkObjectGroup) {
      modalNatRule.originalDestinationNetworkObjectGroupId = modalNatRule.originalDestinationNetworkObjectGroup;
      modalNatRule.originalDestinationNetworkObjectGroup = null;
    }
    if (modalNatRule.translatedServiceType === NatRuleTranslatedServiceType.ServiceObject) {
      modalNatRule.translatedServiceObjectId = modalNatRule.translatedServiceObject;
      modalNatRule.translatedServiceObject = null;
    }
    if (modalNatRule.translatedSourceAddressType === NatRuleTranslatedSourceAddressType.NetworkObject) {
      modalNatRule.translatedSourceNetworkObjectId = modalNatRule.translatedSourceNetworkObject;
      modalNatRule.translatedSourceNetworkObject = null;

      // add form validation
      if (modalNatRule.originalSourceAddressType === NatRuleOriginalSourceAddressType.None) {
        console.log('original source address type must not be none!!!!!');
        return;
      }
    } else if (modalNatRule.translatedSourceAddressType === NatRuleTranslatedSourceAddressType.NetworkObjectGroup) {
      modalNatRule.translatedSourceNetworkObjectGroupId = modalNatRule.translatedSourceNetworkObjectGroup;
      modalNatRule.translatedSourceNetworkObjectGroup = null;
    }
    if (modalNatRule.translatedDestinationAddressType === NatRuleTranslatedDestinationAddressType.NetworkObject) {
      modalNatRule.translatedDestinationNetworkObjectId = modalNatRule.translatedDestinationNetworkObject;
      modalNatRule.translatedDestinationNetworkObject = null;

      // add form validation
      if (modalNatRule.originalDestinationAddressType === NatRuleOriginalDestinationAddressType.None) {
        console.log('original destination address type must not be none!!!!');
        return;
      }
    } else if (modalNatRule.translatedDestinationAddressType === NatRuleTranslatedDestinationAddressType.NetworkObjectGroup) {
      modalNatRule.translatedDestinationNetworkObjectGroupId = modalNatRule.translatedDestinationNetworkObjectGroup;
      modalNatRule.translatedDestinationNetworkObjectGroup = null;
    }

    if (this.modalMode === ModalMode.Create) {
      modalNatRule.natRuleGroupId = this.natRuleGroupId;
      this.natRuleService
        .v1NetworkSecurityNatRulesPost({
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
        .v1NetworkSecurityNatRulesIdPut({
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
    this.form = this.formBuilder.group({
      biDirectional: [true],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      direction: [NatRuleDirection.In, Validators.required],
      enabled: [true, Validators.required],
      name: ['', NameValidator()],
      originalDestinationAddressType: [NatRuleOriginalDestinationAddressType.None, Validators.required],
      originalDestinationNetworkObject: null,
      originalDestinationNetworkObjectGroup: null,
      originalServiceObject: null,
      originalServiceType: [NatRuleOriginalServiceType.None, Validators.required],
      originalSourceAddressType: [NatRuleOriginalSourceAddressType.None, Validators.required],
      originalSourceNetworkObject: null,
      originalSourceNetworkObjectGroup: null,
      ruleIndex: [1, Validators.compose([Validators.required, Validators.min(1)])],
      translatedDestinationAddressType: [NatRuleTranslatedDestinationAddressType.None, Validators.required],
      translatedDestinationNetworkObject: null,
      translatedDestinationNetworkObjectGroup: null,
      translatedServiceObject: null,
      translatedServiceType: [NatRuleTranslatedServiceType.None, Validators.required],
      translatedSourceAddressType: [NatRuleTranslatedSourceAddressType.None, Validators.required],
      translatedSourceNetworkObject: null,
      translatedSourceNetworkObjectGroup: null,
      translationType: [NatRuleTranslationType.Static, Validators.required],
    });

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
        translationType.setValue(NatRuleTranslationType.Static);
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

    const handler: Record<NatRuleOriginalServiceType, () => void> = {
      [NatRuleOriginalServiceType.None]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.clearValidators();
        originalServiceObject.updateValueAndValidity();
        translatedServiceType.setValue(NatRuleTranslatedServiceType.None);
        translatedServiceType.updateValueAndValidity();
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObject.updateValueAndValidity();
      },
      [NatRuleOriginalServiceType.ServiceObject]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.setValidators(Validators.required);
        originalServiceObject.updateValueAndValidity();
      },
    };
    return originalServiceType.valueChanges.subscribe(
      (type: NatRuleOriginalServiceType) => {
        this.updateForm(type, handler);
      },
      () => {},
    );
  }

  // when the translated service type is updated, update the appropriate form controls
  private subscribeToTranslatedServiceTypeChanges(): Subscription {
    const { translatedServiceType, translatedServiceObject, originalServiceType, originalServiceObject } = this.form.controls;

    const handler: Record<NatRuleTranslatedServiceType, () => void> = {
      [NatRuleTranslatedServiceType.None]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObject.updateValueAndValidity();
      },
      [NatRuleTranslatedServiceType.ServiceObject]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.setValidators(Validators.required);
        if (originalServiceType.value !== NatRuleOriginalServiceType.ServiceObject) {
          originalServiceType.setValue(NatRuleOriginalServiceType.ServiceObject);
          originalServiceObject.setValidators(Validators.required);
          originalServiceObject.updateValueAndValidity();
          originalServiceType.updateValueAndValidity();
        }
        translatedServiceObject.updateValueAndValidity();
      },
    };
    return translatedServiceType.valueChanges.subscribe((type: NatRuleTranslatedServiceType) => this.updateForm(type, handler));
  }

  // when the original destination address is updated, update the appropriate form controls
  private subscribeToOriginalDestinationAddressTypeChanges(): Subscription {
    const { originalDestinationAddressType, originalDestinationNetworkObject, originalDestinationNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalDestinationAddressType, () => void> = {
      [NatRuleOriginalDestinationAddressType.None]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.clearValidators();
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.clearValidators();
        originalDestinationNetworkObject.updateValueAndValidity();
        originalDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalDestinationAddressType.NetworkObject]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.setValidators(Validators.required);
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.clearValidators();
        originalDestinationNetworkObject.updateValueAndValidity();
        originalDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalDestinationAddressType.NetworkObjectGroup]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.clearValidators();
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.setValidators(Validators.required);
        originalDestinationNetworkObject.updateValueAndValidity();
        originalDestinationNetworkObjectGroup.updateValueAndValidity();
      },
    };
    return originalDestinationAddressType.valueChanges.subscribe((type: NatRuleOriginalDestinationAddressType) =>
      this.updateForm(type, handler),
    );
  }

  // when the translation type is updated, update the appropriate form controls
  private subscribeToTranslationTypeChanges(): Subscription {
    const { biDirectional, translatedDestinationAddressType, translatedSourceAddressType, translationType } = this.form.controls;

    const requireTranslatedFields = () => {
      if (translatedSourceAddressType.value === NatRuleTranslatedSourceAddressType.NetworkObjectGroup) {
        translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressType.None);
      }
      if (translatedDestinationAddressType.value === NatRuleTranslatedDestinationAddressType.NetworkObjectGroup) {
        translatedDestinationAddressType.setValue(NatRuleTranslatedDestinationAddressType.None);
      }
      translatedSourceAddressType.setValidators(Validators.required);
      translatedDestinationAddressType.setValidators(Validators.required);
      translatedSourceAddressType.updateValueAndValidity();
      translatedDestinationAddressType.updateValueAndValidity();
    };

    const translationTypeNotStatic = () => {
      if (translatedSourceAddressType.value === NatRuleTranslatedSourceAddressType.None) {
        translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressType.NetworkObject);
        translatedSourceAddressType.setValidators(Validators.required);
      }
      biDirectional.setValue(false);
      biDirectional.updateValueAndValidity();
      translatedSourceAddressType.updateValueAndValidity();
    };

    const handler: Record<NatRuleTranslationType, () => void> = {
      [NatRuleTranslationType.Static]: requireTranslatedFields,
      [NatRuleTranslationType.DynamicIp]: translationTypeNotStatic,
      [NatRuleTranslationType.DynamicIpAndPort]: translationTypeNotStatic,
    };
    return translationType.valueChanges.subscribe((type: NatRuleTranslationType) => this.updateForm(type, handler));
  }

  // when the original source address type is updated, update the appropriate form controls
  private subscribeToOriginalSourceAddressTypeChanges(): Subscription {
    const { originalSourceAddressType, originalSourceNetworkObject, originalSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalSourceAddressType, () => void> = {
      [NatRuleOriginalSourceAddressType.None]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
        originalSourceNetworkObject.updateValueAndValidity();
        originalSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalSourceAddressType.NetworkObject]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.setValidators(Validators.required);
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
        originalSourceNetworkObject.updateValueAndValidity();
        originalSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleOriginalSourceAddressType.NetworkObjectGroup]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.setValidators(Validators.required);
        originalSourceNetworkObject.updateValueAndValidity();
        originalSourceNetworkObjectGroup.updateValueAndValidity();
      },
    };

    return originalSourceAddressType.valueChanges.subscribe((type: NatRuleOriginalSourceAddressType) => this.updateForm(type, handler));
  }

  // when the translated service type is updated, update the appropriate form controls
  private subscribeToTranslatedSourceAddressTypeChanges(): Subscription {
    const { translatedSourceAddressType, translatedSourceNetworkObject, translatedSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleTranslatedSourceAddressType, () => void> = {
      [NatRuleTranslatedSourceAddressType.None]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
        translatedSourceNetworkObject.updateValueAndValidity();
        translatedSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleTranslatedSourceAddressType.NetworkObject]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.setValidators(Validators.required);
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
        translatedSourceNetworkObject.updateValueAndValidity();
        translatedSourceNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleTranslatedSourceAddressType.NetworkObjectGroup]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.setValidators(Validators.required);
        translatedSourceNetworkObject.updateValueAndValidity();
        translatedSourceNetworkObjectGroup.updateValueAndValidity();
      },
    };
    return translatedSourceAddressType.valueChanges.subscribe((type: NatRuleTranslatedSourceAddressType) => this.updateForm(type, handler));
  }

  // when the translated destination type is updated, update the appropriate form controls
  private subscribeToTranslatedDestinationAddressTypeChanges(): Subscription {
    const {
      translatedDestinationAddressType,
      translatedDestinationNetworkObject,
      translatedDestinationNetworkObjectGroup,
    } = this.form.controls;

    const handler: Record<NatRuleTranslatedDestinationAddressType, () => void> = {
      [NatRuleTranslatedDestinationAddressType.None]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
        translatedDestinationNetworkObject.updateValueAndValidity();
        translatedDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleTranslatedDestinationAddressType.NetworkObject]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.setValidators(Validators.required);
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
        translatedDestinationNetworkObject.updateValueAndValidity();
        translatedDestinationNetworkObjectGroup.updateValueAndValidity();
      },
      [NatRuleTranslatedDestinationAddressType.NetworkObjectGroup]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.setValidators(Validators.required);
        translatedDestinationNetworkObject.updateValueAndValidity();
        translatedDestinationNetworkObjectGroup.updateValueAndValidity();
      },
    };
    return translatedDestinationAddressType.valueChanges.subscribe((type: NatRuleTranslatedDestinationAddressType) =>
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
        const propertyId = property + 'Id';
        modalNatRule[property] = value;
        modalNatRule[propertyId] = null;
      }
    }

    return modalNatRule;
  }
}
