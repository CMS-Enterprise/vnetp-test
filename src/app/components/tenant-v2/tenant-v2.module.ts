import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantV2Component } from './tenant-v2.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { FirewallRulesModule } from '../firewall-rules/firewall-rules.module';
import { BreadcrumbsModule } from 'src/app/common/breadcrumbs/breadcrumbs.module';
import { NavbarModule } from 'src/app/common/navbar/navbar.module';
import { SubnetsVlansModule } from '../subnets-vlans/subnets-vlans.module';
import { TiersModule } from '../tiers/tiers.module';
import { DeployModule } from '../deploy/deploy.module';
import { AuditLogModule } from '../../common/audit-log/audit-log.module';
import { NetworkObjectsGroupsModule } from '../network-objects-groups/network-objects-groups.module';
import { ServiceObjectsGroupsModule } from '../service-objects-groups/service-objects-groups.module';
import { NatRulesModule } from '../nat-rules/nat-rules.module';
import { StaticRoutesModule } from '../static-routes/static-routes.module';
import { LogoutModule } from '../logout/logout.module';
import { UnauthorizedModule } from '../unauthorized/unauthorized.module';
import { LoadBalancersModule } from '../load-balancers/load-balancers.module';
import { TenantV2DashboardModule } from './tenant-v2-dashboard/tenant-v2-dashboard.module';
import { TenantV2DashboardComponent } from './tenant-v2-dashboard/tenant-v2-dashboard.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: TenantV2Component,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        component: TenantV2DashboardComponent,
        data: { title: 'vNETP - Dashboard' },
        loadChildren: () => import('./tenant-v2-dashboard/tenant-v2-dashboard.module').then(m => m.TenantV2DashboardModule),
      },
      {
        path: 'environment-summary',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Environment Summary', title: 'vNETP - Environment Summary' },
        loadChildren: () => import('../../common/environment-summary/environment-summary.module').then(m => m.EnvironmentSummaryModule),
      },
    ],
  },
];

@NgModule({
  declarations: [TenantV2Component, TenantV2DashboardComponent],
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
    TenantV2DashboardModule,
    FontAwesomeModule,
  ],
})
export class TenantV2Module {}
