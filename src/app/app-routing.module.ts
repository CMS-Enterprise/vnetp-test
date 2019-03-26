import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NetworksComponent } from './components/networks/networks.component';
import { NetworkSecurityProfilesComponent } from './components//network-security-profiles/network-security-profiles.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NetworkSecurityProfileDetailComponent } from './components/network-security-profiles/network-security-profile-detail/network-security-profile-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { CreateNetworkComponent } from './components/networks/create-network/create-network.component';
import { NetworksDetailComponent } from './components/networks/networks-detail/networks-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { IpaddressesComponent } from './components/ipaddresses/ipaddresses.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { DevicesComponent } from './components/devices/devices.component';
import { StaticRoutesComponent } from './components/static-routes/static-routes.component';
import { StaticRouteDetailComponent } from './components/static-routes/static-route-detail/static-route-detail.component';
import { IpNatsComponent } from './components/ip-nats/ip-nats.component';
import { IpNatDetailComponent } from './components/ip-nats/ip-nat-detail/ip-nat-detail.component';


const routes: Routes = [
  {path: 'networks', component: NetworksComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Networks'}},
  {path: 'networks/create', component: CreateNetworkComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Networks'}},
  {path: 'networks/edit/:id', component: NetworksDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Networks'}},
  {path: 'jobs', component: JobsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Jobs'}},
  {path: 'ipaddresses', component: IpaddressesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'IP Addresses'}},
  {path: 'network-security-profiles', component: NetworkSecurityProfilesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Security'}},
  {path: 'network-security-profiles/edit/:id', component: NetworkSecurityProfileDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Security'}},
  {path: 'static-routes', component: StaticRoutesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Static Routes'}},
  {path: 'static-routes/edit/:id', component: StaticRouteDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Edit Static Route'}},
  {path: 'ip-nats', component: IpNatsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'IP Network Address Translation'}},
  {path: 'ip-nats/edit/:id', component: IpNatDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Edit Network Address Translation'}},
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
