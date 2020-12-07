import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockComponent } from 'src/test/mock-components';
import { V1DatacentersService, V1TiersService, V1LoadBalancerVirtualServersService, V1VmwareVirtualMachinesService } from 'api_client';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    const datacenterService = {
      v1DatacentersGet: jest.fn(() => of({ total: 1 })),
    };

    const tierService = {
      v1TiersGet: jest.fn(() => of({ total: 1 })),
    };

    const vmwareService = {
      v1VmwareVirtualMachinesGet: jest.fn(() => of({ total: 1 })),
    };

    const loadBalancerService = {
      v1LoadBalancerVirtualServersGet: jest.fn(() => of({ total: 1 })),
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
      ],
      providers: [
        { provide: V1DatacentersService, useValue: datacenterService },
        { provide: V1TiersService, useValue: tierService },
        { provide: V1VmwareVirtualMachinesService, useValue: vmwareService },
        { provide: V1LoadBalancerVirtualServersService, useValue: loadBalancerService },
        { provide: AuthService, useValue: authService },
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
    const datacenterService = TestBed.get(V1DatacentersService);
    const tierService = TestBed.get(V1TiersService);
    const vmwareService = TestBed.get(V1VmwareVirtualMachinesService);
    const loadBalancerService = TestBed.get(V1LoadBalancerVirtualServersService);

    component.ngOnInit();

    expect(datacenterService.v1DatacentersGet).toHaveBeenCalledWith({ page: 1, perPage: 1 });
    expect(tierService.v1TiersGet).toHaveBeenCalledWith({ page: 1, perPage: 1 });
    expect(vmwareService.v1VmwareVirtualMachinesGet).toHaveBeenCalledWith({ page: 1, perPage: 1 });
    expect(loadBalancerService.v1LoadBalancerVirtualServersGet).toHaveBeenCalledWith({ page: 1, perPage: 1 });
  });
});
