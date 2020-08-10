import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockIconButtonComponent, MockTabsComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockProvider } from 'src/test/mock-providers';
import { ServiceObjectModalComponent } from './service-object-modal/service-object-modal.component';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal/service-object-group-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { TierSelectComponent } from 'src/app/common/tier-select/tier-select.component';
import { ToastrService } from 'ngx-toastr';

describe('ServicesObjectsGroupsComponent', () => {
  let component: ServiceObjectsGroupsComponent;
  let fixture: ComponentFixture<ServiceObjectsGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        NgxPaginationModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        ServiceObjectsGroupsComponent,
        ServiceObjectModalComponent,
        ServiceObjectGroupModalComponent,
        ImportExportComponent,
        YesNoModalComponent,
        MockTooltipComponent,
        TierSelectComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockTabsComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(ToastrService), CookieService, FormBuilder],
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
