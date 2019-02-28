import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {FormsModule } from '@angular/forms';
import {AngularFontAwesomeModule} from 'angular-font-awesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VirtualMachinesComponent } from './components/virtual-machines/virtual-machines.component';
import { VirtualMachineDetailComponent } from './components/virtual-machines/virtual-machine-detail/virtual-machine-detail.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectDetailComponent } from './components/projects/project-detail/project-detail.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { CreateVirtualMachineComponent } from './components/virtual-machines/create-virtual-machine/create-virtual-machine.component';
import { NetworksComponent } from './components/networks/networks.component';
import { NetworksDetailComponent } from './components/networks/networks-detail/networks-detail.component';
import { NetworkSecurityProfilesComponent } from './components/networks/network-security-profiles/network-security-profiles.component';
import { HttpConfigInterceptor } from './interceptors/httpconfig.interceptor';
import { LoadBalancersComponent } from './components/load-balancers/load-balancers.component';
import { NetworkSecurityProfileDetailComponent } from './components/networks/network-security-profiles/network-security-profile-detail/network-security-profile-detail.component';
import { EditLoadBalancerComponent } from './components/load-balancers/edit-load-balancer/edit-load-balancer.component';

@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    ProjectDetailComponent,
    DashboardComponent,
    LoginComponent,
    NetworksComponent,
    NetworksDetailComponent,
    NetworkSecurityProfilesComponent,
    VirtualMachinesComponent,
    VirtualMachineDetailComponent,
    CreateVirtualMachineComponent,
    LoadBalancersComponent,
    NetworkSecurityProfileDetailComponent,
    EditLoadBalancerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
