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
import { FirewallRulesComponent } from './components/firewall-rules/firewall-rules.component';
import { HttpConfigInterceptor } from './interceptors/httpconfig.interceptor';
import { FirewallRulesDetailComponent } from './components/firewall-rules/firewall-rules-detail/firewall-rules-detail.component';
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
import { SpecialCharacterDirective } from './directives/special-character.directive';
import { SolarisComponent } from './components/solaris/solaris.component';
import { SolarisCdomCreateComponent } from './components/solaris/solaris-cdom-create/solaris-cdom-create.component';
import { SolarisLdomCreateComponent } from './components/solaris/solaris-ldom-create/solaris-ldom-create.component';
import { SolarisCdomListComponent } from './components/solaris/solaris-cdom-list/solaris-cdom-list.component';
import { DeployComponent } from './components/deploy/deploy.component';
import { NetworkObjectsGroupsComponent } from './components/network-objects-groups/network-objects-groups.component';
import { NetworkObjectModalComponent } from './modals/network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from './modals/network-object-group-modal/network-object-group-modal.component';
import { ServiceObjectsGroupsComponent } from './components/service-objects-groups/service-objects-groups.component';
import { ServiceObjectModalComponent } from './modals/service-object-modal/service-object-modal.component';
import { ServiceObjectGroupModalComponent } from './modals/service-object-group-modal/service-object-group-modal.component';
import { FirewallRuleModalComponent } from './modals/firewall-rule-modal/firewall-rule-modal.component';
import { VirtualServerModalComponent } from './modals/virtual-server-modal/virtual-server-modal.component';
import { LoadBalancersComponent } from './components/load-balancers/load-balancers.component';
import { PoolModalComponent } from './modals/pool-modal/pool-modal.component';
import { PoolMemberModalComponent } from './modals/pool-member-modal/pool-member-modal.component';
import { IRuleModalComponent } from './modals/irule-modal/irule-modal.component';
import { HealthMonitorModalComponent } from './modals/health-monitor-modal/health-monitor-modal.component';
import { NetworkInterfacesComponent } from './components/network-interfaces/network-interfaces.component';
import { LogicalInterfaceModalComponent } from './modals/logical-interface-modal/logical-interface-modal.component';
import { SolarisImageRepositoryComponent } from './components/solaris/solaris-image-repository/solaris-image-repository.component';
import { ImportExportComponent } from './components/import-export/import-export.component';
import { PhysicalServerModalComponent } from './modals/physical-server-modal/physical-server-modal.component';
import { PhysicalServerComponent } from './components/systems/physical-server/physical-server.component';
import { PendingChangesGuard } from './guards/pending-changes.guard';
import { CdomDetailComponent } from './components/solaris/cdom-detail/cdom-detail.component';
import { LdomDetailComponent } from './components/solaris/ldom-detail/ldom-detail.component';
import { LdomListComponent } from './components/solaris/ldom-list/ldom-list.component';
import { D3Module } from './modules/d3-module/d3-module.module';
import { NetworkTopologyComponent } from './components/network-topology/network-topology.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { IntraVrfRulesComponent } from './components/firewall-rules/intra-vrf-rules/intra-vrf-rules.component';
import { ContractModalComponent } from './modals/contract-modal/contract-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    NetworksComponent,
    NetworksDetailComponent,
    FirewallRulesComponent,
    FirewallRulesDetailComponent,
    JobsComponent,
    CreateNetworkComponent,
    NavbarComponent,
    IpaddressesComponent,
    NotfoundComponent,
    BreadcrumbComponent,
    DevicesComponent,
    StaticRoutesComponent,
    StaticRouteDetailComponent,
    SpecialCharacterDirective,
    SolarisComponent,
    SolarisCdomCreateComponent,
    SolarisLdomCreateComponent,
    SolarisCdomListComponent,
    DeployComponent,
    NetworkObjectsGroupsComponent,
    NetworkObjectModalComponent,
    NetworkObjectGroupModalComponent,
    ServiceObjectsGroupsComponent,
    ServiceObjectModalComponent,
    ServiceObjectGroupModalComponent,
    FirewallRuleModalComponent,
    VirtualServerModalComponent,
    LoadBalancersComponent,
    PoolModalComponent,
    PoolMemberModalComponent,
    IRuleModalComponent,
    HealthMonitorModalComponent,
    NetworkInterfacesComponent,
    LogicalInterfaceModalComponent,
    SolarisImageRepositoryComponent,
    ImportExportComponent,
    PhysicalServerComponent,
    PhysicalServerModalComponent,
    CdomDetailComponent,
    LdomDetailComponent,
    LdomListComponent,
    NetworkTopologyComponent,
    TooltipComponent,
    IntraVrfRulesComponent,
    ContractModalComponent
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
    NgxSmartModalModule.forRoot(),
    D3Module
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true}, 
    NgxSmartModalService, CookieService, FormBuilder, PendingChangesGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
