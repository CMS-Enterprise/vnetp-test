import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirewallRulesComponent } from './firewall-rules.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HttpHandler, HttpClient, HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PapaParseModule } from 'ngx-papaparse';
import { NgxMaskModule } from 'ngx-mask';
import { RouterTestingModule } from '@angular/router/testing';
import { TooltipComponent } from '../tooltip/tooltip.component';

describe('FirewallRulesComponent', () => {
  let component: FirewallRulesComponent;
  let fixture: ComponentFixture<FirewallRulesComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule,
      NgxSmartModalModule,
      NgxMaskModule.forRoot(),
      PapaParseModule,
      FormsModule,
      ReactiveFormsModule,
      RouterTestingModule],
      declarations: [ 
        FirewallRulesComponent,
        FirewallRuleModalComponent, TooltipComponent ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx}, HttpClientModule, HttpClient, HttpHandler, CookieService, FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
