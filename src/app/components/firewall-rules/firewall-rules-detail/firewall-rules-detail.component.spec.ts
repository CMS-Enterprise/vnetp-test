import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallRulesDetailComponent } from './firewall-rules-detail.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { PreviewModalComponent } from 'src/app/common/preview-modal/preview-modal.component';
import {
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1TiersService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
} from 'client';

describe('FirewallRulesDetailComponent', () => {
  let component: FirewallRulesDetailComponent;
  let fixture: ComponentFixture<FirewallRulesDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxPaginationModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FirewallRulesDetailComponent,
        ImportExportComponent,
        MockComponent('app-firewall-rule-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        PreviewModalComponent,
        ResolvePipe,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        MockProvider(V1NetworkSecurityFirewallRulesService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1TiersService),
      ],
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
