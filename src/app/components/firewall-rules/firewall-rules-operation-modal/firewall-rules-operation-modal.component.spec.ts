import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirewallRulesOperationModalComponent } from './firewall-rules-operation-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockNgxSmartModalComponent,
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockYesNoModalComponent,
} from '../../../../test/mock-components';
import { of } from 'rxjs';
import { V1TiersService, V1NetworkSecurityFirewallRulesService, RuleOperationDto } from '../../../../../client';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

jest.mock('../../../utils/SubscriptionUtil', () => ({
  default: class {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static subscribeToYesNoModal(dto, ngx, confirmFn, closeFn = () => {}) {
      // Directly invoke the confirm function to simulate confirmation
      confirmFn();
      // Return a mock Subscription if needed, for example:
      return { unsubscribe: jest.fn() };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static unsubscribe(subscriptions) {
      // Mock implementation or leave empty if not relevant for the test
    }
  },
}));
const mockTierService = {
  getOneTier: jest.fn(),
  getManyTier: jest.fn(),
};
const mockFirewallRuleService = {
  getOneFirewallRule: jest.fn(),
  fwRuleOperationFirewallRule: jest.fn(),
};
const mockDatacenterContextService = {
  currentDatacenter: of({ id: '1' }),
};
const mockNgxSmartModalService = {
  getModalData: jest.fn(),
  close: jest.fn(),
  resetModalData: jest.fn(),
  setModalData: jest.fn(),
  getModal: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
  })),
};

