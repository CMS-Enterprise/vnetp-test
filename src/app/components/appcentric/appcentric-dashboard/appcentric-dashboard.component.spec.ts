import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { V1DatacentersService, V1LoadBalancerVirtualServersService, V1TiersService, V1VmwareVirtualMachinesService } from 'client';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MockComponent, MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';

import { AppcentricDashboardComponent } from './appcentric-dashboard.component';

describe('AppcentricDashboardComponent', () => {
  let component: AppcentricDashboardComponent;
  let fixture: ComponentFixture<AppcentricDashboardComponent>;

  beforeEach(async(() => {
    const datacenterService = {
      getManyDatacenters: jest.fn(() => of({ total: 1 })),
    };

    const tierService = {
      getManyTier: jest.fn(() => of({ total: 1 })),
    };

    const vmwareService = {
      getManyVmwareVirtualMachine: jest.fn(() => of({ total: 1 })),
    };

    const loadBalancerService = {
      getManyLoadBalancerVirtualServer: jest.fn(() => of({ total: 1 })),
    };

    const authService = {
      completeAuthentication: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [AppcentricDashboardComponent, MockTooltipComponent, MockFontAwesomeComponent],
      imports: [RouterModule, RouterTestingModule],
      providers: [
        { provide: V1DatacentersService, useValue: datacenterService },
        { provide: V1TiersService, useValue: tierService },
        { provide: V1VmwareVirtualMachinesService, useValue: vmwareService },
        { provide: V1LoadBalancerVirtualServersService, useValue: loadBalancerService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
