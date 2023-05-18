import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockNgSelectComponent,
  MockNgxSmartModalComponent,
  MockTooltipComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NatRuleModalComponent } from './nat-rule-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from '../../../../test/mock-providers';
import TestUtil from '../../../../test/TestUtil';
import { TierContextService } from '../../../services/tier-context.service';
import {
  NatRuleOriginalDestinationAddressTypeEnum,
  NatRuleOriginalServiceTypeEnum,
  NatRuleOriginalSourceAddressTypeEnum,
  NatRuleTranslatedDestinationAddressTypeEnum,
  NatRuleTranslatedServiceTypeEnum,
  NatRuleTranslatedSourceAddressTypeEnum,
  NatRuleTranslationTypeEnum,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
} from 'client';
import { NatRuleObjectInfoModalComponent } from './nat-rule-object-info-modal/nat-rule-object-info-modal.component';

describe('NatRuleModalComponent', () => {
  let component: NatRuleModalComponent;
  let fixture: ComponentFixture<NatRuleModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent('app-nat-rule-modal'),
        NatRuleModalComponent,
        MockTooltipComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockNgSelectComponent,
        NatRuleObjectInfoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityNatRulesService),
        MockProvider(TierContextService),
        MockProvider(V1NetworkSecurityFirewallRulesService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NatRuleModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  const getFormControl = (name: string) => component.f[name];
  const testRequiredFields = (options: {
    field: string;
    newValue: any;
    expectedRequiredFields: string[];
    expectedOptionalFields: string[];
    expectedTruthyFields?: string[];
    expectedFalsyFields?: string[];
  }) => {
    const formControl = component.f[options.field];
    formControl.setValue(options.newValue);

    (options.expectedRequiredFields || []).forEach(f => {
      expect(TestUtil.isFormControlRequired(getFormControl(f))).toBe(true);
    });

    (options.expectedOptionalFields || []).forEach(f => {
      expect(TestUtil.isFormControlRequired(getFormControl(f))).toBe(false);
    });

    (options.expectedTruthyFields || []).forEach(f => {
      expect(TestUtil.formControlValueBoolean(getFormControl(f))).toBe(true);
    });

    (options.expectedFalsyFields || []).forEach(f => {
      expect(TestUtil.formControlValueBoolean(getFormControl(f))).toBe(false);
    });
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Original Service Type', () => {
    it('should be required', () => {
      const originalServiceType = getFormControl('originalServiceType');
      expect(TestUtil.isFormControlRequired(originalServiceType)).toBe(true);
    });

    it('should not require "Original Service Object" when set to "None"', () => {
      testRequiredFields({
        field: 'originalServiceType',
        newValue: NatRuleOriginalServiceTypeEnum.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['originalServiceObject'],
      });
    });

    it('should require "Original Service Object" when set to "ServiceObject"', () => {
      testRequiredFields({
        field: 'originalServiceType',
        newValue: NatRuleOriginalServiceTypeEnum.ServiceObject,
        expectedRequiredFields: ['originalServiceObject'],
        expectedOptionalFields: [],
      });
    });
  });

  describe('Original Source Address Type', () => {
    it('should be required', () => {
      const originalSourceAddressType = getFormControl('originalSourceAddressType');
      expect(TestUtil.isFormControlRequired(originalSourceAddressType)).toBe(true);
    });

    it('should not require "Original Source Network Object" and "Original Source Network Object Group" when set to "None"', () => {
      testRequiredFields({
        field: 'originalSourceAddressType',
        newValue: NatRuleOriginalSourceAddressTypeEnum.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['originalSourceNetworkObject', 'originalSourceNetworkObjectGroup'],
      });
    });

    it('should require "Original Source Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'originalSourceAddressType',
        newValue: NatRuleOriginalSourceAddressTypeEnum.NetworkObject,
        expectedRequiredFields: ['originalSourceNetworkObject'],
        expectedOptionalFields: ['originalSourceNetworkObjectGroup'],
      });
    });

    it('should require "Original Source Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'originalSourceAddressType',
        newValue: NatRuleOriginalSourceAddressTypeEnum.NetworkObjectGroup,
        expectedRequiredFields: ['originalSourceNetworkObjectGroup'],
        expectedOptionalFields: ['originalSourceNetworkObject'],
      });
    });
  });

  describe('Original Destination Address Type', () => {
    it('should be required', () => {
      const originalDestinationAddressType = getFormControl('originalDestinationAddressType');
      expect(TestUtil.isFormControlRequired(originalDestinationAddressType)).toBe(true);
    });

    // tslint:disable-next-line:max-line-length
    it('should not require "Original Destination Network Object" and "Original Destination Network Object Group" when set to "None"', () => {
      testRequiredFields({
        field: 'originalDestinationAddressType',
        newValue: NatRuleOriginalDestinationAddressTypeEnum.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['originalDestinationNetworkObject', 'originalDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Original Destination Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'originalDestinationAddressType',
        newValue: NatRuleOriginalDestinationAddressTypeEnum.NetworkObject,
        expectedRequiredFields: ['originalDestinationNetworkObject'],
        expectedOptionalFields: ['originalDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Original Destination Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'originalDestinationAddressType',
        newValue: NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup,
        expectedRequiredFields: ['originalDestinationNetworkObjectGroup'],
        expectedOptionalFields: ['originalDestinationNetworkObject'],
      });
    });
  });

  describe('Translation Type', () => {
    it('should be required', () => {
      const translationType = getFormControl('translationType');
      expect(TestUtil.isFormControlRequired(translationType)).toBe(true);
    });

    it('should require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" when set to "Static"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationTypeEnum.Static,
        expectedRequiredFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
        expectedOptionalFields: [],
      });
    });

    it('should require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" and "biDirectional" should be false when set to "DynamicIp"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationTypeEnum.DynamicIp,
        expectedRequiredFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
        expectedOptionalFields: [],
        expectedFalsyFields: ['biDirectional'],
      });
    });

    it('should require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" and "biDirectional" should be false when set to "DynamicIpAndPort"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationTypeEnum.DynamicIpAndPort,
        expectedRequiredFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
        expectedOptionalFields: [],
        expectedFalsyFields: ['biDirectional'],
      });
    });
  });

  describe('Translated Service Type', () => {
    beforeEach(() => {
      component.f.translationType.setValue(NatRuleTranslationTypeEnum.Static);
    });

    it('should be required', () => {
      const translatedServiceType = getFormControl('translatedServiceType');
      expect(TestUtil.isFormControlRequired(translatedServiceType)).toBe(true);
    });

    it('should not require "Translated Service Object" when set to "None"', () => {
      testRequiredFields({
        field: 'translatedServiceType',
        newValue: NatRuleTranslatedServiceTypeEnum.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedServiceObject'],
      });
    });

    it('should require "Translated Service Object" when set to "ServiceObject"', () => {
      testRequiredFields({
        field: 'translatedServiceType',
        newValue: NatRuleTranslatedServiceTypeEnum.ServiceObject,
        expectedRequiredFields: ['translatedServiceObject'],
        expectedOptionalFields: [],
      });
    });
  });

  describe('Translated Source Address Type', () => {
    beforeEach(() => {
      component.f.translationType.setValue(NatRuleTranslationTypeEnum.Static);
    });

    it('should be required', () => {
      const translatedSourceAddressType = getFormControl('translatedSourceAddressType');
      expect(TestUtil.isFormControlRequired(translatedSourceAddressType)).toBe(true);
    });

    it('should not require "Translated Source Network Object" and "Translated Source Network Object Group" when set to "None"', () => {
      testRequiredFields({
        field: 'translatedSourceAddressType',
        newValue: NatRuleTranslatedSourceAddressTypeEnum.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedSourceNetworkObject', 'translatedSourceNetworkObjectGroup'],
      });
    });

    it('should require "Translated Source Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'translatedSourceAddressType',
        newValue: NatRuleTranslatedSourceAddressTypeEnum.NetworkObject,
        expectedRequiredFields: ['translatedSourceNetworkObject'],
        expectedOptionalFields: ['translatedSourceNetworkObjectGroup'],
      });
    });

    it('should require "Translated Source Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'translatedSourceAddressType',
        newValue: NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup,
        expectedRequiredFields: ['translatedSourceNetworkObjectGroup'],
        expectedOptionalFields: ['translatedSourceNetworkObject'],
      });
    });
  });

  describe('Translated Destination Address Type', () => {
    beforeEach(() => {
      component.f.translationType.setValue(NatRuleTranslationTypeEnum.Static);
    });

    // tslint:disable-next-line:max-line-length
    it('should not require "Translated Destination Network Object" and "Translated Destination Network Object Group" when set to "None"', () => {
      testRequiredFields({
        field: 'translatedDestinationAddressType',
        newValue: NatRuleTranslatedDestinationAddressTypeEnum.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedDestinationNetworkObject', 'translatedDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Translated Destination Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'translatedDestinationAddressType',
        newValue: NatRuleTranslatedDestinationAddressTypeEnum.NetworkObject,
        expectedRequiredFields: ['translatedDestinationNetworkObject'],
        expectedOptionalFields: ['translatedDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Translated Destination Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'translatedDestinationAddressType',
        newValue: NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup,
        expectedRequiredFields: ['translatedDestinationNetworkObjectGroup'],
        expectedOptionalFields: ['translatedDestinationNetworkObject'],
      });
    });
  });
});
