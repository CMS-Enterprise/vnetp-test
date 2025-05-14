import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRulesModule } from 'src/app/components/firewall-rules/firewall-rules.module';
import { TENANT_V2_ROUTE_DATA } from 'src/app/models/route-data/route-data.types';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'edit/:id',
    pathMatch: 'full',
    data: TENANT_V2_ROUTE_DATA,
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('src/app/components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
    data: TENANT_V2_ROUTE_DATA,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), FirewallRulesModule],
})
export class TenantV2FirewallModule {}
