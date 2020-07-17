import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FirewallRulesComponent } from './components/firewall-rules/firewall-rules.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { FirewallRulesDetailComponent } from './components/firewall-rules/firewall-rules-detail/firewall-rules-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { AuthGuard } from './guards/auth.guard';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { StaticRoutesComponent } from './components/static-routes/static-routes.component';
import { StaticRouteDetailComponent } from './components/static-routes/static-route-detail/static-route-detail.component';
import { DeployComponent } from './components/deploy/deploy.component';
import { NetworkObjectsGroupsComponent } from './components/network-objects-groups/network-objects-groups.component';
import { ServiceObjectsGroupsComponent } from './components/service-objects-groups/service-objects-groups.component';
import { LoadBalancersComponent } from './components/load-balancers/load-balancers.component';
import { PhysicalServerComponent } from './components/physical-server/physical-server.component';
import { SubnetsVlansComponent } from './components/subnets-vlans/subnets-vlans.component';
import { TiersComponent } from './components/tiers/tiers.component';
import { VmwareComponent } from './components/vmware/vmware.component';
import { VmwareDetailComponent } from './components/vmware/vmware-detail/vmware-detail.component';
import { ZvmComponent } from './components/zvm/zvm.component';
import { ZosComponent } from './components/zos/zos.component';
import { ApplianceComponent } from './components/appliance/appliance.component';
import { ApplianceDetailComponent } from './components/appliance/appliance-detail/appliance-detail.component';
import { PhysicalServerDetailComponent } from './components/physical-server/physical-server-detail/physical-server-detail.component';
import { WizardComponent } from './components/wizard/wizard.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'subnets-vlans',
    component: SubnetsVlansComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Subnets & VLANs' },
  },
  {
    path: 'tiers',
    component: TiersComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Tiers' },
  },
  {
    path: 'deploy',
    component: DeployComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Deploy' },
  },
  {
    path: 'jobs',
    component: JobsComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Jobs' },
  },
  {
    path: 'network-objects-groups',
    component: NetworkObjectsGroupsComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Network Objects' },
  },
  {
    path: 'service-objects-groups',
    component: ServiceObjectsGroupsComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Service Objects' },
  },
  {
    path: 'firewall-rules',
    component: FirewallRulesComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Firewall Rules' },
  },
  {
    path: 'firewall-rule-group/edit/:id',
    component: FirewallRulesDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Firewall Rule Group' },
  },
  {
    path: 'load-balancers',
    component: LoadBalancersComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Load Balancers' },
  },
  {
    path: 'static-routes',
    component: StaticRoutesComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Static Routes' },
  },
  {
    path: 'static-routes/edit/:id',
    component: StaticRouteDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Edit Static Route' },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'wizard',
    component: WizardComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Wizard' },
  },
  {
    path: 'physical-server',
    component: PhysicalServerComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Physical Servers' },
  },
  {
    path: 'physical-server/:id',
    component: PhysicalServerDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Physical Server Detail' },
  },
  {
    path: 'vmware',
    component: VmwareComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'VMWare' },
  },
  {
    path: 'vmware/:id',
    component: VmwareDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'VMWare Detail' },
  },
  {
    path: 'zvm',
    component: ZvmComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'z/VM' },
  },
  {
    path: 'zos',
    component: ZosComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'z/OS' },
  },
  {
    path: 'appliance',
    component: ApplianceComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Appliance as a Service' },
  },
  {
    path: 'appliance/:id',
    component: ApplianceDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Appliance Detail' },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
