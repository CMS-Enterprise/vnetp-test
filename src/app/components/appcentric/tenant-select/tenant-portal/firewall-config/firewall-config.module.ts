import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirewallConfigResolver } from './firewall-config.resolver';
import { FirewallConfigSummaryComponent } from './firewall-config-summary.component';
import { FirewallConfigComponent } from './firewall-config.component';

const routes: Routes = [
  {
    path: ':firewallType/:firewallId',
    component: FirewallConfigComponent,
    children: [
      {
        path: '',
        resolve: { firewall: FirewallConfigResolver },
        component: FirewallConfigSummaryComponent,
      },
      {
        path: 'rules',
        resolve: { firewall: FirewallConfigResolver },
        loadChildren: () => import('src/app/components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
      },
      {
        path: 'nat',
        resolve: { firewall: FirewallConfigResolver },
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
  declarations: [FirewallConfigSummaryComponent, FirewallConfigComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FirewallConfigModule {}
