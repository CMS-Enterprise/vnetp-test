import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { D3PieChartComponent } from '../d3-pie-chart/d3-pie-chart.component';
import { AuthService } from 'src/app/services/auth.service';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    const authService = {
      currentUser: null,
      logout: jest.fn(),
      login: jest.fn(() => of({})),
    };

    const router = {
      navigateByUrl: jest.fn(),
    };

    const toastr = {
      success: jest.fn(),
      error: jest.fn(),
    };

    const activatedRoute = {
      snapshot: {
        queryParams: {
          returnUrl: 'test-url',
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LoginComponent, DashboardComponent, D3PieChartComponent, MockTooltipComponent, MockFontAwesomeComponent],
      providers: [
        CookieService,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to logout when the current user is not set', () => {
    const authService = TestBed.get(AuthService);
    authService.currentUser = null;

    component.ngOnInit();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should not call to login when the username and password are missing', () => {
    const authService = TestBed.get(AuthService);
    component.userpass = { Username: null, Password: null, Token: '' };

    const loginButton = fixture.debugElement.query(By.css('.btn.btn-primary'));
    loginButton.nativeElement.click();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should log a toastr success message after logging in', () => {
    const authService = TestBed.get(AuthService);
    const toastrService = TestBed.get(ToastrService);
    component.userpass = { Username: 'username', Password: 'password', Token: '' };

    const loginButton = fixture.debugElement.query(By.css('.btn.btn-primary'));
    loginButton.nativeElement.click();

    expect(authService.login).toHaveBeenCalled();
    expect(toastrService.success).toHaveBeenCalledWith('Welcome username!');
  });

  it('should display an toastr error when login fails', () => {
    const authService = TestBed.get(AuthService);
    jest.spyOn(authService, 'login').mockImplementation(() => throwError('oops'));
    const toastrService = TestBed.get(ToastrService);
    component.userpass = { Username: 'username', Password: 'password', Token: '' };

    const loginButton = fixture.debugElement.query(By.css('.btn.btn-primary'));
    loginButton.nativeElement.click();

    expect(toastrService.error).toHaveBeenCalledWith('Invalid Username/Password');
  });

  it('should navigate to the return url if the user is already logged in', () => {
    const authService = TestBed.get(AuthService);
    const router = TestBed.get(Router);
    authService.currentUser = {};

    component.ngOnInit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('test-url');
  });
});
