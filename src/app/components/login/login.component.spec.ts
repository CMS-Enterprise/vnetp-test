import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserDto } from 'client/model/userDto';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: any;
  let router: any;
  let route: any;
  let toastr: any;
  let currentTenantSubject: BehaviorSubject<string | null>;

  const mockUser: UserDto = {
    uid: 'testuser',
    token: 'test-token',
    dcsPermissions: [{ tenant: 'tenant1', roles: ['user'] }],
  } as any;

  const mockAdminUser: UserDto = {
    uid: 'admin',
    token: 'admin-token',
    dcsPermissions: [{ tenant: '*', roles: ['global-admin'] }],
  } as any;

  const mockTenants = [
    { tenant: 'tenant1', tenantQueryParameter: 'tenant1-qp' },
    { tenant: 'tenant2', tenantQueryParameter: 'tenant2-qp' },
  ];

  beforeEach(async () => {
    currentTenantSubject = new BehaviorSubject<string | null>(null);

    const authServiceMock = {
      login: jest.fn().mockReturnValue(of(mockUser)),
      getTenants: jest.fn().mockReturnValue(of(mockTenants)),
      logout: jest.fn(),
      currentUser: null,
      get currentTenantValue() {
        return currentTenantSubject.getValue();
      },
      set currentTenantValue(value: string) {
        currentTenantSubject.next(value);
      },
    };

    const routerMock = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    };

    const activatedRouteMock = {
      snapshot: {
        queryParams: {},
      },
    };

    const toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
    };

    jest.spyOn(environment, 'dynamic', 'get').mockReturnValue({
      dcsLocations: [
        { name: 'Location1', url: 'http://location1.com' },
        { name: 'Location2', url: 'http://location2.com' },
      ],
    } as any);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ToastrService, useValue: toastrServiceMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    toastr = TestBed.inject(ToastrService);

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize available locations from environment', () => {
      component.ngOnInit();
      expect(component.availableLocations).toEqual(['Location1', 'Location2']);
    });

    it('should detect location from URL', () => {
      const mockUrl = 'http://location1.com';
      Object.defineProperty(window, 'location', {
        value: {
          href: mockUrl,
        },
        writable: true,
      });
      component.ngOnInit();
      expect(component.showLogin).toBe(true);
      expect(component.selectedLocation).toBe('Location1');
      expect(component.disableUserPass).toBe(false);
    });

    it('should set returnUrl from query params', () => {
      route.snapshot.queryParams.returnUrl = '/some/path';
      component.ngOnInit();
      expect(component.returnUrl).toBe('/some/path');
    });

    it('should logout if no current user', () => {
      authService.currentUser = null;
      component.ngOnInit();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should parse tenant from returnUrl', () => {
      route.snapshot.queryParams.returnUrl = '/some/path?tenant=tenant-abc';
      component.ngOnInit();
      expect(component.returnUrl).toBe('/some/path?tenant=tenant-abc');
      expect(component.selectedTenant).toBe('tenant-abc');
      expect(component.oldTenant).toBe('tenant-abc');
    });
  });

  describe('login', () => {
    beforeEach(() => {
      component.userpass = { username: 'test', password: 'password' };
    });

    it('should do nothing if username or password is not provided', () => {
      component.userpass.username = '';
      component.login();
      expect(authService.login).not.toHaveBeenCalled();

      component.userpass.username = 'test';
      component.userpass.password = '';
      component.login();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should handle successful login for normal user', fakeAsync(() => {
      component.login();
      tick();
      expect(authService.login).toHaveBeenCalledWith(component.userpass);
      expect(authService.getTenants).toHaveBeenCalled();
      expect(component.availableTenants.length).toBe(1);
      expect((component.availableTenants[0] as any).tenant).toBe('tenant1');
      expect(component.showTenantButton).toBe(true);
      expect(component.showAdminPortalButton).toBe(false);
    }));

    it('should handle successful login for admin user', fakeAsync(() => {
      authService.login.mockReturnValue(of(mockAdminUser));
      component.login();
      tick();
      expect(authService.login).toHaveBeenCalledWith(component.userpass);
      expect(authService.getTenants).toHaveBeenCalled();
      expect(component.availableTenants.length).toBe(2);
      expect(component.showTenantButton).toBe(true);
      expect(component.showAdminPortalButton).toBe(true);
    }));

    it('should handle login failure', fakeAsync(() => {
      authService.login.mockReturnValue(throwError('error'));
      component.login();
      tick();
      expect(toastr.error).toHaveBeenCalledWith('Invalid Username/Password');
      expect(component.errorMessage).toBe('Invalid Username/Password');
      expect(component.loading).toBe(false);
    }));

    it('should handle getTenants failure', fakeAsync(() => {
      authService.getTenants.mockReturnValue(throwError('error'));
      component.login();
      tick();
      expect(toastr.error).toHaveBeenCalledWith('Error getting tenants');
      expect(component.errorMessage).toBe('Error getting tenants');
      expect(component.loading).toBe(false);
    }));
  });

  describe('setTenantAndNavigate', () => {
    const tenant = { tenant: 'tenant1', tenantQueryParameter: 'tenant1-qp' };
    beforeEach(() => {
      component.userpass = { username: 'test', password: 'password' };
    });

    it('should navigate to new mode dashboard if mode changes', () => {
      component.returnUrl = '/appcentric/some-page';
      component.setTenantAndNavigate(tenant, 'netcentric');
      expect(toastr.success).toHaveBeenCalledWith('Welcome test!');
      expect(router.navigate).toHaveBeenCalledWith(['/netcentric/dashboard'], { queryParams: { tenant: 'tenant1-qp' } });
    });

    it('should navigate to new mode dashboard if tenant changes', () => {
      component.returnUrl = '/netcentric/dashboard';
      component.oldTenant = 'old-tenant-qp';
      component.setTenantAndNavigate(tenant, 'netcentric');
      expect(toastr.success).toHaveBeenCalledWith('Welcome test!');
      expect(router.navigate).toHaveBeenCalledWith(['/netcentric/dashboard'], { queryParams: { tenant: 'tenant1-qp' } });
    });

    it('should navigate by url if no change in mode or tenant and returnUrl is not dashboard', () => {
      component.returnUrl = '/netcentric/some/page';
      component.oldTenant = 'tenant1-qp';
      component.setTenantAndNavigate(tenant, 'netcentric');
      expect(toastr.success).toHaveBeenCalledWith('Welcome test!');
      expect(router.navigateByUrl).toHaveBeenCalledWith(component.returnUrl);
    });

    it('should set tenant in localStorage', () => {
      component.returnUrl = '/netcentric/dashboard';
      component.setTenantAndNavigate(tenant, 'netcentric');
      expect(toastr.success).toHaveBeenCalledWith('Welcome test!');
    });
  });

  describe('navToAdminPortal', () => {
    const tenant = { tenant: 'tenant1', tenantQueryParameter: 'tenant1-qp' };
    it('should do nothing if no tenant selected', () => {
      component.selectedTenant = '';
      const result = component.navToAdminPortal(tenant);
      expect(result).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to admin portal', () => {
      component.selectedTenant = 'tenant1';
      component.navToAdminPortal(tenant);
      expect(router.navigate).toHaveBeenCalledWith(['adminportal/dashboard'], { queryParams: { tenant: 'tenant1-qp' } });
    });
  });

  describe('navToLocation', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });
    });

    it('should navigate to the location url', () => {
      component.selectedLocation = 'Location1';
      component.navToLocation();
      expect(window.location.href).toBe('http://location1.com');
    });

    it('should not navigate if already at the location url', () => {
      window.location.href = 'http://location1.com';
      component.selectedLocation = 'Location1';
      component.navToLocation();
      expect(window.location.href).toBe('http://location1.com');
    });

    it('should call login if userpass is provided', () => {
      const loginSpy = jest.spyOn(component, 'login').mockImplementation();
      component.selectedLocation = 'Location1';
      component.userpass = { username: 'test', password: 'password' };
      component.navToLocation();
      expect(loginSpy).toHaveBeenCalled();
    });
  });
});
