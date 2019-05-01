// Angular Imports
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';

// 3rd-Party Imports
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import { PapaParseModule } from 'ngx-papaparse';
import { ToastrModule } from 'ngx-toastr';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { CookieService } from 'ngx-cookie-service';

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
import { DeployComponent } from './components/deploy/deploy.component';
import { NetworkObjectsGroupsComponent } from './components/network-objects-groups/network-objects-groups.component';
import { NetworkObjectModalComponent } from './modals/network-object-modal/network-object-modal.component';

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
    DeployComponent,
    NetworkObjectsGroupsComponent,
    NetworkObjectModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    PapaParseModule,
    NgxMaskModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      progressBar: true,
      closeButton: true,
      preventDuplicates: true
    }),
    NgxSmartModalModule.forRoot()
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true}, NgxSmartModalService, CookieService, FormBuilder],
  bootstrap: [AppComponent]
})
export class AppModule { }
