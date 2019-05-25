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
import { DeployComponent } from './components/deploy/deploy.component';
import { NetworkObjectsGroupsComponent } from './components/network-objects-groups/network-objects-groups.component';
import { ServiceObjectsGroupsComponent } from './components/service-objects-groups/service-objects-groups.component';
import { LoadBalancersComponent } from './components/load-balancers/load-balancers.component';
import { NetworkInterfacesComponent } from './components/network-interfaces/network-interfaces.component';


const routes: Routes = [
  {path: 'networks', component: NetworksComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Subnets'}},
  {path: 'networks/create', component: CreateNetworkComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Create Subnet'}},
  {path: 'networks/edit/:id', component: NetworksDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Subnet'}},
  {path: 'network-interfaces', component: NetworkInterfacesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Interfaces'}},
  {path: 'deploy', component: DeployComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Deploy'}},
  {path: 'jobs', component: JobsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Jobs'}},
  {path: 'ipaddresses', component: IpaddressesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'IP Addresses'}},
  {path: 'network-objects-groups', component: NetworkObjectsGroupsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Objects'}},
  {path: 'service-objects-groups', component: ServiceObjectsGroupsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Service Objects'}},
  {path: 'firewall-rules', component: FirewallRulesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Firewall Rules'}},
  {path: 'firewall-rules/edit/:id', component: FirewallRulesDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Firewall Rules Detail'}},
  {path: 'load-balancers', component: LoadBalancersComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Load Balancers'}},
  {path: 'static-routes', component: StaticRoutesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Static Routes'}},
  {path: 'static-routes/edit/:id', component: StaticRouteDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Edit Static Route'}},
  {path: 'devices', component: DevicesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Devices'}},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: '**', component: NotfoundComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
