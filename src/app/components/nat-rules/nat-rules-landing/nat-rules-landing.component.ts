import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-nat-rules-landing',
  templateUrl: './nat-rules-landing.component.html',
})
export class NatRulesLandingComponent implements OnInit {
  public routes: NatRuleRoute[] = [
    { link: './', name: NatRuleRouteName.NatRules, helpText: 'todo' },
    { link: './groups', name: NatRuleRouteName.NatRuleGroups, helpText: 'todo' },
  ];
  public selectedRouteName = this.routes[0].name;

  constructor(private router: Router) {}

  public ngOnInit(): void {
    if (this.router.url === '/nat-rules/groups') {
      this.selectedRouteName = this.routes[1].name;
    }
  }
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
