import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
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
  // {
  //   path: 'callback',
  //   data: { title: 'Automation - Dashboard' },
  //   loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule),
  // },
  {
    path: 'wizard',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Wizard', title: 'Automation - Wizard' },
    loadChildren: () => import('./components/wizard/wizard.module').then(m => m.WizardModule),
  },
  {
    path: 'physical-server',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Physical Servers', title: 'Automation - Physical Servers' },
    loadChildren: () => import('./components/physical-server/physical-server.module').then(m => m.PhysicalServerModule),
  },
  {
    path: 'vmware',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'VMWare', title: 'Automation - VMWare' },
    loadChildren: () => import('./components/vmware/vmware.module').then(m => m.VmwareModule),
  },
  {
    path: 'virtual-machines',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Virtual Machines', title: 'Automation - Virtual Machines' },
    loadChildren: () => import('./components/virtual-machines/virtual-machines.module').then(m => m.VirtualMachinesModule),
  },
  {
    path: 'application-groups',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Application Groups', title: 'Automation - Application Groups' },
    loadChildren: () => import('./components/application-groups/application-groups.module').then(m => m.ApplicationGroupModule),
  },
  {
    path: 'slas',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'SLAs', title: 'Automation - SLAs' },
    loadChildren: () => import('./components/slas/sla.module').then(m => m.SlaModule),
  },
  {
    path: 'zvm',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'z/VM', title: 'Automation - z/VM' },
    loadChildren: () => import('./components/zvm/zvm.module').then(m => m.ZvmModule),
  },
  {
    path: 'zos',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'z/OS', title: 'Automation - z/OS' },
    loadChildren: () => import('./components/zos/zos.module').then(m => m.ZosModule),
  },
  {
    path: 'appliance',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Appliance as a Service', title: 'Automation - Appliance as a Service' },
    loadChildren: () => import('./components/appliance/appliance.module').then(m => m.ApplianceModule),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'callback',
    loadChildren: () => import('./components/tenant/tenant.module').then(m => m.TenantModule),
  },
  {
    path: 'tenant',
    loadChildren: () => import('./components/tenant/tenant.module').then(m => m.TenantModule),
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./components/unauthorized/unauthorized.module').then(m => m.UnauthorizedModule),
  },
  {
    path: 'logout',
    loadChildren: () => import('./components/logout/logout.module').then(m => m.LogoutModule),
  },
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
