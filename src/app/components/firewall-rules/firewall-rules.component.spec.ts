import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallRulesComponent } from './firewall-rules.component';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from '../import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';

describe('FirewallRulesComponent', () => {
  let component: FirewallRulesComponent;
  let fixture: ComponentFixture<FirewallRulesComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        NgxPaginationModule,
      ],
      declarations: [
        FirewallRulesComponent,
        FirewallRuleModalComponent,
        MockTooltipComponent,
        FilterPipe,
        ImportExportComponent,
        YesNoModalComponent,
        MockFontAwesomeComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, FormBuilder],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesComponent);
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
