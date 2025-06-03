import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockProvider } from 'src/test/mock-providers';
import { ActivatedRoute, convertToParamMap, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';

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
      imports: [FormsModule, ToastrModule.forRoot(), HttpClientTestingModule, RouterModule.forRoot([])],
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
});
