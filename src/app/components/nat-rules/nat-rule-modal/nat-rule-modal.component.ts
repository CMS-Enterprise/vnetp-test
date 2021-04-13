import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
  ServiceObjectGroup,
} from 'api_client';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NatRuleModalDto } from '../models/nat-rule-modal-dto';

@Component({
  selector: 'app-nat-rule-modal',
  templateUrl: './nat-rule-modal.component.html',
})
export class NatRuleModalComponent implements OnInit, OnDestroy {
  // Lookups
  @Input() networkObjectGroups: NetworkObjectGroup[] = [{ id: '1', name: 'Network Object Group 1' } as NetworkObjectGroup];
  @Input() networkObjects: NetworkObject[] = [{ id: '1', name: 'Network Object 1' } as NetworkObject];
  @Input() serviceObjectGroups: ServiceObjectGroup[] = [{ id: '1', name: 'Service Object Group 1' } as ServiceObjectGroup];
  @Input() serviceObjects: ServiceObject[] = [{ id: '1', name: 'Service Object 1' } as ServiceObject];

  public form: FormGroup;
  public submitted = false;

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

  constructor(private formBuilder: FormBuilder, private ngx: NgxSmartModalService) {}

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

    if (dto.modalMode === ModalMode.Edit) {
      const { name } = dto.natRule;

      this.f.name.setValue(name);
      this.f.name.disable();
    }
  }

  public closeModal(): void {
    this.reset();
    this.ngx.closeLatestModal();
  }

  public reset(): void {
    this.ngx.resetModalData('natRuleModal');
    this.submitted = false;
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    console.log(this.form.value);
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      direction: [NatRuleDirection.In, Validators.required],
      name: ['', NameValidator()],
      originalDestinationAddressType: [NatRuleOriginalDestinationAddressType.None, Validators.required],
      originalDestinationNetworkObject: null,
      originalDestinationNetworkObjectGroup: null,
      originalServiceObject: null,
      originalServiceObjectGroup: null,
      originalServiceType: [NatRuleOriginalServiceType.None, Validators.required],
      originalSourceAddressType: [NatRuleOriginalSourceAddressType.None, Validators.required],
      originalSourceNetworkObject: null,
      originalSourceNetworkObjectGroup: null,
      ruleIndex: [null, Validators.compose([Validators.required, Validators.min(1)])],
      translatedDestinationAddressType: null,
      translatedDestinationNetworkObject: null,
      translatedDestinationNetworkObjectGroup: null,
      translatedServiceObject: null,
      translatedServiceObjectGroup: null,
      translatedServiceType: null,
      translatedSourceAddressType: null,
      translatedSourceNetworkObject: null,
      translatedSourceNetworkObjectGroup: null,
      translationType: [NatRuleTranslationType.None, Validators.required],
    });

    this.subscriptions = [
      this.subscribeToOriginalDestinationAddressTypeChanges(),
      this.subscribeToOriginalServiceTypeChanges(),
      this.subscribeToOriginalSourceAddressTypeChanges(),
      this.subscribeToTranslatedDestinationAddressTypeChanges(),
      this.subscribeToTranslatedServiceTypeChanges(),
      this.subscribeToTranslatedSourceAddressTypeChanges(),
      this.subscribeToTranslationTypeChanges(),
    ];
  }

  private subscribeToOriginalServiceTypeChanges(): Subscription {
    const { originalServiceType, originalServiceObject, originalServiceObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalServiceType, () => void> = {
      [NatRuleOriginalServiceType.None]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.clearValidators();
        originalServiceObjectGroup.setValue(null);
        originalServiceObjectGroup.clearValidators();
      },
      [NatRuleOriginalServiceType.ServiceObject]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.setValidators(Validators.required);
        originalServiceObjectGroup.setValue(null);
        originalServiceObjectGroup.clearValidators();
      },
      [NatRuleOriginalServiceType.ServiceObjectGroup]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.clearValidators();
        originalServiceObjectGroup.setValue(null);
        originalServiceObjectGroup.setValidators(Validators.required);
      },
    };
    return originalServiceType.valueChanges.subscribe((type: NatRuleOriginalServiceType) => this.updateForm(type, handler));
  }

  private subscribeToTranslatedServiceTypeChanges(): Subscription {
    const { translatedServiceType, translatedServiceObject, translatedServiceObjectGroup } = this.form.controls;

    const handler: Record<NatRuleTranslatedServiceType, () => void> = {
      [NatRuleTranslatedServiceType.None]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObjectGroup.setValue(null);
        translatedServiceObjectGroup.clearValidators();
      },
      [NatRuleTranslatedServiceType.ServiceObject]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.setValidators(Validators.required);
        translatedServiceObjectGroup.setValue(null);
        translatedServiceObjectGroup.clearValidators();
      },
      [NatRuleTranslatedServiceType.ServiceObjectGroup]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObjectGroup.setValue(null);
        translatedServiceObjectGroup.setValidators(Validators.required);
      },
    };
    return translatedServiceType.valueChanges.subscribe((type: NatRuleTranslatedServiceType) => this.updateForm(type, handler));
  }

  private subscribeToOriginalDestinationAddressTypeChanges(): Subscription {
    const { originalDestinationAddressType, originalDestinationNetworkObject, originalDestinationNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalDestinationAddressType, () => void> = {
      [NatRuleOriginalDestinationAddressType.None]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.clearValidators();
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.clearValidators();
      },
      [NatRuleOriginalDestinationAddressType.NetworkObject]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.setValidators(Validators.required);
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.clearValidators();
      },
      [NatRuleOriginalDestinationAddressType.NetworkObjectGroup]: () => {
        originalDestinationNetworkObject.setValue(null);
        originalDestinationNetworkObject.clearValidators();
        originalDestinationNetworkObjectGroup.setValue(null);
        originalDestinationNetworkObjectGroup.setValidators(Validators.required);
      },
    };
    return originalDestinationAddressType.valueChanges.subscribe((type: NatRuleOriginalDestinationAddressType) =>
      this.updateForm(type, handler),
    );
  }

  private subscribeToTranslationTypeChanges(): Subscription {
    const { translatedDestinationAddressType, translatedServiceType, translatedSourceAddressType, translationType } = this.form.controls;

    const requireTranslatedFields = () => {
      translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressType.None);
      translatedSourceAddressType.setValidators(Validators.required);
      translatedDestinationAddressType.setValue(NatRuleTranslatedDestinationAddressType.None);
      translatedDestinationAddressType.setValidators(Validators.required);
      translatedServiceType.setValue(NatRuleTranslatedServiceType.None);
      translatedServiceType.setValidators(Validators.required);
    };

    const handler: Record<NatRuleTranslationType, () => void> = {
      [NatRuleTranslationType.None]: () => {
        translatedSourceAddressType.setValue(null);
        translatedSourceAddressType.clearValidators();
        translatedDestinationAddressType.setValue(null);
        translatedDestinationAddressType.clearValidators();
        translatedServiceType.setValue(null);
        translatedServiceType.clearValidators();
      },
      [NatRuleTranslationType.Static]: requireTranslatedFields,
      [NatRuleTranslationType.DynamicIp]: requireTranslatedFields,
      [NatRuleTranslationType.DynamicIpAndPort]: requireTranslatedFields,
    };
    return translationType.valueChanges.subscribe((type: NatRuleTranslationType) => this.updateForm(type, handler));
  }

  private subscribeToOriginalSourceAddressTypeChanges(): Subscription {
    const { originalSourceAddressType, originalSourceNetworkObject, originalSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleOriginalSourceAddressType, () => void> = {
      [NatRuleOriginalSourceAddressType.None]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleOriginalSourceAddressType.NetworkObject]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.setValidators(Validators.required);
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleOriginalSourceAddressType.NetworkObjectGroup]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.setValidators(Validators.required);
      },
    };

    return originalSourceAddressType.valueChanges.subscribe((type: NatRuleOriginalSourceAddressType) => this.updateForm(type, handler));
  }

  private subscribeToTranslatedSourceAddressTypeChanges(): Subscription {
    const { translatedSourceAddressType, translatedSourceNetworkObject, translatedSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleTranslatedSourceAddressType, () => void> = {
      [NatRuleTranslatedSourceAddressType.None]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleTranslatedSourceAddressType.NetworkObject]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.setValidators(Validators.required);
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleTranslatedSourceAddressType.NetworkObjectGroup]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.setValidators(Validators.required);
      },
    };
    return translatedSourceAddressType.valueChanges.subscribe((type: NatRuleTranslatedSourceAddressType) => this.updateForm(type, handler));
  }

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
      },
      [NatRuleTranslatedDestinationAddressType.NetworkObject]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.setValidators(Validators.required);
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
      },
      [NatRuleTranslatedDestinationAddressType.NetworkObjectGroup]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.setValidators(Validators.required);
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
}
