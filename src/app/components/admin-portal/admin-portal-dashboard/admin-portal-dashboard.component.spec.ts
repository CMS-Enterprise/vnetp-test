import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPortalDashboardComponent } from './admin-portal-dashboard.component';
import { AuthService } from 'src/app/services/auth.service';
import { UserDto, V3GlobalMessagesService } from 'client';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

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

describe('AdminPortalDashboardComponent', () => {
  let component: AdminPortalDashboardComponent;
  let fixture: ComponentFixture<AdminPortalDashboardComponent>;
  let mockAuthService;
  let mockGlobalMessagesService;

  beforeEach(() => {
    mockAuthService = {
      currentUser: new BehaviorSubject<UserDto | null>(MOCK_USER),
    };

    mockGlobalMessagesService = {
      getMessagesMessage: jest.fn().mockReturnValue(of({ total: 5 })),
    };

    TestBed.configureTestingModule({
      declarations: [AdminPortalDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: V3GlobalMessagesService, useValue: mockGlobalMessagesService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPortalDashboardComponent);
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
    it('should subscribe to currentUser and load dashboard when user is logged in', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123 as any);
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const loadDashboardSpy = jest.spyOn(component, 'loadDashboard');

      fixture.detectChanges(); // triggers ngOnInit

      expect(component.user).toEqual(MOCK_USER);
      expect(component.userRoles).toEqual(['roleA', 'roleB', 'roleC']);
      expect(loadDashboardSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000 * 300);

      component.ngOnDestroy();
      expect(clearIntervalSpy).toHaveBeenCalledWith(123);
    });

    it('should do nothing if there is no current user', () => {
      mockAuthService.currentUser = null;
      const loadDashboardSpy = jest.spyOn(component, 'loadDashboard');
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      fixture.detectChanges();

      expect(component.user).toBeUndefined();
      expect(component.userRoles).toBeUndefined();
      expect(loadDashboardSpy).not.toHaveBeenCalled();
      expect(setIntervalSpy).not.toHaveBeenCalled();
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

  it('loadDashboard should call getGlobalMessages', () => {
    const getGlobalMessagesSpy = jest.spyOn(component, 'getGlobalMessages');
    component.loadDashboard();
    expect(getGlobalMessagesSpy).toHaveBeenCalled();
  });

  it('getGlobalMessages should fetch messages and update status', () => {
    component.getGlobalMessages();
    expect(mockGlobalMessagesService.getMessagesMessage).toHaveBeenCalledWith({ page: 1, perPage: 10000 });
    expect(component.globalMessages).toBe(5);
    expect(component.status[1].status).toBe('green');
  });
});
