import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantV2Component } from './tenantv2.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { FirewallRulesModule } from '../../components/firewall-rules/firewall-rules.module';
import { BreadcrumbsModule } from 'src/app/common/breadcrumbs/breadcrumbs.module';
import { NavbarModule } from 'src/app/common/navbar/navbar.module';
import { SubnetsVlansModule } from '../../components/subnets-vlans/subnets-vlans.module';
import { TiersModule } from '../../components/tiers/tiers.module';
import { DeployModule } from '../../components/deploy/deploy.module';
import { AuditLogModule } from '../../common/audit-log/audit-log.module';
import { NetworkObjectsGroupsModule } from '../../components/network-objects-groups/network-objects-groups.module';
import { ServiceObjectsGroupsModule } from '../../components/service-objects-groups/service-objects-groups.module';
import { NatRulesModule } from '../../components/nat-rules/nat-rules.module';
import { StaticRoutesModule } from '../../components/static-routes/static-routes.module';
import { LogoutModule } from '../../components/logout/logout.module';
import { UnauthorizedModule } from '../../components/unauthorized/unauthorized.module';
import { LoadBalancersModule } from '../../components/load-balancers/load-balancers.module';

const routes: Routes = [
  {
    path: '',
    component: TenantV2Component,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { title: 'vNETP - Dashboard' },
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      },
    ],
  },
];

@NgModule({
  declarations: [TenantV2Component],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NavbarModule,
    TiersModule,
    DeployModule,
    SubnetsVlansModule,
    BreadcrumbsModule,
    NetworkObjectsGroupsModule,
    AuditLogModule,
    NatRulesModule,
    ServiceObjectsGroupsModule,
    FirewallRulesModule,
    StaticRoutesModule,
    LogoutModule,
    UnauthorizedModule,
    LoadBalancersModule,
  ],
})
export class TenantV2Module {}
