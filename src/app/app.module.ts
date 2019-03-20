import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {FormsModule } from '@angular/forms';
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import { PapaParseModule } from 'ngx-papaparse';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NetworksComponent } from './components/networks/networks.component';
import { NetworkSecurityProfilesComponent } from './components/networks/network-security-profiles/network-security-profiles.component';
import { HttpConfigInterceptor } from './interceptors/httpconfig.interceptor';
import { NetworkSecurityProfileDetailComponent } from './components/networks/network-security-profiles/network-security-profile-detail/network-security-profile-detail.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { CreateNetworkComponent } from './components/networks/create-network/create-network.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NetworksDetailComponent } from './components/networks/networks-detail/networks-detail.component';
import { IpaddressesComponent } from './components/networks/ipaddresses/ipaddresses.component';
import { NotfoundComponent } from './components/notfound/notfound.component';

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
    NotfoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FormsModule,
    PapaParseModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
