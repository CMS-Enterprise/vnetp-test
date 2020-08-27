import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent, MockTooltipComponent, MockIconButtonComponent, MockComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TiersComponent } from './tiers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1TiersService, V1TierGroupsService } from 'api_client';

describe('TiersComponent', () => {
  let component: TiersComponent;
  let fixture: ComponentFixture<TiersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxSmartModalModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ImportExportComponent,
        MockComponent({ selector: 'app-tier-modal' }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockTooltipComponent,
        ResolvePipe,
        TiersComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1TierGroupsService),
        MockProvider(V1TiersService),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiersComponent);
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
