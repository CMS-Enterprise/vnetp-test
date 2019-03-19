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


const routes: Routes = [
  {path: 'networks', component: NetworksComponent},
  {path: 'networks/create', component: CreateNetworkComponent},
  {path: 'networks/edit/:id', component: NetworksDetailComponent},
  {path: 'jobs', component: JobsComponent},
  {path: 'networks/network-security-profiles', component: NetworkSecurityProfilesComponent},
  {path: 'networks/network-security-profiles/edit/:id', component: NetworkSecurityProfileDetailComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
