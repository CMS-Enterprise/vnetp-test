import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';
import { AdminPortalComponent } from './admin-portal.component';

describe('Adminportal', () => {
  let component: AdminPortalComponent;
  let fixture: ComponentFixture<AdminPortalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminPortalComponent, MockComponent('app-admin-portal-navbar'), MockComponent('app-breadcrumb')],
      providers: [],
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
