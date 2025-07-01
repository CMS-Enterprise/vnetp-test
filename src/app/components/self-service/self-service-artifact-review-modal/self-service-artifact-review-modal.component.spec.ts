import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SelfServiceArtifactReviewModalComponent } from './self-service-artifact-review-modal.component';

const MOCK_SELF_SERVICE = {
  convertedConfig: {
    log: [{ name: 'log1' }],
    artifact: {
      networkObjects: [{ name: 'netObj1' }],
      serviceObjects: [{ name: 'svcObj1' }],
      networkObjectGroups: [{ name: 'netGrp1' }],
      serviceObjectGroups: [{ name: 'svcGrp1' }],
      intervrfFirewallRules: [{ name: 'intervrfRule1' }],
      externalFirewallRules: [{ name: 'extRule1' }],
      intervrfNatRules: [{ name: 'intervrfNat1' }],
      externalNatRules: [{ name: 'extNat1' }],
      failedFirewallRules: [{ name: 'failFw1' }],
      failedNatRules: [{ name: 'failNat1' }],
      failedObjects: [{ name: 'failObj1' }],
    },
  },
};

describe('SelfServiceArtifactReviewModalComponent', () => {
  let component: SelfServiceArtifactReviewModalComponent;
  let fixture: ComponentFixture<SelfServiceArtifactReviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelfServiceArtifactReviewModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfServiceArtifactReviewModalComponent);
    component = fixture.componentInstance;
    component.selfService = MOCK_SELF_SERVICE;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should reset navIndex', () => {
    component.navIndex = 5;
    component.ngOnInit();
    expect(component.navIndex).toBe(0);
  });

  it('onClose should clear selfService object', () => {
    expect(component.selfService).toBeDefined();
    component.onClose();
    expect(component.selfService).toBeUndefined();
  });

  it('should return templates from config', () => {
    component.lineNumberTemplate = {} as TemplateRef<any>;
    component.errorsTemplate = {} as TemplateRef<any>;
    const lineNumberCol = component.config.columns[1];
    const errorsCol = component.config.columns[2];
    expect((lineNumberCol as any).template()).toEqual(component.lineNumberTemplate);
    expect((errorsCol as any).template()).toEqual(component.errorsTemplate);
  });

  describe('handleTabChange', () => {
    const testCases = [
      { tabName: 'Config', expectedData: MOCK_SELF_SERVICE.convertedConfig.log },
      { tabName: 'Network Objects', expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.networkObjects },
      { tabName: 'Service Objects', expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.serviceObjects },
      {
        tabName: 'Network Object Groups',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.networkObjectGroups,
      },
      {
        tabName: 'Service Object Groups',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.serviceObjectGroups,
      },
      {
        tabName: 'Intervrf FW Rules',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.intervrfFirewallRules,
      },
      {
        tabName: 'External FW Rules',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.externalFirewallRules,
      },
      {
        tabName: 'Intervrf NAT Rules',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.intervrfNatRules,
      },
      {
        tabName: 'External NAT Rules',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.externalNatRules,
      },
      {
        tabName: 'Failed FW Rules',
        expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.failedFirewallRules,
      },
      { tabName: 'Failed NAT Rules', expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.failedNatRules },
      { tabName: 'Failed Objects', expectedData: MOCK_SELF_SERVICE.convertedConfig.artifact.failedObjects },
    ];

    testCases.forEach((tc, index) => {
      it(`should select correct data for ${tc.tabName} tab`, () => {
        component.handleTabChange({ name: tc.tabName });
        expect(component.navIndex).toBe(index);
        expect(component.selectedObjects.data).toEqual(tc.expectedData);
        expect(component.loadingTabObjects).toBe(false);
      });
    });
  });
});
