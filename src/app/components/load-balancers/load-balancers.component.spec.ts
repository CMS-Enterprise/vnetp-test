import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadBalancersComponent } from './load-balancers.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
  MockTabsComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import {
  V1LoadBalancerHealthMonitorsService,
  V1LoadBalancerIrulesService,
  V1LoadBalancerNodesService,
  V1LoadBalancerPoliciesService,
  V1LoadBalancerPoolsService,
  V1LoadBalancerRoutesService,
  V1LoadBalancerSelfIpsService,
  V1TiersService,
  V1LoadBalancerVirtualServersService,
  V1LoadBalancerVlansService,
  V1LoadBalancerProfilesService,
} from 'api_client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { of } from 'rxjs';

describe('LoadBalancersComponent', () => {
  let component: LoadBalancersComponent;
  let fixture: ComponentFixture<LoadBalancersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        LoadBalancersComponent,
        MockComponent({ selector: 'app-health-monitor-modal' }),
        MockComponent({ selector: 'app-irule-modal' }),
        MockComponent({ selector: 'app-load-balancer-policy-modal' }),
        MockComponent({ selector: 'app-load-balancer-profile-modal' }),
        MockComponent({ selector: 'app-load-balancer-route-modal' }),
        MockComponent({ selector: 'app-load-balancer-self-ip-modal' }),
        MockComponent({ selector: 'app-load-balancer-vlan-modal' }),
        MockComponent({ selector: 'app-node-modal' }),
        MockComponent({ selector: 'app-pool-modal' }),
        MockComponent({ selector: 'app-tier-select' }),
        MockComponent({ selector: 'app-virtual-server-modal' }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        ResolvePipe,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(V1LoadBalancerHealthMonitorsService),
        MockProvider(V1LoadBalancerIrulesService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1LoadBalancerNodesService),
        MockProvider(V1LoadBalancerPoliciesService),
        MockProvider(V1LoadBalancerPoolsService, { v1LoadBalancerPoolsIdTierIdGet: of([]) }),
        MockProvider(V1LoadBalancerProfilesService),
        MockProvider(V1LoadBalancerRoutesService),
        MockProvider(V1LoadBalancerSelfIpsService),
        MockProvider(TierContextService),
        MockProvider(V1TiersService),
        MockProvider(V1LoadBalancerVirtualServersService),
        MockProvider(V1LoadBalancerVlansService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(LoadBalancersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw an error when editing a pool without a pool provided', () => {
    const throwsError = () => {
      component.openPoolModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Pool required');
  });

  it('should throw an error when editing a node without a node provided', () => {
    const throwsError = () => {
      component.openNodeModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Node required');
  });

  it('should throw an error when editing a iRule without an iRule provided', () => {
    const throwsError = () => {
      component.openIRuleModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('IRule required');
  });

  it('should throw an error when editing a health monitory without a health monitor provided', () => {
    const throwsError = () => {
      component.openHealthMonitorModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Health Monitor required');
  });

  it('should throw an error when editing a profile without a profile provided', () => {
    const throwsError = () => {
      component.openProfileModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Profile required');
  });

  it('should throw an error when editing a policy without a policy provided', () => {
    const throwsError = () => {
      component.openPolicyModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Policy required');
  });

  it('should throw an error when editing a vlan without a vlan provided', () => {
    const throwsError = () => {
      component.openVlanModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('VLAN required');
  });

  it('should throw an error when editing a self ip without a self ip provided', () => {
    const throwsError = () => {
      component.openSelfIpModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Self IP required');
  });

  it('should throw an error when editing a route without a route provided', () => {
    const throwsError = () => {
      component.openRouteModal(ModalMode.Edit, null);
    };
    expect(throwsError).toThrowError('Route required');
  });
});
