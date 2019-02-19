import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VirtualMachinesComponent } from './virtual-machines/virtual-machines.component';
import { VirtualMachineDetailComponent } from './virtual-machines/virtual-machine-detail/virtual-machine-detail.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateVirtualMachineComponent } from './virtual-machines/create-virtual-machine/create-virtual-machine.component';
import { NetworksComponent } from './networks/networks.component';
import { StorageComponent } from './storage/storage.component';

const routes: Routes = [
  {path: 'projects', component: ProjectsComponent},
  {path: 'projects/:id', component: ProjectDetailComponent},
  {path: 'virtual-machines', component: VirtualMachinesComponent},
  {path: 'virtual-machines/edit/:id', component: VirtualMachineDetailComponent},
  {path: 'virtual-machines/create', component: CreateVirtualMachineComponent},
  {path: 'networks', component: NetworksComponent},
  {path: 'storage', component: StorageComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'login', component:LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
