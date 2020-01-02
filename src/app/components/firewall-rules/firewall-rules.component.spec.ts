import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirewallRulesComponent } from './firewall-rules.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PapaParseModule } from 'ngx-papaparse';
import { NgxMaskModule } from 'ngx-mask';
import { RouterTestingModule } from '@angular/router/testing';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { FilterPipe } from 'src/app/pipes/filter.pipe';

describe('FirewallRulesComponent', () => {
  let component: FirewallRulesComponent;
  let fixture: ComponentFixture<FirewallRulesComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        PapaParseModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      declarations: [
        FirewallRulesComponent,
        FirewallRuleModalComponent,
        TooltipComponent,
        FilterPipe,
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        CookieService,
        FormBuilder,
      ],
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
