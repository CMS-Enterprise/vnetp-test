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
import { PapaParseModule } from 'ngx-papaparse';
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
        PapaParseModule,
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
});
