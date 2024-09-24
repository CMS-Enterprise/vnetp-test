import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';

import { AdminPortalComponent } from './admin-portal.component';
import { MockProvider } from 'src/test/mock-providers';
import { AuthService } from 'src/app/services/auth.service';

describe('Adminportal', () => {
  let component: AdminPortalComponent;
  let fixture: ComponentFixture<AdminPortalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminPortalComponent, MockComponent('app-admin-portal-navbar'), MockComponent('app-breadcrumb')],
      providers: [MockProvider(AuthService)],
      imports: [RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
