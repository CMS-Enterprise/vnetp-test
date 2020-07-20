import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NatRulesLandingComponent } from './components/nat-rules-landing/nat-rules-landing.component';
import { NatRuleListComponent } from './components/nat-rule-list/nat-rule-list.component';
import { NatRuleGroupListComponent } from './components/nat-rule-group-list/nat-rule-group-list.component';

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
