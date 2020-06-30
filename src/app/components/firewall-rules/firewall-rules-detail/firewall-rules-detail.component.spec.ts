import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { FirewallRulesDetailComponent } from './firewall-rules-detail.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { ImportExportComponent } from '../../import-export/import-export.component';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

describe('FirewallRulesDetailComponent', () => {
  let component: FirewallRulesDetailComponent;
  let fixture: ComponentFixture<FirewallRulesDetailComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgxSmartModalModule,
        NgxPaginationModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        FirewallRulesDetailComponent,
        FirewallRuleModalComponent,
        ImportExportComponent,
        TooltipComponent,
        YesNoModalComponent,
        ResolvePipe,
        MockFontAwesomeComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, DatacenterContextService, FormBuilder],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
