import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirewallConfigResolver } from './firewall-config.resolver';
import { FirewallConfigComponent } from './firewall-config.component';
import { FirewallConfigRuleGroupsComponent } from './firewall-config-rule-groups.component';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

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
        path: 'rules/edit/:id',
        loadChildren: () => import('src/app/components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
      },
      {
        path: 'nat',
        resolve: { firewall: FirewallConfigResolver },
        data: { ruleGroupType: 'nat' },
        component: FirewallConfigRuleGroupsComponent,
      },
      {
        path: 'nat/edit/:id',
        loadChildren: () => import('src/app/components/nat-rules/nat-rules.module').then(m => m.NatRulesModule),
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
  imports: [CommonModule, RouterModule.forChild(routes), TableModule, IconButtonModule],
  exports: [RouterModule],
})
export class FirewallConfigModule {}
