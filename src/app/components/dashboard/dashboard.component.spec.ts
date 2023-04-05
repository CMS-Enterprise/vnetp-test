import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockComponent } from 'src/test/mock-components';
import {
  V1DatacentersService,
  V1TiersService,
  V1LoadBalancerVirtualServersService,
  V1VmwareVirtualMachinesService,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1AuditLogService,
  V1NetworkSecurityNatRulesService,
  V1NetworkSubnetsService,
  V1NetworkVlansService,
} from 'client';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MockProvider } from 'src/test/mock-providers';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

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
      declarations: [
        DashboardComponent,
        MockComponent({ selector: 'app-d3-pie-chart', inputs: ['data', 'width', 'height', 'radius'] }),
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
      ],
      providers: [
        { provide: V1DatacentersService, useValue: datacenterService },
        { provide: V1TiersService, useValue: tierService },
        { provide: V1VmwareVirtualMachinesService, useValue: vmwareService },
        { provide: V1LoadBalancerVirtualServersService, useValue: loadBalancerService },
        { provide: AuthService, useValue: authService },
        MockProvider(V1NetworkSecurityFirewallRulesService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1AuditLogService),
        MockProvider(V1NetworkSecurityNatRulesService),
        MockProvider(V1NetworkSubnetsService),
        MockProvider(V1NetworkVlansService),
        MockProvider(DatacenterContextService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    const datacenterService = TestBed.inject(V1DatacentersService);
    const tierService = TestBed.inject(V1TiersService);
    const vmwareService = TestBed.inject(V1VmwareVirtualMachinesService);
    const loadBalancerService = TestBed.inject(V1LoadBalancerVirtualServersService);

    component.ngOnInit();

    expect(datacenterService.getManyDatacenters).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(tierService.getManyTier).toHaveBeenCalledWith({ page: 1, limit: 1 });
  });
});
