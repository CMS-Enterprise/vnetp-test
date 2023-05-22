import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { V1AuditLogService } from './api/v1AuditLog.service';
import { V1AuthService } from './api/v1Auth.service';
import { V1DatacentersService } from './api/v1Datacenters.service';
import { V1JobsService } from './api/v1Jobs.service';
import { V1LoadBalancerHealthMonitorsService } from './api/v1LoadBalancerHealthMonitors.service';
import { V1LoadBalancerIrulesService } from './api/v1LoadBalancerIrules.service';
import { V1LoadBalancerNodesService } from './api/v1LoadBalancerNodes.service';
import { V1LoadBalancerPoliciesService } from './api/v1LoadBalancerPolicies.service';
import { V1LoadBalancerPoolsService } from './api/v1LoadBalancerPools.service';
import { V1LoadBalancerProfilesService } from './api/v1LoadBalancerProfiles.service';
import { V1LoadBalancerRoutesService } from './api/v1LoadBalancerRoutes.service';
import { V1LoadBalancerSelfIpsService } from './api/v1LoadBalancerSelfIps.service';
import { V1LoadBalancerVirtualServersService } from './api/v1LoadBalancerVirtualServers.service';
import { V1LoadBalancerVlansService } from './api/v1LoadBalancerVlans.service';
import { V1NetworkSecurityFirewallRuleGroupsService } from './api/v1NetworkSecurityFirewallRuleGroups.service';
import { V1NetworkSecurityFirewallRulesService } from './api/v1NetworkSecurityFirewallRules.service';
import { V1NetworkSecurityNatRuleGroupsService } from './api/v1NetworkSecurityNatRuleGroups.service';
import { V1NetworkSecurityNatRulesService } from './api/v1NetworkSecurityNatRules.service';
import { V1NetworkSecurityNetworkObjectGroupsService } from './api/v1NetworkSecurityNetworkObjectGroups.service';
import { V1NetworkSecurityNetworkObjectsService } from './api/v1NetworkSecurityNetworkObjects.service';
import { V1NetworkSecurityServiceObjectGroupsService } from './api/v1NetworkSecurityServiceObjectGroups.service';
import { V1NetworkSecurityServiceObjectsService } from './api/v1NetworkSecurityServiceObjects.service';
import { V1NetworkStaticRoutesService } from './api/v1NetworkStaticRoutes.service';
import { V1NetworkSubnetsService } from './api/v1NetworkSubnets.service';
import { V1NetworkVlansService } from './api/v1NetworkVlans.service';
import { V1SelfServiceService } from './api/v1SelfService.service';
import { V1TierGroupsService } from './api/v1TierGroups.service';
import { V1TiersService } from './api/v1Tiers.service';
import { V1VlansService } from './api/v1Vlans.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
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
