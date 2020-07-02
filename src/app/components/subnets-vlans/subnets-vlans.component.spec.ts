import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { TierSelectComponent } from '../tier-select/tier-select.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { SubnetModalComponent } from './subnet-modal/subnet-modal.component';
import { VlanModalComponent } from './vlan-modal/vlan-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('SubnetsVlansComponent', () => {
  let component: SubnetsVlansComponent;
  let fixture: ComponentFixture<SubnetsVlansComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        NgxPaginationModule,
        NgSelectModule,
        ToastrModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        SubnetsVlansComponent,
        SubnetModalComponent,
        VlanModalComponent,
        ImportExportComponent,
        MockTooltipComponent,
        TierSelectComponent,
        YesNoModalComponent,
        ResolvePipe,
        MockFontAwesomeComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, FormBuilder],
    }).compileComponents();
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
