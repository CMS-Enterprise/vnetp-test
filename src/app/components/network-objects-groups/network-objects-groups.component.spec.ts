import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockIconButtonComponent, MockTabsComponent } from 'src/test/mock-components';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { NetworkObjectModalComponent } from './network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal/network-object-group-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { TierSelectComponent } from 'src/app/common/tier-select/tier-select.component';

describe('NetworkObjectsGroupsComponent', () => {
  let component: NetworkObjectsGroupsComponent;
  let fixture: ComponentFixture<NetworkObjectsGroupsComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        NgxMaskModule,
        NgxPaginationModule,
        NgSelectModule,
        ToastrModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        NetworkObjectsGroupsComponent,
        NetworkObjectModalComponent,
        NetworkObjectGroupModalComponent,
        YesNoModalComponent,
        TierSelectComponent,
        MockTooltipComponent,
        ImportExportComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockTabsComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, FormBuilder],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectsGroupsComponent);
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
