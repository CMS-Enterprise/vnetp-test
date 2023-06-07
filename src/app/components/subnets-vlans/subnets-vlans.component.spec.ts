import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';
import { V1TiersService, V1NetworkVlansService, V1NetworkSubnetsService } from 'client';

describe('SubnetsVlansComponent', () => {
  let component: SubnetsVlansComponent;
  let fixture: ComponentFixture<SubnetsVlansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ImportExportComponent,
        MockComponent('app-subnet-modal'),
        MockComponent('app-tier-select'),
        MockComponent('app-vlan-modal'),
        MockComponent({ selector: 'app-table', inputs: ['objectType', 'config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        ResolvePipe,
        SubnetsVlansComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(SubnetsVlansHelpText),
        MockProvider(TierContextService),
        MockProvider(V1NetworkSubnetsService),
        MockProvider(V1NetworkVlansService),
        MockProvider(V1TiersService),
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubnetsVlansComponent);
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
