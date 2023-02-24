import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  V1DatacentersService,
  V1LoadBalancerVirtualServersService,
  V1TiersService,
  V1VmwareVirtualMachinesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
  V2AppCentricTenantsService,
  V2AppCentricVrfsService,
} from 'client';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';

import { AppcentricDashboardComponent } from './appcentric-dashboard.component';

describe('AppcentricDashboardComponent', () => {
  let component: AppcentricDashboardComponent;
  let fixture: ComponentFixture<AppcentricDashboardComponent>;

  beforeEach(async(() => {
    const tenantsService = {
      findAllTenant: jest.fn(() => of({ total: 1 })),
    };

    const vrfsService = {
      findAllVrf: jest.fn(() => of({ total: 1 })),
    };

    const bridgeDomainsService = {
      findAllBridgeDomain: jest.fn(() => of({ total: 1 })),
    };

    const contractsService = {
      findAllContract: jest.fn(() => of({ total: 1 })),
    };

    const authService = {
      completeAuthentication: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [AppcentricDashboardComponent, MockTooltipComponent, MockFontAwesomeComponent],
      imports: [RouterModule, RouterTestingModule],
      providers: [
        { provide: V2AppCentricTenantsService, useValue: tenantsService },
        { provide: V2AppCentricVrfsService, useValue: vrfsService },
        { provide: V2AppCentricBridgeDomainsService, useValue: bridgeDomainsService },
        { provide: V2AppCentricContractsService, useValue: contractsService },
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
