import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tenant, WanForm } from 'client';
import { WanFormDetailComponent } from './wan-form-detail.component';

describe('WanFormDetailComponent', () => {
  let component: WanFormDetailComponent;
  let fixture: ComponentFixture<WanFormDetailComponent>;

  const mockWanForm: WanForm = {
    id: '1',
    name: 'test-wan-form',
  } as any;

  const mockTenant: Tenant = {
    id: '1',
    tname: 'test-tenant',
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WanFormDetailComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WanFormDetailComponent);
    component = fixture.componentInstance;
    component.wanForm = mockWanForm;
    component.tenant = mockTenant;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive wanForm and tenant inputs', () => {
    expect(component.wanForm).toBe(mockWanForm);
    expect(component.tenant).toBe(mockTenant);
  });

  describe('@Input() global', () => {
    it('should set global to false if undefined is passed', () => {
      component.global = undefined;
      expect(component.global).toBe(false);
    });

    it('should set global to false when set to false', () => {
      component.global = false;
      expect(component.global).toBe(false);
    });

    it('should set global to true when set to true', () => {
      component.global = true;
      expect(component.global).toBe(true);
    });
  });

  describe('Outputs', () => {
    it('should emit manageSubnets when the manage subnets action is triggered', () => {
      jest.spyOn(component.manageSubnets, 'emit');
      const manageSubnetsButton = fixture.debugElement.nativeElement.shadowRoot.querySelector('[data-testid="manage-subnets-button"]');
      expect(manageSubnetsButton).not.toBeNull();
      manageSubnetsButton.click();
      expect(component.manageSubnets.emit).toHaveBeenCalled();
    });

    it('should emit manageRoutes when the manage routes action is triggered', () => {
      jest.spyOn(component.manageRoutes, 'emit');
      const manageRoutesButton = fixture.debugElement.nativeElement.shadowRoot.querySelector('[data-testid="manage-routes-button"]');
      expect(manageRoutesButton).not.toBeNull();
      manageRoutesButton.click();
      expect(component.manageRoutes.emit).toHaveBeenCalled();
    });
  });
});
