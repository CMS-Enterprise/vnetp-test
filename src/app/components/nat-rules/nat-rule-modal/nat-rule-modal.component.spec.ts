import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NatRuleModalComponent } from './nat-rule-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from '../../../../test/mock-providers';
import TestUtil from '../../../../test/TestUtil';
import { TierContextService } from '../../../services/tier-context.service';
import {
  NatRuleOriginalDestinationAddressType,
  NatRuleOriginalServiceType,
  NatRuleOriginalSourceAddressType,
  NatRuleTranslatedDestinationAddressType,
  NatRuleTranslatedServiceType,
  NatRuleTranslatedSourceAddressType,
  NatRuleTranslationType,
  V1NetworkSecurityNatRulesService,
  V1TiersService,
} from '../../../../../api_client';
import { DatacenterContextService } from '../../../services/datacenter-context.service';

describe('NatRuleModalComponent', () => {
  let component: NatRuleModalComponent;
  let fixture: ComponentFixture<NatRuleModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [MockComponent('app-nat-rule-modal'), NatRuleModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSecurityNatRulesService), MockProvider(TierContextService)],
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
  }) => {
    const formControl = component.f[options.field];
    formControl.setValue(options.newValue);

    (options.expectedRequiredFields || []).forEach(f => {
      expect(TestUtil.isFormControlRequired(getFormControl(f))).toBe(true);
    });

    (options.expectedOptionalFields || []).forEach(f => {
      expect(TestUtil.isFormControlRequired(getFormControl(f))).toBe(false);
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
        newValue: NatRuleOriginalServiceType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['originalServiceObject'],
      });
    });

    it('should require "Original Service Object" when set to "ServiceObject"', () => {
      testRequiredFields({
        field: 'originalServiceType',
        newValue: NatRuleOriginalServiceType.ServiceObject,
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
        newValue: NatRuleOriginalSourceAddressType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['originalSourceNetworkObject', 'originalSourceNetworkObjectGroup'],
      });
    });

    it('should require "Original Source Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'originalSourceAddressType',
        newValue: NatRuleOriginalSourceAddressType.NetworkObject,
        expectedRequiredFields: ['originalSourceNetworkObject'],
        expectedOptionalFields: ['originalSourceNetworkObjectGroup'],
      });
    });

    it('should require "Original Source Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'originalSourceAddressType',
        newValue: NatRuleOriginalSourceAddressType.NetworkObjectGroup,
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
        newValue: NatRuleOriginalDestinationAddressType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['originalDestinationNetworkObject', 'originalDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Original Destination Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'originalDestinationAddressType',
        newValue: NatRuleOriginalDestinationAddressType.NetworkObject,
        expectedRequiredFields: ['originalDestinationNetworkObject'],
        expectedOptionalFields: ['originalDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Original Destination Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'originalDestinationAddressType',
        newValue: NatRuleOriginalDestinationAddressType.NetworkObjectGroup,
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

    it('should not require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" when set to "None"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
      });
    });

    it('should require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" when set to "Static"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationType.Static,
        expectedRequiredFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
        expectedOptionalFields: [],
      });
    });

    it('should require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" when set to "DynamicIp"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationType.DynamicIp,
        expectedRequiredFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
        expectedOptionalFields: [],
      });
    });

    it('should require "Translated Source Address Type", "Translated Destination Address Type" and "Translated Service Type" when set to "DynamicIpAndPort"', () => {
      testRequiredFields({
        field: 'translationType',
        newValue: NatRuleTranslationType.DynamicIpAndPort,
        expectedRequiredFields: ['translatedSourceAddressType', 'translatedDestinationAddressType', 'translatedServiceType'],
        expectedOptionalFields: [],
      });
    });
  });

  describe('Translated Service Type', () => {
    beforeEach(() => {
      component.f.translationType.setValue(NatRuleTranslationType.Static);
    });

    it('should be required', () => {
      const translatedServiceType = getFormControl('translatedServiceType');
      expect(TestUtil.isFormControlRequired(translatedServiceType)).toBe(true);
    });

    it('should not require "Translated Service Object" when set to "None"', () => {
      testRequiredFields({
        field: 'translatedServiceType',
        newValue: NatRuleTranslatedServiceType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedServiceObject'],
      });
    });

    it('should require "Translated Service Object" when set to "ServiceObject"', () => {
      testRequiredFields({
        field: 'translatedServiceType',
        newValue: NatRuleTranslatedServiceType.ServiceObject,
        expectedRequiredFields: ['translatedServiceObject'],
        expectedOptionalFields: [],
      });
    });
  });

  describe('Translated Source Address Type', () => {
    beforeEach(() => {
      component.f.translationType.setValue(NatRuleTranslationType.Static);
    });

    it('should be required', () => {
      const translatedSourceAddressType = getFormControl('translatedSourceAddressType');
      expect(TestUtil.isFormControlRequired(translatedSourceAddressType)).toBe(true);
    });

    it('should not require "Translated Source Network Object" and "Translated Source Network Object Group" when set to "None"', () => {
      testRequiredFields({
        field: 'translatedSourceAddressType',
        newValue: NatRuleTranslatedSourceAddressType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedSourceNetworkObject', 'translatedSourceNetworkObjectGroup'],
      });
    });

    it('should require "Translated Source Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'translatedSourceAddressType',
        newValue: NatRuleTranslatedSourceAddressType.NetworkObject,
        expectedRequiredFields: ['translatedSourceNetworkObject'],
        expectedOptionalFields: ['translatedSourceNetworkObjectGroup'],
      });
    });

    it('should require "Translated Source Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'translatedSourceAddressType',
        newValue: NatRuleTranslatedSourceAddressType.NetworkObjectGroup,
        expectedRequiredFields: ['translatedSourceNetworkObjectGroup'],
        expectedOptionalFields: ['translatedSourceNetworkObject'],
      });
    });
  });

  describe('Translated Destination Address Type', () => {
    beforeEach(() => {
      component.f.translationType.setValue(NatRuleTranslationType.Static);
    });

    // tslint:disable-next-line:max-line-length
    it('should not require "Translated Destination Network Object" and "Translated Destination Network Object Group" when set to "None"', () => {
      testRequiredFields({
        field: 'translatedDestinationAddressType',
        newValue: NatRuleTranslatedDestinationAddressType.None,
        expectedRequiredFields: [],
        expectedOptionalFields: ['translatedDestinationNetworkObject', 'translatedDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Translated Destination Network Object" when set to "NetworkObject"', () => {
      testRequiredFields({
        field: 'translatedDestinationAddressType',
        newValue: NatRuleTranslatedDestinationAddressType.NetworkObject,
        expectedRequiredFields: ['translatedDestinationNetworkObject'],
        expectedOptionalFields: ['translatedDestinationNetworkObjectGroup'],
      });
    });

    it('should require "Translated Destination Network Object Group" when set to "NetworkObjectGroup"', () => {
      testRequiredFields({
        field: 'translatedDestinationAddressType',
        newValue: NatRuleTranslatedDestinationAddressType.NetworkObjectGroup,
        expectedRequiredFields: ['translatedDestinationNetworkObjectGroup'],
        expectedOptionalFields: ['translatedDestinationNetworkObject'],
      });
    });
  });
});
