import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirewallConfigResolver } from './firewall-config.resolver';
import { FirewallConfigComponent } from './firewall-config.component';
import { FirewallConfigRuleGroupsComponent } from './firewall-config-rule-groups.component';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { FirewallRulesModule } from 'src/app/components/firewall-rules/firewall-rules.module';
import { FirewallRulesDetailComponent } from '../../../../firewall-rules/firewall-rules-detail/firewall-rules-detail.component';
import { NatRulesModule } from 'src/app/components/nat-rules/nat-rules.module';
import { NatRulesDetailComponent } from '../../../../nat-rules/nat-rules-detail/nat-rules-detail.component';
const routes: Routes = [
  {
    path: ':firewallType/:firewallId',
    component: FirewallConfigComponent,
    children: [
      {
        path: '',
        redirectTo: 'rules',
        pathMatch: 'full',
      },
      {
        path: 'rules',
        resolve: { firewall: FirewallConfigResolver },
        data: { ruleGroupType: 'firewall' },
        component: FirewallConfigRuleGroupsComponent,
      },
      {
        path: 'rules/edit/:firewallRuleGroupId',
        component: FirewallRulesDetailComponent,
      },
      {
        path: 'nat',
        resolve: { firewall: FirewallConfigResolver },
        data: { ruleGroupType: 'nat' },
        component: FirewallConfigRuleGroupsComponent,
      },
      {
        path: 'nat/edit/:id',
        component: NatRulesDetailComponent,
      },
      {
        path: 'network-objects',
        resolve: { firewall: FirewallConfigResolver },
        loadChildren: () =>
          import('src/app/components/network-objects-groups/network-objects-groups.module').then(m => m.NetworkObjectsGroupsModule),
      },
      {
        path: 'service-objects',
        resolve: { firewall: FirewallConfigResolver },
        loadChildren: () =>
          import('src/app/components/service-objects-groups/service-objects-groups.module').then(m => m.ServiceObjectsGroupsModule),
      },
    ],
  },
];

@NgModule({
  declarations: [FirewallConfigComponent, FirewallConfigRuleGroupsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), TableModule, IconButtonModule, FirewallRulesModule, NatRulesModule],
  exports: [RouterModule, FirewallConfigComponent],
})
export class FirewallConfigModule {}
