import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { V1TiersService, V1NetworkSecurityNatRulesService, RuleOperationDto } from '../../../../../client';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import { NatRulesOperationModalComponent } from './nat-rules-operation-modal.component';

jest.mock('../../../utils/SubscriptionUtil', () => ({
  default: class {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static subscribeToYesNoModal(dto, ngx, confirmFn, closeFn = () => {}) {
      confirmFn();
      return { unsubscribe: jest.fn() };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static unsubscribe(subscriptions) {}
  },
}));

const mockTierService = {
  getOneTier: jest.fn(),
  getManyTier: jest.fn(),
};
const mockNatRuleService = {
  getOneNatRule: jest.fn(),
  natRuleOperationNatRule: jest.fn(),
};
const mockDatacenterContextService = {
  currentDatacenter: of({ id: '1' }),
};
const mockNgxSmartModalService = {
  getModalData: jest.fn(),
  close: jest.fn(),
  resetModalData: jest.fn(),
  setModalData: jest.fn(),
  getModal: jest.fn().mockImplementation(() => ({ open: jest.fn() })),
};

describe('NatRulesOperationModalComponent', () => {
  let component: NatRulesOperationModalComponent;
  let fixture: ComponentFixture<NatRulesOperationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NatRulesOperationModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
      ],
      imports: [NgSelectModule, ReactiveFormsModule, HttpClientModule, FormsModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: V1TiersService, useValue: mockTierService },
        { provide: V1NetworkSecurityNatRulesService, useValue: mockNatRuleService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NatRulesOperationModalComponent);
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
    expect(component.form.contains('natRuleGroupId')).toBeTruthy();
    expect(component.form.contains('operation')).toBeTruthy();
    expect(component.form.contains('ruleIndex')).toBeTruthy();
    expect(component.form.contains('name')).toBeTruthy();
  });

  it('should build the form with required controls', () => {
    (component as any).buildForm();
    expect(component.form.contains('natRuleGroupId')).toBeTruthy();
    expect(component.form.contains('operation')).toBeTruthy();
    expect(component.form.contains('ruleIndex')).toBeTruthy();
    expect(component.form.contains('name')).toBeTruthy();
  });

  it('should close the modal and reset the form', () => {
    component.closeModal();
    expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('natRulesOperationModal');
  });

  it('should execute nat rule operation', () => {
    const mockOperationResult = { id: '1', name: 'Nat Rule' };
    const ruleOperationDto: RuleOperationDto = {
      existingRuleId: '1',
      operation: 'Move',
      destinationGroupId: '1',
      ruleIndex: 1,
      name: 'Nat Rule',
    };

    component.tiers = [
      { id: '1', name: 'Tier 1' },
      { id: '2', name: 'Tier 2' },
    ];
    component.currentTierId = '1';
    component.selectedTierId = '2';
    component.natRuleGroups = [{ id: '1', name: 'Nat Rule Group' } as any];

    mockNatRuleService.natRuleOperationNatRule.mockReturnValue(of(mockOperationResult));
    component.executeOperation(ruleOperationDto);
    expect(mockNatRuleService.natRuleOperationNatRule).toHaveBeenCalledWith({ ruleOperationDto });
  });

  describe('getNatRule', () => {
    it('should fetch nat rule and update form and component state', done => {
      // Arrange
      const mockNatRuleId = 'nat-rule-id';
      const mockNatRuleData = { id: mockNatRuleId, name: 'Nat Rule Name' };
      mockNatRuleService.getOneNatRule.mockReturnValue(of(mockNatRuleData));

      // Act
      component.getNatRule(mockNatRuleId);

      // Assert
      expect(mockNatRuleService.getOneNatRule).toHaveBeenCalledWith({ id: mockNatRuleId });
      setTimeout(() => {
        expect(component.existingNatRule).toEqual(mockNatRuleData);
        expect(component.form.controls.name.value).toEqual(mockNatRuleData.name);
        expect(component.name).toEqual(mockNatRuleData.name);
        done();
      });
    });
  });

  describe('save', () => {
    it('should mark as submitted and execute operation with form values', () => {
      // Arrange
      const mockFormValues = {
        natRuleGroupId: '123',
        name: 'Test Rule',
        operation: 'Move',
        ruleIndex: 2,
      };
      component.form.setValue(mockFormValues);
      component.existingNatRuleId = 'existing-id';
      const executeOperationSpy = jest.spyOn(component, 'executeOperation').mockImplementation(() => {});

      // Act
      component.save();

      // Assert
      expect(component.submitted).toBe(true);
      expect(executeOperationSpy).toHaveBeenCalledWith({
        existingRuleId: 'existing-id',
        destinationGroupId: mockFormValues.natRuleGroupId,
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
      const getNatRuleGroupsSpy = jest.spyOn(component, 'getNatRuleGroups').mockImplementation(() => {});
      const getNatRuleSpy = jest.spyOn(component, 'getNatRule').mockImplementation(() => {});

      // Act
      component.getData();

      // Assert
      expect(mockNgxSmartModalService.getModalData).toHaveBeenCalledWith('natRulesOperationModal');
      expect(component.existingNatRuleId).toEqual(mockDto.ruleId);
      expect(component.currentTierId).toEqual(mockDto.tierId);
      expect(component.selectedTierId).toEqual(mockDto.tierId);
      expect(component.sourceNatRuleGroupId).toEqual(mockDto.sourceRuleGroupId);
      expect(component.sourceNatRuleGroupName).toEqual(mockDto.ruleGroupName);
      expect(getNatRuleGroupsSpy).toHaveBeenCalled();
      expect(getNatRuleSpy).toHaveBeenCalledWith(mockDto.ruleId);
    });
  });

  describe('getNatRuleGroups', () => {
    it('should fetch nat rule groups and update form and component state', done => {
      // Arrange
      const mockTierId = 'tier-id';
      const mockNatRuleGroups = [
        { id: '1', name: 'Group 1' },
        { id: '2', name: 'Intravrf' }, // This should be filtered out
        { id: '3', name: 'Group 2' },
      ];
      mockTierService.getOneTier.mockReturnValue(of({ natRuleGroups: mockNatRuleGroups }));

      // Act
      component.getNatRuleGroups(mockTierId);

      // Assert
      expect(mockTierService.getOneTier).toHaveBeenCalledWith({
        id: mockTierId,
        join: ['natRuleGroups'],
      });
      setTimeout(() => {
        expect(component.natRuleGroups.length).toBe(2);
        expect(component.natRuleGroups).toEqual(expect.arrayContaining([mockNatRuleGroups[0], mockNatRuleGroups[2]]));
        expect(component.form.controls.natRuleGroupId.value).toBeNull();
        done();
      });
    });
  });

  it('should return form controls', () => {
    // Arrange
    const formBuilder: FormBuilder = new FormBuilder();
    component.form = formBuilder.group({
      natRuleGroupId: ['', Validators.required],
      operation: ['', Validators.required],
      ruleIndex: ['', Validators.required],
      name: ['', Validators.required], // Assuming you have a validator, adjust as necessary
    });

    // Act
    const controls = component.f;

    // Assert
    expect(controls).toEqual(component.form.controls);
    // You can also check for specific controls if needed
    expect(controls.natRuleGroupId).toBeTruthy();
    expect(controls.operation).toBeTruthy();
    expect(controls.ruleIndex).toBeTruthy();
    expect(controls.name).toBeTruthy();
  });
});
