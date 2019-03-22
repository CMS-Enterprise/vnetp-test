import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NetworksComponent } from './components/networks/networks.component';
import { NetworkSecurityProfilesComponent } from './components/networks/network-security-profiles/network-security-profiles.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NetworkSecurityProfileDetailComponent } from './components/networks/network-security-profiles/network-security-profile-detail/network-security-profile-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { CreateNetworkComponent } from './components/networks/create-network/create-network.component';
import { NetworksDetailComponent } from './components/networks/networks-detail/networks-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { IpaddressesComponent } from './components/networks/ipaddresses/ipaddresses.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { DevicesComponent } from './components/devices/devices.component';


const routes: Routes = [
  {path: 'networks', component: NetworksComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Networks'}},
  {path: 'networks/create', component: CreateNetworkComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Networks'}},
  {path: 'networks/edit/:id', component: NetworksDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Networks'}},
  {path: 'jobs', component: JobsComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Jobs'}},
  {path: 'networks/ipaddresses', component: IpaddressesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'IP Addresses'}},
  {path: 'networks/network-security-profiles', component: NetworkSecurityProfilesComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Security'}},
  {path: 'networks/network-security-profiles/edit/:id', component: NetworkSecurityProfileDetailComponent, canActivate: [AuthGuard], data: {breadcrumb: 'Network Security'}},
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
