import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { FirewallRulesDetailComponent } from './firewall-rules-detail.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockIconButtonComponent, MockComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { MockProvider } from 'src/test/mock-providers';
import { FirewallRuleModalComponent } from '../firewall-rule-modal/firewall-rule-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { PreviewModalComponent } from 'src/app/common/preview-modal/preview-modal.component';
import { TableComponent } from 'src/app/common/table/table.component';

describe('FirewallRulesDetailComponent', () => {
  let component: FirewallRulesDetailComponent;
  let fixture: ComponentFixture<FirewallRulesDetailComponent>;

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
        ImportExportComponent,
        MockComponent({ selector: 'app-firewall-rule-modal' }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockTooltipComponent,
        PreviewModalComponent,
        ResolvePipe,
        YesNoModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(DatacenterContextService)],
    });
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
