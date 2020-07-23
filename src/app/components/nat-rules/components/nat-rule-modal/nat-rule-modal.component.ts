import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NameValidator } from 'src/app/validators/name-validator';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRuleModalDto } from '../../models/nat-rule-modal-dto';
import { NatRuleTranslationType, NatRuleAddressType, NatRuleServiceType, NatRuleGroup, NatDirection } from '../../nat-rules.type';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { Subscription } from 'rxjs';
import { NetworkObject, NetworkObjectGroup } from 'api_client';

@Component({
  selector: 'app-nat-rule-modal',
  templateUrl: './nat-rule-modal.component.html',
})
export class NatRuleModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;

  // Lookups
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
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      direction: [NatDirection.In, Validators.required],
      ruleIndex: [null, Validators.compose([Validators.required, Validators.min(1)])],
      natRuleGroup: [null, Validators.required],
      translationType: [NatRuleTranslationType.None, Validators.required],
      translatedSourceAddressType: null,
      translatedDestinationAddressType: null,
      translatedServiceType: null,
      translatedSourceNetworkObject: null,
      translatedSourceNetworkObjectGroup: null,
      translatedDestinationNetworkObject: null,
      translatedDestinationNetworkObjectGroup: null,
    });

    this.subscriptions = [
      this.subscribeToTranslationTypeChanges(),
      this.subscribeToTranslatedSourceAddressTypeChanges(),
      this.subscribeToTranslatedDestinationAddressTypeChanges(),
    ];
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
//   originalSourceAddressType: NatRuleAddressType;

//   @ApiModelProperty({ enum: NatRuleAddressType })
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @IsEnum(NatRuleAddressType, { always: true })
//   @Column({ type: 'enum', enum: NatRuleAddressType })
//   translatedSourceAddressType: NatRuleAddressType;

//   @ApiModelProperty({ enum: NatRuleAddressType })
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @IsEnum(NatRuleAddressType, { always: true })
//   @Column({ type: 'enum', enum: NatRuleAddressType })
//   originalDestinationAddressType: NatRuleAddressType;

//   @ApiModelProperty({ enum: NatRuleAddressType })
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @IsEnum(NatRuleAddressType, { always: true })
//   @Column({ type: 'enum', enum: NatRuleAddressType })
//   translatedDestinationAddressType: NatRuleAddressType;

//   @ApiModelProperty({ enum: NatRuleServiceType })
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @IsEnum(NatRuleServiceType, { always: true })
//   @Column({ type: 'enum', enum: NatRuleServiceType })
//   originalServiceType: NatRuleServiceType;

//   @ApiModelProperty({ enum: NatRuleServiceType })
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @IsEnum(NatRuleServiceType, { always: true })
//   @Column({ type: 'enum', enum: NatRuleServiceType })
//   translatedServiceType: NatRuleServiceType;

//   @ApiModelProperty()
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsEmpty({
//     groups: [UPDATE],
//     message: 'NAT Rule Group cannot be changed after NAT Rule creation.',
//   })
//   @IsUUID('4', { groups: [CREATE] })
//   @Column({ update: false, nullable: false, type: 'uuid' })
//   @Index()
//   natRuleGroupId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.originalSourceAddressType === NatRuleAddressType.NetworkObject,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   originalSourceNetworkObjectId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.originalSourceAddressType === NatRuleAddressType.NetworkObjectGroup,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   originalSourceNetworkObjectGroupId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None &&
//       nr.translatedSourceAddressType === NatRuleAddressType.NetworkObject,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   translatedSourceNetworkObjectId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None &&
//       nr.translatedSourceAddressType === NatRuleAddressType.NetworkObjectGroup,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   translatedSourceNetworkObjectGroupId: string;

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

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None &&
//       nr.translatedDestinationAddressType === NatRuleAddressType.NetworkObject,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   translatedDestinationNetworkObjectId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translationType !== NatRuleTranslationType.None &&
//       nr.translatedDestinationAddressType ===
//         NatRuleAddressType.NetworkObjectGroup,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   translatedDestinationNetworkObjectGroupId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.originalServiceType === NatRuleServiceType.ServiceObject,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   originalServiceObjectId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.originalServiceType === NatRuleServiceType.ServiceObjectGroup,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   originalServiceObjectGroupId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translatedServiceType === NatRuleServiceType.ServiceObject,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   translatedServiceObjectId: string;

//   @ApiModelPropertyOptional()
//   @ValidateIf(
//     /* istanbul ignore next */ nr =>
//       nr.translatedServiceType === NatRuleServiceType.ServiceObjectGroup,
//     { groups: [CREATE] },
//   )
//   @IsNotEmpty({ groups: [CREATE] })
//   @IsOptional({ groups: [UPDATE] })
//   @Column({ nullable: true, type: 'uuid' })
//   translatedServiceObjectGroupId: string;
// }
