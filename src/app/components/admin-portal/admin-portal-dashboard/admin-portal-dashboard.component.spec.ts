/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPortalDashboardComponent } from './admin-portal-dashboard.component';
import { MockProvider } from 'src/test/mock-providers';
import { AuthService } from 'src/app/services/auth.service';
import { V3GlobalMessagesService } from 'client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('AdminPortalDashboardComponent', () => {
  let component: AdminPortalDashboardComponent;
  let fixture: ComponentFixture<AdminPortalDashboardComponent>;

  beforeEach(() => {
    const authService = {
      completeAuthentication: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
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
    const authService = TestBed.inject(AuthService);
    authService.currentUser = of({ user: '123', dcsPermissions: [{ roles: 'role1' }] } as any);
    component['auth'].getTenants = jest.fn().mockReturnValue(of([{ tenant: 'tenant' }]) as any);
    const messageService = TestBed.inject(V3GlobalMessagesService);
    const loadDashboardSpy = jest.spyOn(component, 'loadDashboard');

    component.ngOnInit();

    expect(loadDashboardSpy).toHaveBeenCalled();

    expect(messageService.getMessagesMessage).toHaveBeenCalledWith({ page: 1, perPage: 10000 });
  });
});
