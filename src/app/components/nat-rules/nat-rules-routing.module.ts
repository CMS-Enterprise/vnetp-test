import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NatRuleGroupListComponent } from './nat-rule-group-list/nat-rule-group-list.component';
import { NatRuleListComponent } from './nat-rule-list/nat-rule-list.component';
import { NatRulesLandingComponent } from './nat-rules-landing/nat-rules-landing.component';

const routes: Routes = [
  {
    path: '',
    component: NatRulesLandingComponent,
    children: [
      { path: '', component: NatRuleListComponent },
      { path: 'groups', component: NatRuleGroupListComponent },
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NatRulesRoutingModule {}
