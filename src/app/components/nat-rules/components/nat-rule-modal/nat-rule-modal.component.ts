import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NameValidator } from 'src/app/validators/name-validator';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRuleModalDto } from '../../models/nat-rule-modal-dto';
import { NatRuleTranslationType, NatRuleAddressType, NatRuleServiceType, NatRuleGroup, NatDirection } from '../../nat-rules.type';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { Subscription } from 'rxjs';
import { NetworkObject, NetworkObjectGroup, ServiceObject, ServiceObjectGroup } from 'api_client';

@Component({
  selector: 'app-nat-rule-modal',
  templateUrl: './nat-rule-modal.component.html',
})
export class NatRuleModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;

  // Lookups
  public serviceObjects: ServiceObject[] = [{ id: '1', name: 'Service Object 1' } as ServiceObject];
  public serviceObjectGroups: ServiceObjectGroup[] = [{ id: '1', name: 'Service Object Group 1' } as ServiceObjectGroup];
  public natRuleGroups: NatRuleGroup[] = [{ id: '1', name: 'NAT Group 1' } as NatRuleGroup];
  public networkObjects: NetworkObject[] = [{ id: '1', name: 'Network Object 1' } as NetworkObject];
  public networkObjectGroups: NetworkObjectGroup[] = [{ id: '1', name: 'Network Object Group 1' } as NetworkObjectGroup];

  // Enums
  public NatRuleTranslationType = NatRuleTranslationType;
  public NatRuleAddressType = NatRuleAddressType;
  public NatRuleServiceType = NatRuleServiceType;
  public NatDirection = NatDirection;

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
      direction: [NatDirection.In, Validators.required],
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      natRuleGroup: [null, Validators.required],
      originalServiceObject: null,
      originalServiceObjectGroup: null,
      originalServiceType: [NatRuleServiceType.None, Validators.required],
      originalSourceAddressType: [NatRuleAddressType.None, Validators.required],
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

    const handler: Record<NatRuleServiceType, Function> = {
      [NatRuleServiceType.None]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.clearValidators();
        originalServiceObjectGroup.setValue(null);
        originalServiceObjectGroup.clearValidators();
      },
      [NatRuleServiceType.ServiceObject]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.setValidators(Validators.required);
        originalServiceObjectGroup.setValue(null);
        originalServiceObjectGroup.clearValidators();
      },
      [NatRuleServiceType.ServiceObjectGroup]: () => {
        originalServiceObject.setValue(null);
        originalServiceObject.clearValidators();
        originalServiceObjectGroup.setValue(null);
        originalServiceObjectGroup.setValidators(Validators.required);
      },
    };

    return originalServiceType.valueChanges.subscribe((type: NatRuleServiceType) => {
      const handlerFn = handler[type];
      handlerFn();
      originalServiceObject.updateValueAndValidity();
      originalServiceObjectGroup.updateValueAndValidity();
    });
  }

  private subscribeToTranslatedServiceTypeChanges(): Subscription {
    const { translatedServiceType, translatedServiceObject, translatedServiceObjectGroup } = this.form.controls;

    const handler: Record<NatRuleServiceType, Function> = {
      [NatRuleServiceType.None]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObjectGroup.setValue(null);
        translatedServiceObjectGroup.clearValidators();
      },
      [NatRuleServiceType.ServiceObject]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.setValidators(Validators.required);
        translatedServiceObjectGroup.setValue(null);
        translatedServiceObjectGroup.clearValidators();
      },
      [NatRuleServiceType.ServiceObjectGroup]: () => {
        translatedServiceObject.setValue(null);
        translatedServiceObject.clearValidators();
        translatedServiceObjectGroup.setValue(null);
        translatedServiceObjectGroup.setValidators(Validators.required);
      },
    };

    return translatedServiceType.valueChanges.subscribe((type: NatRuleServiceType) => {
      const handlerFn = handler[type];
      handlerFn();
      translatedServiceObject.updateValueAndValidity();
      translatedServiceObjectGroup.updateValueAndValidity();
    });
  }

  private subscribeToTranslationTypeChanges(): Subscription {
    const { translatedDestinationAddressType, translatedServiceType, translatedSourceAddressType, translationType } = this.form.controls;

    return translationType.valueChanges.subscribe((value: NatRuleTranslationType) => {
      if (value === NatRuleTranslationType.None) {
        translatedSourceAddressType.setValue(null);
        translatedSourceAddressType.clearValidators();
        translatedDestinationAddressType.setValue(null);
        translatedDestinationAddressType.clearValidators();
        translatedServiceType.setValue(null);
        translatedServiceType.clearValidators();
      } else {
        translatedSourceAddressType.setValue(NatRuleAddressType.None);
        translatedSourceAddressType.setValidators(Validators.required);
        translatedDestinationAddressType.setValue(NatRuleAddressType.None);
        translatedDestinationAddressType.setValidators(Validators.required);
        translatedServiceType.setValue(NatRuleServiceType.None);
        translatedServiceType.setValidators(Validators.required);
      }
      translatedSourceAddressType.updateValueAndValidity();
      translatedDestinationAddressType.updateValueAndValidity();
      translatedServiceType.updateValueAndValidity();
    });
  }

  private subscribeToOriginalSourceAddressTypeChanges(): Subscription {
    const { originalSourceAddressType, originalSourceNetworkObject, originalSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleAddressType, Function> = {
      [NatRuleAddressType.None]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleAddressType.NetworkObject]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.setValidators(Validators.required);
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleAddressType.NetworkObjectGroup]: () => {
        originalSourceNetworkObject.setValue(null);
        originalSourceNetworkObject.clearValidators();
        originalSourceNetworkObjectGroup.setValue(null);
        originalSourceNetworkObjectGroup.setValidators(Validators.required);
      },
    };

    return originalSourceAddressType.valueChanges.subscribe((type: NatRuleAddressType) => {
      const handlerFn = handler[type];
      handlerFn();
      originalSourceNetworkObject.updateValueAndValidity();
      originalSourceNetworkObjectGroup.updateValueAndValidity();
    });
  }

  private subscribeToTranslatedSourceAddressTypeChanges(): Subscription {
    const { translatedSourceAddressType, translatedSourceNetworkObject, translatedSourceNetworkObjectGroup } = this.form.controls;

    const handler: Record<NatRuleAddressType, Function> = {
      [NatRuleAddressType.None]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleAddressType.NetworkObject]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.setValidators(Validators.required);
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.clearValidators();
      },
      [NatRuleAddressType.NetworkObjectGroup]: () => {
        translatedSourceNetworkObject.setValue(null);
        translatedSourceNetworkObject.clearValidators();
        translatedSourceNetworkObjectGroup.setValue(null);
        translatedSourceNetworkObjectGroup.setValidators(Validators.required);
      },
    };

    return translatedSourceAddressType.valueChanges.subscribe((type: NatRuleAddressType) => {
      const handlerFn = handler[type];
      handlerFn();
      translatedSourceNetworkObject.updateValueAndValidity();
      translatedSourceNetworkObjectGroup.updateValueAndValidity();
    });
  }

  private subscribeToTranslatedDestinationAddressTypeChanges(): Subscription {
    const {
      translatedDestinationAddressType,
      translatedDestinationNetworkObject,
      translatedDestinationNetworkObjectGroup,
    } = this.form.controls;

    const handler: Record<NatRuleAddressType, Function> = {
      [NatRuleAddressType.None]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
      },
      [NatRuleAddressType.NetworkObject]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.setValidators(Validators.required);
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.clearValidators();
      },
      [NatRuleAddressType.NetworkObjectGroup]: () => {
        translatedDestinationNetworkObject.setValue(null);
        translatedDestinationNetworkObject.clearValidators();
        translatedDestinationNetworkObjectGroup.setValue(null);
        translatedDestinationNetworkObjectGroup.setValidators(Validators.required);
      },
    };

    return translatedDestinationAddressType.valueChanges.subscribe((type: NatRuleAddressType) => {
      const handlerFn = handler[type];
      handlerFn();
      translatedDestinationNetworkObject.updateValueAndValidity();
      translatedDestinationNetworkObjectGroup.updateValueAndValidity();
    });
  }
}

// TODO
// enabled: boolean, optional, default = true
// biDirectional: boolean, optional, default = true

//   @ApiModelProperty({ enum: NatRuleAddressType })
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @IsEnum(NatRuleAddressType, { always: true })
//   @Column({ type: 'enum', enum: NatRuleAddressType })
//   originalDestinationAddressType: NatRuleAddressType;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.originalDestinationAddressType === NatRuleAddressType.NetworkObject,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   originalDestinationNetworkObjectId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.originalDestinationAddressType ===
//       NatRuleAddressType.NetworkObjectGroup,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   originalDestinationNetworkObjectGroupId: string;

// }
