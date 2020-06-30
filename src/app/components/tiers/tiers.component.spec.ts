import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ImportExportComponent } from '../import-export/import-export.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { TiersComponent } from './tiers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterTestingModule } from '@angular/router/testing';
import { TierModalComponent } from 'src/app/modals/tier-modal/tier-modal.component';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';

describe('TiersComponent', () => {
  let component: TiersComponent;
  let fixture: ComponentFixture<TiersComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        NgxPaginationModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        TiersComponent,
        TierModalComponent,
        YesNoModalComponent,
        ImportExportComponent,
        MockTooltipComponent,
        ResolvePipe,
        MockFontAwesomeComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, FormBuilder],
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
