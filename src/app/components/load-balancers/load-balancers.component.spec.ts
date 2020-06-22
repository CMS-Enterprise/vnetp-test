import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadBalancersComponent } from './load-balancers.component';
import { VirtualServerModalComponent } from 'src/app/modals/virtual-server-modal/virtual-server-modal.component';
import { PoolModalComponent } from 'src/app/modals/pool-modal/pool-modal.component';
import { NodeModalComponent } from 'src/app/modals/node-modal/node-modal.component';
import { IRuleModalComponent } from 'src/app/modals/irule-modal/irule-modal.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { HealthMonitorModalComponent } from 'src/app/modals/health-monitor-modal/health-monitor-modal.component';
import { ToastrModule } from 'ngx-toastr';
import { ImportExportComponent } from '../import-export/import-export.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { TierSelectComponent } from '../tier-select/tier-select.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { ProfileModalComponent } from 'src/app/modals/profile-modal/profile-modal.component';
import { PolicyModalComponent } from 'src/app/modals/policy-modal/policy-modal.component';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadBalancerVlanModalComponent } from 'src/app/modals/lb-vlan-modal/lb-vlan-modal.component';
import { LoadBalancerRouteModalComponent } from 'src/app/modals/lb-route-modal/lb-route-modal.component';
import { LoadBalancerSelfIpModalComponent } from 'src/app/modals/lb-self-ip-modal/lb-self-ip-modal.component';
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
        AngularFontAwesomeModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        LoadBalancersComponent,
        VirtualServerModalComponent,
        LoadBalancerVlanModalComponent,
        LoadBalancerRouteModalComponent,
        LoadBalancerSelfIpModalComponent,
        PoolModalComponent,
        IRuleModalComponent,
        NodeModalComponent,
        HealthMonitorModalComponent,
        ProfileModalComponent,
        PolicyModalComponent,
        ImportExportComponent,
        TierSelectComponent,
        YesNoModalComponent,
        TooltipComponent,
        ResolvePipe,
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
