import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { FirewallRulesDetailComponent } from './firewall-rules-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PapaParseModule } from 'ngx-papaparse';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { FirewallRule } from 'src/app/models/firewall/firewall-rule';
import { Subnet } from 'src/app/models/d42/subnet';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('FirewallRulesDetailComponent', () => {
  let component: FirewallRulesDetailComponent;
  let fixture: ComponentFixture<FirewallRulesDetailComponent>;
  let router: Router;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule, FormsModule, RouterTestingModule.withRoutes([]), PapaParseModule,
      NgxSmartModalModule, NgxMaskModule, FormsModule, ReactiveFormsModule],
      declarations: [ FirewallRulesDetailComponent,
      FirewallRuleModalComponent ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, HttpClient, HttpHandler, CookieService, FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set set subscription and modal mode on create', () => {
    component.subnet = {name: 'Test', vrf_group_id: 101} as Subnet;

    component.createFirewallRule();

    expect(component.firewallRuleModalSubscription).toBeTruthy();
    expect(component.firewallRuleModalMode === ModalMode.Create).toBeTruthy();
  });

  it('should set subscription, modal mode and index on edit', () => {
    component.subnet = {name: 'Test', vrf_group_id: 102} as Subnet;
    component.firewallRules = [{Name: 'TestRule'}] as Array<FirewallRule>;

    component.editFirewallRule(component.firewallRules[0]);

    expect(component.firewallRuleModalSubscription).toBeTruthy();
    expect(component.firewallRuleModalMode === ModalMode.Edit).toBeTruthy();
    expect(component.editFirewallRuleIndex === 0).toBeTruthy();
  });

  it('should move firewall rule up', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(-1, component.firewallRules[2]);

    // Should be moved to index 1
    expect(component.firewallRules[1].Name === 'Test3').toBeTruthy();
  });

  it('should not move firewall rule at front of array up', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(-1, component.firewallRules[0]);

    // Shouldn't move.
    expect(component.firewallRules[0].Name === 'Test').toBeTruthy();
  });

  it('should not move firewall rule at end of array down', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(1, component.firewallRules[2]);

    // Shouldn't move.
    expect(component.firewallRules[2].Name === 'Test3').toBeTruthy();
  });


  it('should move firewall rule down', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.moveFirewallRule(1, component.firewallRules[1]);

    // Should be moved to index 2
    expect(component.firewallRules[2].Name === 'Test2').toBeTruthy();
  });

  it('should duplicate firewall rule', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.duplicateFirewallRule(component.firewallRules[2]);

    expect(component.firewallRules.length === 4).toBeTruthy();
    expect(component.firewallRules[2].Name === component.firewallRules[3].Name).toBeTruthy();
  });

  it('should delete firewall rule', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.deleteFirewallRule(component.firewallRules[0]);

    // Should be deleted and new member should be in index 0.
    expect(component.firewallRules[0].Name === 'Test2').toBeTruthy();
    expect(component.firewallRules.length === 2).toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should not delete if firewall rule does not exist', () => {
    component.firewallRules = [{ Name: 'Test'} as FirewallRule, { Name: 'Test2'} as FirewallRule
    , { Name: 'Test3'} as FirewallRule];

    component.deleteFirewallRule(component.firewallRules[3]);

    expect(component.firewallRules.length === 3).toBeTruthy();
    expect(component.dirty).toBeFalsy();
  });

  // TODO: Modal invocation tests and edit tests.

});
