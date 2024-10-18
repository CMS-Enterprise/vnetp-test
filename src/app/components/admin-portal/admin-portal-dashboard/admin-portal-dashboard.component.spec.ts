import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPortalDashboardComponent } from './admin-portal-dashboard.component';
import { MockProvider } from 'src/test/mock-providers';
import { AuthService } from 'src/app/services/auth.service';
import { V3GlobalMessagesService } from 'client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    const messageService = TestBed.inject(V3GlobalMessagesService);

    component.getGlobalMessages();

    expect(messageService.getMessagesMessage).toHaveBeenCalledWith({ page: 1, perPage: 10000 });
  });
});
