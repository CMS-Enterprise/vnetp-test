import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'src/test/mock-providers';
import { AuthService } from 'src/app/services/auth.service';
import { V3GlobalMessagesService } from 'client';
import { TenantV2DashboardComponent } from './tenant-v2-dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';

describe('TenantV2Dashboard', () => {
  let component: TenantV2DashboardComponent;
  let fixture: ComponentFixture<TenantV2DashboardComponent>;

  beforeEach(() => {
    const authService = {
      completeAuthentication: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      declarations: [TenantV2DashboardComponent, MockFontAwesomeComponent],
      providers: [{ provide: AuthService, useValue: authService }, MockProvider(V3GlobalMessagesService)],
    });
    fixture = TestBed.createComponent(TenantV2DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
