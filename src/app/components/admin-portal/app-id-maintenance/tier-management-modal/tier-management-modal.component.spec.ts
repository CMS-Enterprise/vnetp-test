import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tier } from 'client';
import { TierManagementModalComponent, TierManagementModalData, TierManagementSaveChanges } from './tier-management-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

describe('TierManagementModalComponent', () => {
  let component: TierManagementModalComponent;
  let fixture: ComponentFixture<TierManagementModalComponent>;

  const MOCK_TIER_1: Tier = { id: 't-1', name: 'Tier A', appIdEnabled: true, datacenterId: 'dc-1' };
  const MOCK_TIER_2: Tier = { id: 't-2', name: 'Tier B', appIdEnabled: false, datacenterId: 'dc-1' };
  const MOCK_TIER_3_WITH_RUNTIME: Tier = {
    id: 't-3',
    name: 'Tier C',
    appIdEnabled: true,
    datacenterId: 'dc-1',
    appVersion: 'v1',
  };
  const MOCK_TIER_4_WITH_RUNTIME: Tier = {
    id: 't-4',
    name: 'Tier D',
    appIdEnabled: true,
    datacenterId: 'dc-1',
    runtimeDataLastRefreshed: new Date().toISOString(),
  };

  const getMockDialogData = (): TierManagementModalData => ({
    tenantName: 'Test Tenant',
    tiers: JSON.parse(JSON.stringify([MOCK_TIER_1, MOCK_TIER_4_WITH_RUNTIME, MOCK_TIER_2, MOCK_TIER_3_WITH_RUNTIME])),
  });

  async function setupComponent(data: TierManagementModalData | null) {
    await TestBed.configureTestingModule({
      declarations: [TierManagementModalComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TierManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('Initialization', () => {
    it('should create and initialize correctly with data', async () => {
      await setupComponent(getMockDialogData());
      expect(component).toBeTruthy();
      expect(component.tenantName).toBe('Test Tenant');
      expect(component.allTiers.map(t => t.name)).toEqual(['Tier A', 'Tier B', 'Tier C', 'Tier D']); // Check sort
      expect(component.initialTierStates.get('t-1')).toBe(true);
      expect(component.currentTierStates.get('t-1')).toBe(true);
      expect(component.initialTierStates.get('t-2')).toBe(false);
      expect(component.currentTierStates.get('t-2')).toBe(false);
    });

    it('should handle initialization with empty tiers array', async () => {
      await setupComponent({ tenantName: 'Test Tenant', tiers: [] });
      expect(component.allTiers.length).toBe(0);
      expect(component.initialTierStates.size).toBe(0);
      expect(component.currentTierStates.size).toBe(0);
    });

    it('should handle initialization with null/undefined tiers array', async () => {
      await setupComponent({ tenantName: 'Test Tenant', tiers: null });
      expect(component.allTiers.length).toBe(0);
    });

    it('should log an error if no data is provided', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await setupComponent(null);
      expect(consoleErrorSpy).toHaveBeenCalledWith('TierManagementModalComponent: No data received!');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('State Management and Helpers', () => {
    beforeEach(async () => {
      await setupComponent(getMockDialogData());
    });

    it('toggleTierStatus should flip the current state', () => {
      expect(component.currentTierStates.get('t-1')).toBe(true);
      component.toggleTierStatus('t-1');
      expect(component.currentTierStates.get('t-1')).toBe(false);
      component.toggleTierStatus('t-1');
      expect(component.currentTierStates.get('t-1')).toBe(true);
    });

    it('toggleAllTiersStatus should enable or disable all tiers', () => {
      component.toggleAllTiersStatus({ checked: false } as MatSlideToggleChange);
      expect(Array.from(component.currentTierStates.values()).every(s => s === false)).toBe(true);

      component.toggleAllTiersStatus({ checked: true } as MatSlideToggleChange);
      expect(Array.from(component.currentTierStates.values()).every(s => s === true)).toBe(true);
    });

    it('areAllTiersCurrentlyEnabled should return true only if all tiers are enabled', () => {
      component.currentTierStates.set('t-2', true); // Enable the one disabled tier
      expect(component.areAllTiersCurrentlyEnabled()).toBe(true);
      component.currentTierStates.set('t-2', false);
      expect(component.areAllTiersCurrentlyEnabled()).toBe(false);
    });

    it('areAllTiersCurrentlyEnabled should return false for an empty list', () => {
      component.allTiers = [];
      expect(component.areAllTiersCurrentlyEnabled()).toBe(false);
    });

    it('hasChanges should return false if state is unchanged', () => {
      expect(component.hasChanges()).toBe(false);
    });

    it('hasChanges should return true if state has changed', () => {
      component.toggleTierStatus('t-1');
      expect(component.hasChanges()).toBe(true);
    });

    it('hasChanges should return false if state is reverted', () => {
      component.toggleTierStatus('t-1');
      component.toggleTierStatus('t-1');
      expect(component.hasChanges()).toBe(false);
    });
  });

  describe('User Actions', () => {
    beforeEach(async () => {
      await setupComponent(getMockDialogData());
    });

    it('onCancel should reset state and emit closeModal', () => {
      const closeModalSpy = jest.spyOn(component.closeModal, 'emit');
      component.viewMode = 'summary';
      component.pendingChangesToDisplay = [{} as any];

      component.onCancel();

      expect(component.viewMode).toBe('edit');
      expect(component.pendingChangesToDisplay.length).toBe(0);
      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('onBackToEdit should reset viewMode and pending changes', () => {
      component.viewMode = 'summary';
      component.pendingChangesToDisplay = [{} as any];

      component.onBackToEdit();

      expect(component.viewMode).toBe('edit');
      expect(component.pendingChangesToDisplay.length).toBe(0);
    });
  });

  describe('onSaveOrConfirm', () => {
    describe('in "edit" mode', () => {
      beforeEach(async () => {
        await setupComponent(getMockDialogData());
      });

      it('should do nothing and close if no changes were made', () => {
        const closeModalSpy = jest.spyOn(component.closeModal, 'emit');
        component.onSaveOrConfirm();
        expect(component.viewMode).toBe('edit');
        expect(closeModalSpy).toHaveBeenCalled();
      });

      it('should switch to summary view if changes were made', () => {
        component.toggleTierStatus('t-1'); // From true to false
        component.onSaveOrConfirm();
        expect(component.viewMode).toBe('summary');
        expect(component.pendingChangesToDisplay.length).toBe(1);
        expect(component.pendingChangesToDisplay[0].name).toBe('Tier A');
        expect(component.pendingChangesToDisplay[0].newStatus).toBe(false);
      });

      it('should correctly identify tiers with and without runtime data warnings', () => {
        component.toggleTierStatus('t-1'); // No runtime data, disable -> no warning
        component.toggleTierStatus('t-3'); // Has appVersion, disable -> warning
        component.toggleTierStatus('t-4'); // Has runtimeData, disable -> warning
        component.toggleTierStatus('t-2'); // Enable -> no warning

        component.onSaveOrConfirm();

        expect(component.viewMode).toBe('summary');
        expect(component.pendingChangesToDisplay.length).toBe(4);

        const tier1Change = component.pendingChangesToDisplay.find(c => c.id === 't-1');
        const tier2Change = component.pendingChangesToDisplay.find(c => c.id === 't-2');
        const tier3Change = component.pendingChangesToDisplay.find(c => c.id === 't-3');
        const tier4Change = component.pendingChangesToDisplay.find(c => c.id === 't-4');

        expect(tier1Change.showDisableWarning).toBe(false);
        expect(tier2Change.showDisableWarning).toBe(false);
        expect(tier3Change.showDisableWarning).toBe(true);
        expect(tier4Change.showDisableWarning).toBe(true);
      });
    });

    describe('in "summary" mode', () => {
      beforeEach(async () => {
        await setupComponent(getMockDialogData());
        // Get component into summary mode
        component.toggleTierStatus('t-1');
        component.onSaveOrConfirm();
        expect(component.viewMode).toBe('summary');
      });

      it('should emit saveChanges and reset state', () => {
        const saveChangesSpy = jest.spyOn(component.saveChanges, 'emit');
        component.onSaveOrConfirm();

        const expectedPayload: TierManagementSaveChanges = {
          tiersToUpdate: [{ id: 't-1', appIdEnabled: false }],
        };
        expect(saveChangesSpy).toHaveBeenCalledWith(expectedPayload);
        expect(component.viewMode).toBe('edit');
        expect(component.pendingChangesToDisplay.length).toBe(0);
      });
    });
  });
});
