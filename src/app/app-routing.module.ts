import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FirewallRulesComponent } from './components/firewall-rules/firewall-rules.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { FirewallRulesDetailComponent } from './components/firewall-rules/firewall-rules-detail/firewall-rules-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
// import { AuthGuard } from './guards/auth.guard';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { StaticRoutesComponent } from './components/static-routes/static-routes.component';
import { StaticRouteDetailComponent } from './components/static-routes/static-route-detail/static-route-detail.component';
import { SolarisComponent } from './components/solaris/solaris.component';
import { SolarisCdomCreateComponent } from './components/solaris/solaris-cdom-create/solaris-cdom-create.component';
import { SolarisLdomCreateComponent } from './components/solaris/solaris-ldom-create/solaris-ldom-create.component';
import { SolarisCdomListComponent } from './components/solaris/solaris-cdom-list/solaris-cdom-list.component';
import { DeployComponent } from './components/deploy/deploy.component';
import { NetworkObjectsGroupsComponent } from './components/network-objects-groups/network-objects-groups.component';
import { ServiceObjectsGroupsComponent } from './components/service-objects-groups/service-objects-groups.component';
import { LoadBalancersComponent } from './components/load-balancers/load-balancers.component';
import { SolarisImageRepositoryComponent } from './components/solaris/solaris-image-repository/solaris-image-repository.component';
import { PhysicalServerComponent } from './components/physical-server/physical-server.component';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { LdomListComponent } from './components/solaris/ldom-list/ldom-list.component';
import { LdomDetailComponent } from './components/solaris/ldom-detail/ldom-detail.component';
import { CdomDetailComponent } from './components/solaris/cdom-detail/cdom-detail.component';
import { SubnetsVlansComponent } from './components/subnets-vlans/subnets-vlans.component';
import { TiersComponent } from './components/tiers/tiers.component';
import { NetworkTopologyComponent } from './components/network-topology/network-topology.component';
import { IntraVrfRulesComponent } from './components/firewall-rules/intra-vrf-rules/intra-vrf-rules.component';
import { VmwareComponent } from './components/vmware/vmware.component';
import { VmwareDetailComponent } from './components/vmware/vmware-detail/vmware-detail.component';
import { ZvmComponent } from './components/zvm/zvm.component';
import { ZosComponent } from './components/zos/zos.component';
import { ApplianceComponent } from './components/appliance/appliance.component';
import { ApplianceDetailComponent } from './components/appliance/appliance-detail/appliance-detail.component';
import { PhysicalServerDetailComponent } from './components/physical-server/physical-server-detail/physical-server-detail.component';
import { WizardComponent } from './components/wizard/wizard.component';
import { AuthGuardService } from './services/auth-guard.service';

// tslint:disable: max-line-length

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AuthGuardService] },
  {
    path: 'subnets-vlans',
    component: SubnetsVlansComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Subnets & VLANs' },
  },
  {
    path: 'tiers',
    component: TiersComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Tiers' },
  },
  {
    path: 'deploy',
    component: DeployComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Deploy' },
  },
  {
    path: 'jobs',
    component: JobsComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Jobs' },
  },
  {
    path: 'network-objects-groups',
    component: NetworkObjectsGroupsComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Network Objects' },
  },
  {
    path: 'service-objects-groups',
    component: ServiceObjectsGroupsComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Service Objects' },
  },
  {
    path: 'firewall-rules',
    component: FirewallRulesComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Firewall Rules' },
  },
  {
    path: 'firewall-rule-group/edit/:id',
    component: FirewallRulesDetailComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Firewall Rule Group' },
  },
  {
    path: 'load-balancers',
    component: LoadBalancersComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Load Balancers' },
  },
  {
    path: 'static-routes',
    component: StaticRoutesComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Static Routes' },
  },
  {
    path: 'static-routes/edit/:id',
    component: StaticRouteDetailComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'Edit Static Route' },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'wizard',
    component: WizardComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Wizard' },
  },
  {
    path: 'physical-server',
    component: PhysicalServerComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Physical Servers' },
  },
  {
    path: 'physical-server/:id',
    component: PhysicalServerDetailComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Physical Server Detail' },
  },
  {
    path: 'vmware',
    component: VmwareComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'VMWare' },
  },
  {
    path: 'vmware/:id',
    component: VmwareDetailComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'VMWare Detail' },
  },
  {
    path: 'zvm',
    component: ZvmComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'z/VM' },
  },
  {
    path: 'zos',
    component: ZosComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'z/OS' },
  },
  {
    path: 'appliance',
    component: ApplianceComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Appliance as a Service' },
  },
  {
    path: 'appliance/:id',
    component: ApplianceDetailComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Appliance Detail' },
  },
  {
    path: 'solaris',
    component: SolarisComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Solaris' },
  },
  {
    path: 'solaris/cdom/create',
    component: SolarisCdomCreateComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'CDOM Create' },
  },
  {
    path: 'solaris/ldom/create',
    component: SolarisLdomCreateComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [PendingChangesGuard],
    data: { breadcrumb: 'LDOM Create' },
  },
  {
    path: 'solaris/cdom/list',
    component: SolarisCdomListComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'CDOM List' },
  },
  {
    path: 'solaris/imagerepository',
    component: SolarisImageRepositoryComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'Image Repository' },
  },
  {
    path: 'solaris/ldom/list',
    component: LdomListComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'LDOM List' },
  },
  {
    path: 'solaris/ldom/detail/:id',
    component: LdomDetailComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'LDOM Detail' },
  },
  {
    path: 'solaris/cdom/detail/:id',
    component: CdomDetailComponent,
    canActivate: [AuthGuardService],
    data: { breadcrumb: 'CDOM Detail' },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotfoundComponent, canActivate: [AuthGuardService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
