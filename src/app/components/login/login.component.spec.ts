import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

const mockActivatedRoute = {
  snapshot: {
    paramMap: convertToParamMap({ id: '7b8f68e5-2d8d-43c4-9fd8-07d521ab34c7' }), // Assuming 'id' is your route parameter name.
    queryParams: {
      returnUrl: '/netcentric/dashboard?tenant=dcs_sandbox1_cms-east_000000000000&datacenter=6e8771d0-6ad3-4415-ad59-fbb372185541',
    },
  },
};

let mockLocation: any;

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const authService = {
    currentUser: of({}),
    login: jest.fn(),
    getTenants: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), FormsModule, ToastrModule.forRoot(), HttpClientTestingModule, RouterModule.forRoot([])],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockLocation = {
      href: '',
      reload: jest.fn(),
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run on init', () => {
    component.ngOnInit();
  });

  it('should login', () => {
    const authLoginSpy = jest
      .spyOn(authService, 'login')
      .mockReturnValue(of({ token: 'token', dcsPermissions: [{ roles: ['admin'], tenant: '*' }] } as any));
    const authGetTenantsSpy = jest
      .spyOn(authService, 'getTenants')
      .mockReturnValue(
        of([{ tenant: 'tenant1', tenantDatabase: 'tenantDb1', tenantFullName: 'tenantFullName', tenantQueryParameter: 'tenantQP' }] as any),
      );
    component.userpass = { username: 'user', password: 'pass' };
    component.login();
    expect(authLoginSpy).toHaveBeenCalledWith(component.userpass);
    expect(authGetTenantsSpy).toHaveBeenCalled();
  });

  it('should nav to location', () => {
    component.selectedLocation = 'East - Ashburn';
    const loginSpy = jest.spyOn(component, 'login');
    component.navToLocation();
    expect(loginSpy).toHaveBeenCalled();
  });

  it('should set tenant and navigate to dashboard', () => {
    component.returnUrl = 'fake/netcentric/dashboard';
    component.setTenantAndNavigate({ name: 'tenant1', tenantQueryParameter: 'tenantQP' }, 'netcentric');
  });

  it('should set tenant and navigate to a different return URL', () => {
    component.oldTenant = 'tenantQP';
    component.returnUrl = 'someother/url/to/navigate/to';
    component.setTenantAndNavigate({ name: 'tenant1', tenantQueryParameter: 'tenantQP' }, 'netcentric');
  });

  it('should fail to set tenant and navigate', () => {
    component.returnUrl = 'fake/netcentric/dashboard';
    component.setTenantAndNavigate(null, 'netcentric');
  });

  it('should navigate to the admin portal', () => {
    component.navToAdminPortal({ name: 'tenant1', tenantQueryParameter: 'tenantQP' });
  });

  it('should fail to navigate to admin portal', () => {
    component.navToAdminPortal(null);
  });
});
