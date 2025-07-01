import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  UserDto,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
  V2AppCentricTenantsService,
  V2AppCentricVrfsService,
} from 'client';
import { BehaviorSubject, of } from 'rxjs';
import { AppcentricDashboardHelpText } from 'src/app/helptext/help-text-networking';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { AppcentricDashboardComponent } from './appcentric-dashboard.component';

const MOCK_USER: UserDto = {
  dn: 'dn',
  uid: 'testuser',
  cn: 'testuser',
  givenname: 'test',
  mail: 'test@test.com',
  dcsrole: 'role',
  ismemberof: {},
  token: 'token',
  expiresIn: 1000,
  dcsPermissions: [
    { tenant: 'tenantA', roles: ['roleA', 'roleB'] },
    { tenant: 'tenantB', roles: ['roleC'] },
  ],
};

describe('AppcentricDashboardComponent', () => {
  let component: AppcentricDashboardComponent;
  let fixture: ComponentFixture<AppcentricDashboardComponent>;
  let mockAuthService;
  let mockTenantsService;
  let mockVrfsService;
  let mockBridgeDomainsService;
  let mockContractsService;

  beforeEach(() => {
    mockAuthService = {
      currentUser: new BehaviorSubject<UserDto | null>(MOCK_USER),
    };

    mockTenantsService = {
      getManyTenant: jest.fn().mockReturnValue(of({ total: 10 })),
    };

    mockVrfsService = {
      getManyVrf: jest.fn().mockReturnValue(of({ total: 20 })),
    };

    mockBridgeDomainsService = {
      getManyBridgeDomain: jest.fn().mockReturnValue(of({ total: 30 })),
    };

    mockContractsService = {
      getManyContract: jest.fn().mockReturnValue(of({ total: 40 })),
    };

    TestBed.configureTestingModule({
      declarations: [AppcentricDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantsService },
        { provide: V2AppCentricVrfsService, useValue: mockVrfsService },
        { provide: V2AppCentricBridgeDomainsService, useValue: mockBridgeDomainsService },
        { provide: V2AppCentricContractsService, useValue: mockContractsService },
        { provide: AppcentricDashboardHelpText, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppcentricDashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set user and poll dashboard when user is logged in', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123 as any);
      const loadDashboardSpy = jest.spyOn(component as any, 'loadDashboard');

      fixture.detectChanges(); // triggers ngOnInit

      expect(component.user).toEqual(MOCK_USER);
      expect(component.userRoles).toEqual(['roleA', 'roleB', 'roleC']);
      expect(loadDashboardSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000 * 300);
    });

    it('should still poll dashboard when user is not logged in', () => {
      mockAuthService.currentUser = null;
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123 as any);
      const loadDashboardSpy = jest.spyOn(component as any, 'loadDashboard');

      fixture.detectChanges(); // triggers ngOnInit

      expect(component.user).toBeUndefined();
      expect(component.userRoles).toBeUndefined();
      expect(loadDashboardSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000 * 300);
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear interval and unsubscribe', () => {
      fixture.detectChanges();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const unsubscribeUtilSpy = jest.spyOn(SubscriptionUtil, 'unsubscribe');

      component.ngOnDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledWith(component.dashboardPoller);
      expect(unsubscribeUtilSpy).toHaveBeenCalledWith([(component as any).currentUserSubscription]);
    });
  });

  describe('loadDashboard', () => {
    it('should fetch all counts', () => {
      fixture.detectChanges();
      expect(mockTenantsService.getManyTenant).toHaveBeenCalled();
      expect(component.tenants).toBe(10);

      expect(mockVrfsService.getManyVrf).toHaveBeenCalled();
      expect(component.vrfs).toBe(20);

      expect(mockBridgeDomainsService.getManyBridgeDomain).toHaveBeenCalled();
      expect(component.bridgeDomains).toBe(30);

      expect(mockContractsService.getManyContract).toHaveBeenCalled();
      expect(component.contracts).toBe(40);
    });
  });
});
