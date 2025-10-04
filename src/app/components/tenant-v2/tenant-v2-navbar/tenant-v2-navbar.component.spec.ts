import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TenantV2NavbarComponent } from './tenant-v2-navbar.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { Subject, Subscription } from 'rxjs';

describe('TenantV2NavbarComponent', () => {
  let component: TenantV2NavbarComponent;
  let fixture: ComponentFixture<TenantV2NavbarComponent>;

  let tenant$: Subject<any>;
  let user$: Subject<any>;
  const mockModal = { open: jest.fn() } as any;
  const mockAuth: any = { currentTenant: null, currentUser: null, logout: jest.fn() };

  beforeEach(async () => {
    tenant$ = new Subject<any>();
    user$ = new Subject<any>();
    mockAuth.currentTenant = tenant$.asObservable();
    mockAuth.currentUser = user$.asObservable();

    await TestBed.configureTestingModule({
      declarations: [TenantV2NavbarComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockModal },
        { provide: AuthService, useValue: mockAuth },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantV2NavbarComponent);
    component = fixture.componentInstance;
  });

  function emitTenantAndUser(tenant: string, user: any): void {
    fixture.detectChanges();
    tenant$.next(tenant);
    user$.next(user);
  }

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('sets user and tenant and maps roles for exact tenant', () => {
    const user = { dcsPermissions: [{ tenant: 't1', roles: ['net-ro', 'other'] }] };
    emitTenantAndUser('t1', user);
    expect(component.tenant).toBe('t1');
    expect(component.user).toBe(user);
    // ro present -> override to admin
    expect(component.userRoles).toEqual(['admin']);
  });

  it('uses wildcard tenant permissions when exact not found', () => {
    const user = { dcsPermissions: [{ tenant: '*', roles: ['net-ro'] }] };
    emitTenantAndUser('some-tenant', user);
    expect(component.userRoles).toEqual(['admin']);
  });

  it('does not override roles when no ro present', () => {
    const roles = ['network-admin'];
    const user = { dcsPermissions: [{ tenant: 't2', roles }] };
    emitTenantAndUser('t2', user);
    expect(component.userRoles).toEqual(roles);
  });

  it('does nothing when user or tenant missing', () => {
    fixture.detectChanges();
    tenant$.next('t3');
    user$.next(null);
    expect(component.user).toBeNull();
    expect(component.userRoles).toBeUndefined();
  });

  it('openLogoutModal opens modal', () => {
    component.openLogoutModal();
    expect(mockModal.open).toHaveBeenCalledWith('logoutModal');
  });

  it('logout calls auth.logout', () => {
    component.logout();
    expect(mockAuth.logout).toHaveBeenCalled();
  });

  it('ngOnDestroy unsubscribes active subscriptions', () => {
    const unsubSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');
    // initialize subscriptions
    const user = { dcsPermissions: [{ tenant: 't1', roles: ['net-ro'] }] };
    emitTenantAndUser('t1', user);
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
