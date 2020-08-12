import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent, MockTooltipComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TiersComponent } from './tiers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { TierModalComponent } from './tier-modal/tier-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';

describe('TiersComponent', () => {
  let component: TiersComponent;
  let fixture: ComponentFixture<TiersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
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
        MockIconButtonComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), CookieService, FormBuilder],
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
