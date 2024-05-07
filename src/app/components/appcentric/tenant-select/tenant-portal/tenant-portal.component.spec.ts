import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';

import { TenantPortalComponent } from './tenant-portal.component';
import { V2AppCentricTenantsService } from 'client';
import { HttpClientModule } from '@angular/common/http';

describe('TenantPortalComponent', () => {
  let component: TenantPortalComponent;
  let fixture: ComponentFixture<TenantPortalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TenantPortalComponent, MockComponent({ selector: 'app-tabs', inputs: ['tabs', 'initialTabIndex'] })],
      imports: [RouterModule, RouterTestingModule, HttpClientModule],
      providers: [V2AppCentricTenantsService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
