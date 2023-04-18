import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'self-service',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Managed Network', title: 'Automation - Managed Network' },
    loadChildren: () => import('./components/self-service/self-service.module').then(m => m.SelfServiceModule),
  },
  {
    path: 'subnets-vlans',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Subnets & VLANs', title: 'Automation - Subnets & VLANs' },
    loadChildren: () => import('./components/subnets-vlans/subnets-vlans.module').then(m => m.SubnetsVlansModule),
  },
  {
    path: 'tiers',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Tiers', title: 'Automation - Tiers' },
    loadChildren: () => import('./components/tiers/tiers.module').then(m => m.TiersModule),
  },
  {
    path: 'deploy',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Deploy', title: 'Automation - Deploy' },
    loadChildren: () => import('./components/deploy/deploy.module').then(m => m.DeployModule),
  },
  {
    path: 'jobs',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Jobs', title: 'Automation - Jobs' },
    loadChildren: () => import('./components/jobs/jobs.module').then(m => m.JobsModule),
  },
  {
    path: 'audit-log',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Audit Log', title: 'Automation - Audit Log' },
    loadChildren: () => import('./components/audit-log/audit-log.module').then(m => m.AuditLogModule),
  },
  {
    path: 'network-objects-groups',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Network Objects', title: 'Automation - Network Objects' },
    loadChildren: () => import('./components/network-objects-groups/network-objects-groups.module').then(m => m.NetworkObjectsGroupsModule),
  },
  {
    path: 'service-objects-groups',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Service Objects', title: 'Automation - Service Objects' },
    loadChildren: () => import('./components/service-objects-groups/service-objects-groups.module').then(m => m.ServiceObjectsGroupsModule),
  },
  {
    path: 'firewall-rules',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Firewall Rules', title: 'Automation - Firewall Rules' },
    loadChildren: () => import('./components/firewall-rules/firewall-rules.module').then(m => m.FirewallRulesModule),
  },
  {
    path: 'load-balancers',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Load Balancers', title: 'Automation - Load Balancers' },
    loadChildren: () => import('./components/load-balancers/load-balancers.module').then(m => m.LoadBalancersModule),
  },
  {
    path: 'static-routes',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Static Routes', title: 'Automation - Static Routes' },
    loadChildren: () => import('./components/static-routes/static-routes.module').then(m => m.StaticRoutesModule),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { title: 'Automation - Dashboard' },
    loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'slas',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'SLAs', title: 'Automation - SLAs' },
    loadChildren: () => import('./components/slas/sla.module').then(m => m.SlaModule),
  },
  {
    path: 'nat-rules',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'NAT Rules' },
    loadChildren: () => import('./components/nat-rules/nat-rules.module').then(m => m.NatRulesModule),
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./components/unauthorized/unauthorized.module').then(m => m.UnauthorizedModule),
  },
  {
    path: 'logout',
    loadChildren: () => import('./components/logout/logout.module').then(m => m.LogoutModule),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '**',
    canActivate: [AuthGuard],
    loadChildren: () => import('./components/not-found/not-found.module').then(m => m.NotFoundModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
