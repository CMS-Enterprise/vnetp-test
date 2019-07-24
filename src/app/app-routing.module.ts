import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NetworksComponent } from './components/networks/networks.component';
import { FirewallRulesComponent } from './components/firewall-rules/firewall-rules.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { FirewallRulesDetailComponent } from './components/firewall-rules/firewall-rules-detail/firewall-rules-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { CreateNetworkComponent } from './components/networks/create-network/create-network.component';
import { NetworksDetailComponent } from './components/networks/networks-detail/networks-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { IpaddressesComponent } from './components/ipaddresses/ipaddresses.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { DevicesComponent } from './components/devices/devices.component';
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
import { NetworkInterfacesComponent } from './components/network-interfaces/network-interfaces.component';
import { SolarisImageRepositoryComponent } from './components/solaris/solaris-image-repository/solaris-image-repository.component';
import { PhysicalServerComponent } from './components/systems/physical-server/physical-server.component';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { LdomListComponent } from './components/solaris/ldom-list/ldom-list.component';
import { LdomDetailComponent } from './components/solaris/ldom-detail/ldom-detail.component';
import { CdomDetailComponent } from './components/solaris/cdom-detail/cdom-detail.component';
import { NetworkTopologyComponent } from './components/network-topology/network-topology.component';

// tslint:disable: max-line-length

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'networks', component: NetworksComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Subnets'}},
  {path: 'networks/create', component: CreateNetworkComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Create Subnet'}},
  {path: 'networks/edit/:id', component: NetworksDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Subnet'}},
  {path: 'network-interfaces', component: NetworkInterfacesComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Network Interfaces'}},
  // {path: '666967687420636c7562', component: NetworkTopologyComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Topology'}},
  {path: 'deploy', component: DeployComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Deploy'}},
  {path: 'jobs', component: JobsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Jobs'}},
  {path: 'ipaddresses', component: IpaddressesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'IP Addresses'}},
  {path: 'network-objects-groups', component: NetworkObjectsGroupsComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Network Objects'}},
  {path: 'service-objects-groups', component: ServiceObjectsGroupsComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Service Objects'}},
  {path: 'firewall-rules', component: FirewallRulesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Firewall Rules'}},
  {path: 'firewall-rules/intravrf/edit/:id', component: FirewallRulesDetailComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Subnet Firewall Rules'}},
  {path: 'firewall-rules/intervrf/edit/:id', component: FirewallRulesDetailComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Inter-VRF Firewall Rules'}},
  {path: 'firewall-rules/external/edit/:id', component: FirewallRulesDetailComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'External Firewall Rules'}},
  {path: 'load-balancers', component: LoadBalancersComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Load Balancers'}},
  {path: 'static-routes', component: StaticRoutesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Static Routes'}},
  {path: 'static-routes/edit/:id', component: StaticRouteDetailComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'Edit Static Route'}},
  {path: 'devices', component: DevicesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Devices'}},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'physical-server', component: PhysicalServerComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Physical Servers'}},
  {path: 'solaris', component: SolarisComponent,canActivate: [AuthGuard], data: {breadcrumb: 'Solaris'}},
  {path: 'solaris/cdom/create', component: SolarisCdomCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'CDOM Create'}},
  {path: 'solaris/ldom/create', component: SolarisLdomCreateComponent, canActivate: [AuthGuard], canDeactivate: [PendingChangesGuard], data: {breadcrumb: 'LDOM Create'}},
  {path: 'solaris/cdom/list', component: SolarisCdomListComponent, canActivate: [AuthGuard], data: {breadcrumb: 'CDOM List'}},
  {path: 'solaris/imagerepository', component: SolarisImageRepositoryComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Image Repository'}},
  {path: 'solaris/ldom/list', component: LdomListComponent, canActivate: [AuthGuard], data: {breadcrumb: 'LDOM List'}},
  {path: 'solaris/ldom/detail/:id', component: LdomDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'LDOM Detail'}},
  {path: 'solaris/cdom/detail/:id', component: CdomDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'CDOM Detail'}},
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: '**', component: NotfoundComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
