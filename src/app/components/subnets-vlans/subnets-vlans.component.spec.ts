import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ImportExportComponent } from '../import-export/import-export.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { RouterTestingModule } from '@angular/router/testing';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { SubnetModalComponent } from 'src/app/modals/subnet-modal/subnet-modal.component';
import { VlanModalComponent } from 'src/app/modals/vlan-modal/vlan-modal.component';
import { TierSelectComponent } from '../tier-select/tier-select.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrModule } from 'ngx-toastr';

describe('SubnetsVlansComponent', () => {
  let component: SubnetsVlansComponent;
  let fixture: ComponentFixture<SubnetsVlansComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
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
        TooltipComponent,
        TierSelectComponent,
        YesNoModalComponent,
        ResolvePipe,
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
