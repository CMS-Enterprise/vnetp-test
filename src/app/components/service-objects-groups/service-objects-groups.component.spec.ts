import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockTabsComponent,
  MockComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import {
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1TiersService,
} from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { FilterPipe } from '../../pipes/filter.pipe';

describe('ServicesObjectsGroupsComponent', () => {
  let component: ServiceObjectsGroupsComponent;
  let fixture: ComponentFixture<ServiceObjectsGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FilterPipe,
        ImportExportComponent,
        MockComponent('app-service-object-group-modal'),
        MockComponent('app-service-object-modal'),
        MockComponent('app-tier-select'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        ServiceObjectsGroupsComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(TierContextService),
        MockProvider(V1TiersService),
        MockProvider(V1NetworkSecurityFirewallRulesService),
        MockProvider(V1NetworkSecurityNatRulesService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        MockProvider(V1NetworkSecurityNatRuleGroupsService),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
