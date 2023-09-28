import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { FirewallRulesComponent } from './firewall-rules.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockTabsComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
  MockImportExportComponent,
  MockComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1TiersService, V1NetworkSecurityFirewallRuleGroupsService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';

describe('FirewallRulesComponent', () => {
  let component: FirewallRulesComponent;
  let fixture: ComponentFixture<FirewallRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgxPaginationModule],
      declarations: [
        FilterPipe,
        FirewallRulesComponent,
        MockComponent('app-firewall-rule-modal'),
        MockComponent('app-tier-select'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockImportExportComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(DatacenterContextService),
        MockProvider(TierContextService),
        MockProvider(V1TiersService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FirewallRulesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
