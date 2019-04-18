// Angular Imports
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {FormsModule } from '@angular/forms';

// 3rd-Party Imports
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import { PapaParseModule } from 'ngx-papaparse';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule } from 'ngx-mask';

// 1st-Party Imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NetworksComponent } from './components/networks/networks.component';
import { NetworkSecurityProfilesComponent } from './components/network-security-profiles/network-security-profiles.component';
import { HttpConfigInterceptor } from './interceptors/httpconfig.interceptor';
import { NetworkSecurityProfileDetailComponent } from './components/network-security-profiles/network-security-profile-detail/network-security-profile-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { CreateNetworkComponent } from './components/networks/create-network/create-network.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NetworksDetailComponent } from './components/networks/networks-detail/networks-detail.component';
import { IpaddressesComponent } from './components/ipaddresses/ipaddresses.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { DevicesComponent } from './components/devices/devices.component';
import { StaticRoutesComponent } from './components/static-routes/static-routes.component';
import { StaticRouteDetailComponent } from './components/static-routes/static-route-detail/static-route-detail.component';
import { IpNatsComponent } from './components/ip-nats/ip-nats.component';
import { IpNatDetailComponent } from './components/ip-nats/ip-nat-detail/ip-nat-detail.component';
import { CreateIpNatComponent } from './components/ip-nats/create-ip-nat/create-ip-nat.component';
import { SpecialCharacterDirective } from './directives/special-character.directive';
import { SolarisComponent } from './components/solaris/solaris.component';
import { SolarisDetailComponent } from './components/solaris/solaris-detail/solaris-detail.component';
import { SolarisVdcListComponent } from './components/solaris/solaris-vdc-list/solaris-vdc-list.component';
import { SolarisCdomListComponent } from './components/solaris/solaris-cdom-list/solaris-cdom-list.component';
import { SolarisCdomViewComponent } from './components/solaris/solaris-cdom-view/solaris-cdom-view.component';
import { SolarisCdomCreateComponent } from './components/solaris/solaris-cdom-create/solaris-cdom-create.component';
import { SolarisCdomLdomsComponent } from './components/solaris/solaris-cdom-ldoms/solaris-cdom-ldoms.component';
import { SolarisCdomWwnComponent } from './components/solaris/solaris-cdom-wwn/solaris-cdom-wwn.component';
import { SolarisCdomVlanComponent } from './components/solaris/solaris-cdom-vlan/solaris-cdom-vlan.component';
import { SolarisCdomCoresComponent } from './components/solaris/solaris-cdom-cores/solaris-cdom-cores.component';
import { SolarisCdomMemoryComponent } from './components/solaris/solaris-cdom-memory/solaris-cdom-memory.component';
import { SolarisLdomListComponent } from './components/solaris/solaris-ldom-list/solaris-ldom-list.component';
import { SolarisLdomViewComponent } from './components/solaris/solaris-ldom-view/solaris-ldom-view.component';
import { SolarisLdomEditComponent } from './components/solaris/solaris-ldom-edit/solaris-ldom-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    NetworksComponent,
    NetworksDetailComponent,
    NetworkSecurityProfilesComponent,
    NetworkSecurityProfileDetailComponent,
    JobsComponent,
    CreateNetworkComponent,
    NavbarComponent,
    IpaddressesComponent,
    NotfoundComponent,
    BreadcrumbComponent,
    DevicesComponent,
    StaticRoutesComponent,
    StaticRouteDetailComponent,
    IpNatsComponent,
    IpNatDetailComponent,
    CreateIpNatComponent,
    SpecialCharacterDirective,
    SolarisComponent,
    SolarisDetailComponent,
    SolarisVdcListComponent,
    SolarisCdomListComponent,
    SolarisCdomViewComponent,
    SolarisCdomCreateComponent,
    SolarisCdomLdomsComponent,
    SolarisCdomWwnComponent,
    SolarisCdomVlanComponent,
    SolarisCdomCoresComponent,
    SolarisCdomMemoryComponent,
    SolarisLdomListComponent,
    SolarisLdomViewComponent,
    SolarisLdomEditComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule,
    PapaParseModule,
    NgxMaskModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      progressBar: true,
      closeButton: true,
      preventDuplicates: true
    })
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
