import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { AppliancesService } from './api/appliances.service';
import { DatacentersService } from './api/datacenters.service';
import { DefaultService } from './api/default.service';
import { NetworkSecurityFirewallRuleGroupsService } from './api/networkSecurityFirewallRuleGroups.service';
import { NetworkSecurityFirewallRulesService } from './api/networkSecurityFirewallRules.service';
import { NetworkSecurityNetworkObjectGroupsService } from './api/networkSecurityNetworkObjectGroups.service';
import { NetworkSecurityNetworkObjectsService } from './api/networkSecurityNetworkObjects.service';
import { NetworkSecurityServiceObjectGroupsService } from './api/networkSecurityServiceObjectGroups.service';
import { NetworkSecurityServiceObjectsService } from './api/networkSecurityServiceObjects.service';
import { NetworkStaticRoutesService } from './api/networkStaticRoutes.service';
import { NetworkSubnetsService } from './api/networkSubnets.service';
import { NetworkVlansService } from './api/networkVlans.service';
import { PhysicalServersService } from './api/physicalServers.service';
import { SubnetsService } from './api/subnets.service';
import { TiersService } from './api/tiers.service';
import { VlansService } from './api/vlans.service';
import { VmwareNetworkAdapterService } from './api/vmwareNetworkAdapter.service';
import { VmwareVirtualDisksService } from './api/vmwareVirtualDisks.service';
import { VmwareVirtualMachinesService } from './api/vmwareVirtualMachines.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    AppliancesService,
    DatacentersService,
    DefaultService,
    NetworkSecurityFirewallRuleGroupsService,
    NetworkSecurityFirewallRulesService,
    NetworkSecurityNetworkObjectGroupsService,
    NetworkSecurityNetworkObjectsService,
    NetworkSecurityServiceObjectGroupsService,
    NetworkSecurityServiceObjectsService,
    NetworkStaticRoutesService,
    NetworkSubnetsService,
    NetworkVlansService,
    PhysicalServersService,
    SubnetsService,
    TiersService,
    VlansService,
    VmwareNetworkAdapterService,
    VmwareVirtualDisksService,
    VmwareVirtualMachinesService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
