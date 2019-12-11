import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { DefaultService } from './api/default.service';
import { V1AppliancesService } from './api/v1Appliances.service';
import { V1DatacentersService } from './api/v1Datacenters.service';
import { V1LoadBalancerHealthMonitorsService } from './api/v1LoadBalancerHealthMonitors.service';
import { V1LoadBalancerIrulesService } from './api/v1LoadBalancerIrules.service';
import { V1LoadBalancerNodesService } from './api/v1LoadBalancerNodes.service';
import { V1LoadBalancerPoolsService } from './api/v1LoadBalancerPools.service';
import { V1LoadBalancerVirtualServersService } from './api/v1LoadBalancerVirtualServers.service';
import { V1NetworkSecurityFirewallRuleGroupsService } from './api/v1NetworkSecurityFirewallRuleGroups.service';
import { V1NetworkSecurityFirewallRulesService } from './api/v1NetworkSecurityFirewallRules.service';
import { V1NetworkSecurityNetworkObjectGroupsService } from './api/v1NetworkSecurityNetworkObjectGroups.service';
import { V1NetworkSecurityNetworkObjectsService } from './api/v1NetworkSecurityNetworkObjects.service';
import { V1NetworkSecurityServiceObjectGroupsService } from './api/v1NetworkSecurityServiceObjectGroups.service';
import { V1NetworkSecurityServiceObjectsService } from './api/v1NetworkSecurityServiceObjects.service';
import { V1NetworkStaticRoutesService } from './api/v1NetworkStaticRoutes.service';
import { V1NetworkSubnetsService } from './api/v1NetworkSubnets.service';
import { V1NetworkVlansService } from './api/v1NetworkVlans.service';
import { V1PhysicalServersService } from './api/v1PhysicalServers.service';
import { V1TiersService } from './api/v1Tiers.service';
import { V1VlansService } from './api/v1Vlans.service';
import { V1VmwareNetworkAdapterService } from './api/v1VmwareNetworkAdapter.service';
import { V1VmwareVirtualDisksService } from './api/v1VmwareVirtualDisks.service';
import { V1VmwareVirtualMachinesService } from './api/v1VmwareVirtualMachines.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    DefaultService,
    V1AppliancesService,
    V1DatacentersService,
    V1LoadBalancerHealthMonitorsService,
    V1LoadBalancerIrulesService,
    V1LoadBalancerNodesService,
    V1LoadBalancerPoolsService,
    V1LoadBalancerVirtualServersService,
    V1NetworkSecurityFirewallRuleGroupsService,
    V1NetworkSecurityFirewallRulesService,
    V1NetworkSecurityNetworkObjectGroupsService,
    V1NetworkSecurityNetworkObjectsService,
    V1NetworkSecurityServiceObjectGroupsService,
    V1NetworkSecurityServiceObjectsService,
    V1NetworkStaticRoutesService,
    V1NetworkSubnetsService,
    V1NetworkVlansService,
    V1PhysicalServersService,
    V1TiersService,
    V1VlansService,
    V1VmwareNetworkAdapterService,
    V1VmwareVirtualDisksService,
    V1VmwareVirtualMachinesService ]
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
