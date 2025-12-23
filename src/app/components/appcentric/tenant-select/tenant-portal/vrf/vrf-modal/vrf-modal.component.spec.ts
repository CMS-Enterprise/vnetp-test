/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { VrfModalComponent } from './vrf-modal.component';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Vrf } from 'client';

describe('VrfModalComponent', () => {
  let component: VrfModalComponent;
  let fixture: ComponentFixture<VrfModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VrfModalComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VrfModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const createMockVrf = (): Vrf => ({
    id: 'test-vrf-id',
    name: 'Test VRF',
    alias: 'test-alias',
    description: 'Test description',
    policyControlEnforced: true,
    policyControlEnforcementIngress: false,
    maxExternalRoutes: 100,
    bgpAsn: '65000',
    tenantId: 'test-tenant-id',
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no current VRF', () => {
    expect(component.currentVrf).toBeNull();
  });

  it('should call ngx.close when closeModal is called', () => {
    const ngx = component['ngx'];
    const ngxSpy = jest.spyOn(ngx, 'close');

    component.closeModal();

    expect(ngxSpy).toHaveBeenCalledWith('vrfModal');
  });

  it('should reset currentVrf to null when reset is called', () => {
    component.currentVrf = createMockVrf();

    component.reset();

    expect(component.currentVrf).toBeNull();
  });

  it('should display Close button in footer', () => {
    const closeButton = fixture.debugElement.query(By.css('.btn.btn-primary'));

    expect(closeButton).toBeTruthy();
    expect(closeButton.nativeElement.textContent.trim()).toBe('Close');
  });

  it('should close modal when Close button is clicked', () => {
    const ngx = component['ngx'];
    const ngxSpy = jest.spyOn(ngx, 'close');
    const closeButton = fixture.debugElement.query(By.css('.btn.btn-primary'));

    closeButton.nativeElement.click();

    expect(ngxSpy).toHaveBeenCalledWith('vrfModal');
  });

  describe('getData', () => {
    it('should set currentVrf and vrfId when modal data is provided', () => {
      const mockVrf = createMockVrf();
      const mockDto = {
        ModalMode: ModalMode.Edit,
        vrf: mockVrf,
      };

      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockReturnValue(mockDto);
      jest.spyOn(ngx, 'resetModalData');

      component.getData();

      expect(component.modalMode).toBe(ModalMode.Edit);
      expect(component.vrfId).toBe(mockVrf.id);
      expect(component.currentVrf).toEqual(mockVrf);
      expect(ngx.resetModalData).toHaveBeenCalledWith('vrfModal');
    });

    it('should handle missing VRF data gracefully', () => {
      const mockDto = {
        ModalMode: ModalMode.Edit,
        vrf: null,
      };

      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockReturnValue(mockDto);

      component.getData();

      expect(component.modalMode).toBe(ModalMode.Edit);
      expect(component.currentVrf).toBeNull();
    });
  });
});
