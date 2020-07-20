import { Component } from '@angular/core';

@Component({
  selector: 'app-nat-rules-landing',
  templateUrl: './nat-rules-landing.component.html',
})
export class NatRulesLandingComponent {
  public routes: NatRuleRoute[] = [
    { link: './', name: NatRuleRouteName.NatRules, helpText: 'todo' },
    { link: './groups', name: NatRuleRouteName.NatRuleGroups, helpText: 'todo' },
  ];
  public selectedRouteName = this.routes[0].name;
}

enum NatRuleRouteName {
  NatRules = 'NAT Rules',
  NatRuleGroups = 'NAT Rule Groups',
}

interface NatRuleRoute {
  link: string;
  name: NatRuleRouteName;
  helpText: string;
}
