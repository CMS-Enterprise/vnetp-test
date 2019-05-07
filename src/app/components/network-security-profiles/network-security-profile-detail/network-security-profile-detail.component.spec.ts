import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NetworkSecurityProfileDetailComponent } from './network-security-profile-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PapaParseModule } from 'ngx-papaparse';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { FirewallRule } from 'src/app/models/firewall-rule';

describe('NetworkSecurityProfileDetailComponent', () => {
  let component: NetworkSecurityProfileDetailComponent;
  let fixture: ComponentFixture<NetworkSecurityProfileDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule, FormsModule, RouterTestingModule.withRoutes([]), PapaParseModule,
      NgxSmartModalModule, NgxMaskModule, FormsModule, ReactiveFormsModule],
      declarations: [ NetworkSecurityProfileDetailComponent,
      FirewallRuleModalComponent ],
      providers: [NgxSmartModalService, HttpClient, HttpHandler, CookieService, FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSecurityProfileDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move firewall rule up', () => {
    component.firewall_rules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(-1, component.firewall_rules[2]);

    // Should be moved to index 1
    expect(component.firewall_rules[1].Name === 'Test3').toBeTruthy();
  });

  it('should not move firewall rule at front of array up', () => {
    component.firewall_rules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(-1, component.firewall_rules[0]);

    // Shouldn't move.
    expect(component.firewall_rules[0].Name === 'Test').toBeTruthy();
  });

  it('should not move firewall rule at end of array down', () => {
    component.firewall_rules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(1, component.firewall_rules[2]);

    // Shouldn't move.
    expect(component.firewall_rules[2].Name === 'Test3').toBeTruthy();
  });


  it('should move firewall rule down', () => {
    component.firewall_rules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(1, component.firewall_rules[1]);

    // Should be moved to index 2
    expect(component.firewall_rules[2].Name === 'Test2').toBeTruthy();
  });

  it('should add firewall rule', () => {
    component.addFirewallRule();

    expect(component.firewall_rules.length).toBeTruthy();
  });

  it('should duplicate firewall rule', () => {
    component.firewall_rules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.duplicateFirewallRule(component.firewall_rules[2]);

    expect(component.firewall_rules.length === 4).toBeTruthy();
    expect(component.firewall_rules[2].Name === component.firewall_rules[3].Name).toBeTruthy();
  });

  // TODO: Modal invocation tests and edit tests.

});
