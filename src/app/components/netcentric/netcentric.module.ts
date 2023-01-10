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
import { AuditLogModule } from '../../components/audit-log/audit-log.module';
import { NetworkObjectsGroupsModule } from '../../components/network-objects-groups/network-objects-groups.module';
import { ServiceObjectsGroupsModule } from '../../components/service-objects-groups/service-objects-groups.module';
import { NatRulesModule } from '../../components/nat-rules/nat-rules.module';
import { StaticRoutesModule } from '../../components/static-routes/static-routes.module';
import { ApplicationGroupModule } from '../../components/application-groups/application-groups.module';
import { SlaModule } from '../../components/slas/sla.module';
import { RecoveryPlanModule } from '../recovery-plans/recovery-plans.module';
import { LogoutModule } from '../../components/logout/logout.module';
import { UnauthorizedModule } from '../../components/unauthorized/unauthorized.module';
import { LoadBalancersModule } from '../../components/load-balancers/load-balancers.module';

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
        loadChildren: () => import('../../components/audit-log/audit-log.module').then(m => m.AuditLogModule),
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
        path: 'application-groups',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Application Groups', title: 'Automation - Application Groups' },
        loadChildren: () => import('../../components/application-groups/application-groups.module').then(m => m.ApplicationGroupModule),
      },
      {
        path: 'slas',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'SLAs', title: 'Automation - SLAs' },
        loadChildren: () => import('../../components/slas/sla.module').then(m => m.SlaModule),
      },
      {
        path: 'recovery-plans',
        canActivate: [AuthGuard],
        data: { breadcrumb: 'Recovery Plans', title: 'Automation - Recovery Plans' },
        loadChildren: () => import('../../components/recovery-plans/recovery-plans.module').then(m => m.RecoveryPlanModule),
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
    ApplicationGroupModule,
    SlaModule,
    RecoveryPlanModule,
    LogoutModule,
    UnauthorizedModule,
    LoadBalancersModule,
  ],
})
export class NetcentricModule {}
