import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule } from '@angular/common/http';
import {FormsModule } from '@angular/forms';

import {AngularFontAwesomeModule} from 'angular-font-awesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VirtualMachinesComponent } from './virtual-machines/virtual-machines.component';
import { VirtualMachineDetailComponent } from './virtual-machines/virtual-machine-detail/virtual-machine-detail.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { CreateVirtualMachineComponent } from './virtual-machines/create-virtual-machine/create-virtual-machine.component';
import { StorageComponent } from './storage/storage.component';
import { StorageDetailComponent } from './storage/storage-detail/storage-detail.component';
import { NetworksComponent } from './networks/networks.component';
import { NetworksDetailComponent } from './networks/networks-detail/networks-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    VirtualMachinesComponent,
    VirtualMachineDetailComponent,
    ProjectsComponent,
    ProjectDetailComponent,
    DashboardComponent,
    LoginComponent,
    CreateVirtualMachineComponent,
    StorageComponent,
    StorageDetailComponent,
    NetworksComponent,
    NetworksDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
