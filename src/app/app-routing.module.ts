import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/projects/project-detail/project-detail.component';
import { VirtualMachinesComponent } from './components/virtual-machines/virtual-machines.component';
import { VirtualMachineDetailComponent } from './components/virtual-machines/virtual-machine-detail/virtual-machine-detail.component';
import { CreateVirtualMachineComponent } from './components/virtual-machines/create-virtual-machine/create-virtual-machine.component';
import { NetworksComponent } from './components/networks/networks.component';
import { NetworkSecurityProfilesComponent } from './components/networks/network-security-profiles/network-security-profiles.component';
import { StorageComponent } from './components/storage/storage.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';


const routes: Routes = [
  {path: 'projects', component: ProjectsComponent},
  {path: 'projects/:id', component: ProjectDetailComponent},
  {path: 'virtual-machines', component: VirtualMachinesComponent},
  {path: 'virtual-machines/edit/:id', component: VirtualMachineDetailComponent},
  {path: 'virtual-machines/create', component: CreateVirtualMachineComponent},
  {path: 'networks', component: NetworksComponent},
  {path: 'networks/network-security-profiles', component: NetworkSecurityProfilesComponent},
  {path: 'storage', component: StorageComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'login', component:LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
