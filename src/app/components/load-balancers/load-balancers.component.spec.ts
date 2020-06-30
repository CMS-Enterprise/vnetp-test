import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadBalancersComponent } from './load-balancers.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { MockFontAwesomeComponent, MockTooltipComponent, MockComponent, MockImportExportComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('LoadBalancersComponent', () => {
  let component: LoadBalancersComponent;
  let fixture: ComponentFixture<LoadBalancersComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgxSmartModalModule,
        ToastrModule.forRoot(),
        NgxMaskModule.forRoot(),
        NgxPaginationModule,
        NgSelectModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        LoadBalancersComponent,
        MockComponent({ selector: 'app-virtual-server-modal' }),
        MockComponent({ selector: 'app-pool-modal' }),
        MockComponent({ selector: 'app-node-modal' }),
        MockComponent({ selector: 'app-irule-modal' }),
        MockComponent({ selector: 'app-health-monitor-modal' }),
        MockComponent({ selector: 'app-load-balancer-profile-modal' }),
        MockComponent({ selector: 'app-load-balancer-policy-modal' }),
        MockComponent({ selector: 'app-load-balancer-vlan-modal' }),
        MockComponent({ selector: 'app-load-balancer-self-ip-modal' }),
        MockComponent({ selector: 'app-load-balancer-route-modal' }),
        MockComponent({ selector: 'app-tier-select' }),
        MockImportExportComponent,
        YesNoModalComponent,
        MockTooltipComponent,
        ResolvePipe,
        MockFontAwesomeComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, FormBuilder],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadBalancersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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
