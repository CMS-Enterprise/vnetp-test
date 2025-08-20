import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockTooltipComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TiersComponent } from './tiers.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { of } from 'rxjs';
import {
  V1TiersService,
  V1TierGroupsService,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
} from 'client';

describe('TiersComponent', () => {
  let component: TiersComponent;
  let fixture: ComponentFixture<TiersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxSmartModalModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent('app-tier-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({ selector: 'app-type-delete-modal', inputs: ['objectToDelete', 'objectType'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
        ResolvePipe,
        TiersComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1TierGroupsService, { getManyTierGroup: () => of([]) }),
        MockProvider(V1TiersService, { getManyTier: () => of([]) }),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        MockProvider(V1NetworkSecurityNatRuleGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
