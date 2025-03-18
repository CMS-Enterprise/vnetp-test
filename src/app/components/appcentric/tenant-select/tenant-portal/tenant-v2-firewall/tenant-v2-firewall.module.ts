import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRulesModule } from 'src/app/components/firewall-rules/firewall-rules.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'edit/:id',
    pathMatch: 'full',
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('src/app/components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('src/app/components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FirewallRulesModule],
})
export class TenantV2FirewallModule {}
