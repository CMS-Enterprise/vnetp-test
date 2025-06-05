import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPortalDashboardComponent } from './admin-portal-dashboard.component';
import { MockProvider } from 'src/test/mock-providers';
import { AuthService } from 'src/app/services/auth.service';
import { V3GlobalMessagesService } from 'client';

describe('AdminPortalDashboardComponent', () => {
  let component: AdminPortalDashboardComponent;
  let fixture: ComponentFixture<AdminPortalDashboardComponent>;

  beforeEach(() => {
    const authService = {
      completeAuthentication: jest.fn(),
      subscribe: jest.fn(),
      currentUser: { subscribe: jest.fn() },
    };
    TestBed.configureTestingModule({
      declarations: [AdminPortalDashboardComponent],
      providers: [{ provide: AuthService, useValue: authService }, MockProvider(V3GlobalMessagesService)],
    });
    fixture = TestBed.createComponent(AdminPortalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    const loadDashboardSpy = jest.spyOn(component, 'loadDashboard');
    component.ngOnInit();

    expect(loadDashboardSpy).toHaveBeenCalled();
    // expect(component.dashboardPoller).toEqual()
  });

  it('should get global messages when loading dashboard', () => {
    const messageService = TestBed.inject(V3GlobalMessagesService);
    component.loadDashboard();
    expect(messageService.getMessagesMessage).toHaveBeenCalledWith({ page: 1, perPage: 10000 });
  });
});
