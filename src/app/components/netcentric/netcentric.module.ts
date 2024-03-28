import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetcentricComponent } from './netcentric.component';
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
import { ChangeRequestModalModule } from '../change-request-modal/change-request-modal.module';

const routes: Routes = [
  {
    path: '',
    component: NetcentricComponent,
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { title: 'Automation - Dashboard' },
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'subnets-vlans',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Subnets & VLANs', title: 'Automation - Subnets & VLANs' },
        loadChildren: () => import('../../components/subnets-vlans/subnets-vlans.module').then(m => m.SubnetsVlansModule),
      },
      {
        path: 'tiers',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Tiers', title: 'Automation - Tiers' },
        loadChildren: () => import('../../components/tiers/tiers.module').then(m => m.TiersModule),
      },
      {
        path: 'deploy',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Deploy', title: 'Automation - Deploy' },
        loadChildren: () => import('../../components/deploy/deploy.module').then(m => m.DeployModule),
      },
      {
        path: 'jobs',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Jobs', title: 'Automation - Jobs' },
        loadChildren: () => import('../../components/jobs/jobs.module').then(m => m.JobsModule),
      },
      {
        path: 'audit-log',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Audit Log', title: 'Automation - Audit Log' },
        loadChildren: () => import('../../common/audit-log/audit-log.module').then(m => m.AuditLogModule),
      },
      {
        path: 'network-objects-groups',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Network Objects', title: 'Automation - Network Objects' },
        loadChildren: () =>
          import('../../components/network-objects-groups/network-objects-groups.module').then(m => m.NetworkObjectsGroupsModule),
      },
      {
        path: 'service-objects-groups',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Service Objects', title: 'Automation - Service Objects' },
        loadChildren: () =>
          import('../../components/service-objects-groups/service-objects-groups.module').then(m => m.ServiceObjectsGroupsModule),
      },
      {
        path: 'firewall-rules',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Firewall Rules', title: 'Automation - Firewall Rules' },
        loadChildren: () => import('../../components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
      },
      {
        path: 'nat-rules',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'NAT Rules' },
        loadChildren: () => import('../../components/nat-rules/nat-rules.module').then(m => m.NatRulesModule),
      },
      {
        path: 'static-routes',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Static Routes', title: 'Automation - Static Routes' },
        loadChildren: () => import('../../components/static-routes/static-routes.module').then(m => m.StaticRoutesModule),
      },
      {
        path: 'self-service',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Managed Network', title: 'Automation - Managed Network' },
        loadChildren: () => import('../../components/self-service/self-service.module').then(m => m.SelfServiceModule),
      },
      {
        path: 'logout',
        loadChildren: () => import('../../components/logout/logout.module').then(m => m.LogoutModule),
      },
      {
        path: 'unauthorized',
        loadChildren: () => import('../../components/unauthorized/unauthorized.module').then(m => m.UnauthorizedModule),
      },
      {
        path: 'load-balancers',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Load Balancers', title: 'Automation - Load Balancers' },
        loadChildren: () => import('../../components/load-balancers/load-balancers.module').then(m => m.LoadBalancersModule),
      },
      {
        path: 'environment-summary',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Environment Summary', title: 'Automation - Environment Summary' },
        loadChildren: () => import('../../common/environment-summary/environment-summary.module').then(m => m.EnvironmentSummaryModule),
      },
    ],
  },
];

@NgModule({
  declarations: [NetcentricComponent],
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
    ChangeRequestModalModule,
  ],
})
export class NetcentricModule {}
