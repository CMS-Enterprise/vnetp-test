import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadBalancersComponent } from './load-balancers.component';
import { VirtualServerModalComponent } from 'src/app/modals/virtual-server-modal/virtual-server-modal.component';
import { PoolModalComponent } from 'src/app/modals/pool-modal/pool-modal.component';
import { PoolMemberModalComponent } from 'src/app/modals/pool-member-modal/pool-member-modal.component';
import { IRuleModalComponent } from 'src/app/modals/irule-modal/irule-modal.component';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { PapaParseModule } from 'ngx-papaparse';
import { HealthMonitorModalComponent } from 'src/app/modals/health-monitor-modal/health-monitor-modal.component';

describe('LoadBalancersComponent', () => {
  let component: LoadBalancersComponent;
  let fixture: ComponentFixture<LoadBalancersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgxSmartModalModule,
        PapaParseModule,
        NgxMaskModule.forRoot(),
        AngularFontAwesomeModule
      ],
      declarations: [
        LoadBalancersComponent,
        VirtualServerModalComponent,
        PoolModalComponent,
        IRuleModalComponent,
        PoolMemberModalComponent,
        HealthMonitorModalComponent
      ],
      providers: [
        NgxSmartModalService,
        HttpClientModule,
        HttpClient,
        HttpHandler,
        CookieService,
        FormBuilder
      ]
    })
    .compileComponents();
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