describe('FirewallRulesOperationModalComponent', () => {
  let component: FirewallRulesOperationModalComponent;
  let fixture: ComponentFixture<FirewallRulesOperationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        FirewallRulesOperationModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
      ],
      imports: [NgSelectModule, ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: V1TiersService, useValue: mockTierService },
        { provide: V1NetworkSecurityFirewallRulesService, useValue: mockFirewallRuleService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FirewallRulesOperationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and fetch tiers', () => {
    const mockTiers = [{ id: '1', name: 'Tier 1' }];
    mockTierService.getManyTier.mockReturnValue(of(mockTiers));
    component.ngOnInit();
    expect(mockTierService.getManyTier).toHaveBeenCalled();
  });

  it('should build the form with required controls', () => {
    (component as any).buildForm();
    expect(component.form.contains('firewallRuleGroupId')).toBeTruthy();
    expect(component.form.contains('operation')).toBeTruthy();
    expect(component.form.contains('ruleIndex')).toBeTruthy();
    expect(component.form.contains('name')).toBeTruthy();
  });

  it('should build the form with required controls', () => {
    (component as any).buildForm();
    expect(component.form.contains('firewallRuleGroupId')).toBeTruthy();
    expect(component.form.contains('operation')).toBeTruthy();
    expect(component.form.contains('ruleIndex')).toBeTruthy();
    expect(component.form.contains('name')).toBeTruthy();
  });

  it('should close the modal and reset the form', () => {
    component.closeModal();
    expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('firewallRuleOperationModal');
  });

  it('should execute firewall rule operation', () => {
    const mockOperationResult = { id: '1', name: 'Firewall Rule' };
    const ruleOperationDto: RuleOperationDto = {
      existingRuleId: '1',
      operation: 'Move',
      destinationGroupId: '1',
      ruleIndex: 1,
      name: 'Firewall Rule',
    };

    component.tiers = [
      { id: '1', name: 'Tier 1' },
      { id: '2', name: 'Tier 2' },
    ];
    component.currentTierId = '1';
    component.selectedTierId = '2';
    component.firewallRuleGroups = [{ id: '1', name: 'Firewall Rule Group' } as any];

    mockFirewallRuleService.fwRuleOperationFirewallRule.mockReturnValue(of(mockOperationResult));
    component.executeOperation(ruleOperationDto);
    expect(mockFirewallRuleService.fwRuleOperationFirewallRule).toHaveBeenCalledWith({ ruleOperationDto });
  });

  describe('getFirewallRule', () => {
    it('should fetch firewall rule and update form and component state', done => {
      // Arrange
      const mockFirewallRuleId = 'firewall-rule-id';
      const mockFirewallRuleData = { id: mockFirewallRuleId, name: 'Firewall Rule Name' };
      mockFirewallRuleService.getOneFirewallRule.mockReturnValue(of(mockFirewallRuleData));

      // Act
      component.getFirewallRule(mockFirewallRuleId);

      // Assert
      expect(mockFirewallRuleService.getOneFirewallRule).toHaveBeenCalledWith({ id: mockFirewallRuleId });
      setTimeout(() => {
        expect(component.existingFirewallRule).toEqual(mockFirewallRuleData);
        expect(component.form.controls.name.value).toEqual(mockFirewallRuleData.name);
        expect(component.name).toEqual(mockFirewallRuleData.name);
        done();
      });
    });
  });

  describe('save', () => {
    it('should mark as submitted and execute operation with form values', () => {
      // Arrange
      const mockFormValues = {
        firewallRuleGroupId: '123',
        name: 'Test Rule',
        operation: 'Move',
        ruleIndex: 2,
      };
      component.form.setValue(mockFormValues);
      component.existingFirewallRuleId = 'existing-id';
      const executeOperationSpy = jest.spyOn(component, 'executeOperation').mockImplementation(() => {});

      // Act
      component.save();

      // Assert
      expect(component.submitted).toBe(true);
      expect(executeOperationSpy).toHaveBeenCalledWith({
        existingRuleId: 'existing-id',
        destinationGroupId: mockFormValues.firewallRuleGroupId,
        operation: mockFormValues.operation,
        ruleIndex: mockFormValues.ruleIndex,
        name: mockFormValues.name,
      });
    });
  });

  describe('getData', () => {
    it('should fetch modal data and update component state', () => {
      // Arrange
      const mockDto = {
        ruleId: 'rule-id',
        tierId: 'tier-id',
        sourceRuleGroupId: 'source-group-id',
        ruleGroupName: 'rule-group-name',
      };
      mockNgxSmartModalService.getModalData.mockReturnValue(mockDto);
      const getFirewallRuleGroupsSpy = jest.spyOn(component, 'getFirewallRuleGroups').mockImplementation(() => {});
      const getFirewallRuleSpy = jest.spyOn(component, 'getFirewallRule').mockImplementation(() => {});

      // Act
      component.getData();

      // Assert
      expect(mockNgxSmartModalService.getModalData).toHaveBeenCalledWith('firewallRuleOperationModal');
      expect(component.existingFirewallRuleId).toEqual(mockDto.ruleId);
      expect(component.currentTierId).toEqual(mockDto.tierId);
      expect(component.selectedTierId).toEqual(mockDto.tierId);
      expect(component.sourceFirewallRuleGroupId).toEqual(mockDto.sourceRuleGroupId);
      expect(component.sourceFirewallRuleGroupName).toEqual(mockDto.ruleGroupName);
      expect(getFirewallRuleGroupsSpy).toHaveBeenCalled();
      expect(getFirewallRuleSpy).toHaveBeenCalledWith(mockDto.ruleId);
    });
  });

  describe('getFirewallRuleGroups', () => {
    it('should fetch firewall rule groups and update form and component state', done => {
      // Arrange
      const mockTierId = 'tier-id';
      const mockFirewallRuleGroups = [
        { id: '1', name: 'Group 1' },
        { id: '2', name: 'Intravrf' }, // This should be filtered out
        { id: '3', name: 'Group 2' },
      ];
      mockTierService.getOneTier.mockReturnValue(of({ firewallRuleGroups: mockFirewallRuleGroups }));

      // Act
      component.getFirewallRuleGroups(mockTierId);

      // Assert
      expect(mockTierService.getOneTier).toHaveBeenCalledWith({
        id: mockTierId,
        join: ['firewallRuleGroups'],
      });
      setTimeout(() => {
        expect(component.firewallRuleGroups.length).toBe(2);
        expect(component.firewallRuleGroups).toEqual(expect.arrayContaining([mockFirewallRuleGroups[0], mockFirewallRuleGroups[2]]));
        expect(component.form.controls.firewallRuleGroupId.value).toBeNull();
        done();
      });
    });
  });

  it('should return form controls', () => {
    // Arrange
    const formBuilder: FormBuilder = new FormBuilder();
    component.form = formBuilder.group({
      firewallRuleGroupId: ['', Validators.required],
      operation: ['', Validators.required],
      ruleIndex: ['', Validators.required],
      name: ['', Validators.required], // Assuming you have a validator, adjust as necessary
    });

    // Act
    const controls = component.f;

    // Assert
    expect(controls).toEqual(component.form.controls);
    // You can also check for specific controls if needed
    expect(controls.firewallRuleGroupId).toBeTruthy();
    expect(controls.operation).toBeTruthy();
    expect(controls.ruleIndex).toBeTruthy();
    expect(controls.name).toBeTruthy();
  });
});
