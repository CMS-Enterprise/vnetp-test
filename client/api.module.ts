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
import { V1NetworkScopeFormsWanFormService } from './api/v1NetworkScopeFormsWanForm.service';
import { V1NetworkScopeFormsWanFormSubnetService } from './api/v1NetworkScopeFormsWanFormSubnet.service';
import { V1NetworkSecurityFirewallRuleGroupsService } from './api/v1NetworkSecurityFirewallRuleGroups.service';
import { V1NetworkSecurityFirewallRulesService } from './api/v1NetworkSecurityFirewallRules.service';
import { V1NetworkSecurityNatRuleGroupsService } from './api/v1NetworkSecurityNatRuleGroups.service';
import { V1NetworkSecurityNatRulesService } from './api/v1NetworkSecurityNatRules.service';
import { V1NetworkSecurityNetworkObjectGroupsService } from './api/v1NetworkSecurityNetworkObjectGroups.service';
import { V1NetworkSecurityNetworkObjectsService } from './api/v1NetworkSecurityNetworkObjects.service';
import { V1NetworkSecurityServiceObjectGroupsService } from './api/v1NetworkSecurityServiceObjectGroups.service';
import { V1NetworkSecurityServiceObjectsService } from './api/v1NetworkSecurityServiceObjects.service';
import { V1NetworkSecurityZonesService } from './api/v1NetworkSecurityZones.service';
import { V1NetworkStaticRoutesService } from './api/v1NetworkStaticRoutes.service';
import { V1NetworkSubnetsService } from './api/v1NetworkSubnets.service';
import { V1NetworkVlansService } from './api/v1NetworkVlans.service';
import { V1RuntimeDataAciRuntimeService } from './api/v1RuntimeDataAciRuntime.service';
import { V1RuntimeDataF5ConfigService } from './api/v1RuntimeDataF5Config.service';
import { V1RuntimeDataHitcountService } from './api/v1RuntimeDataHitcount.service';
import { V1RuntimeDataRouteTableService } from './api/v1RuntimeDataRouteTable.service';
import { V1SelfServiceService } from './api/v1SelfService.service';
import { V1StatusService } from './api/v1Status.service';
import { V1TierGroupsService } from './api/v1TierGroups.service';
import { V1TiersService } from './api/v1Tiers.service';
import { V2AppCentricAppCentricSubnetsService } from './api/v2AppCentricAppCentricSubnets.service';
import { V2AppCentricApplicationProfilesService } from './api/v2AppCentricApplicationProfiles.service';
import { V2AppCentricBridgeDomainsService } from './api/v2AppCentricBridgeDomains.service';
import { V2AppCentricContractsService } from './api/v2AppCentricContracts.service';
import { V2AppCentricEndpointGroupsService } from './api/v2AppCentricEndpointGroups.service';
import { V2AppCentricFilterEntriesService } from './api/v2AppCentricFilterEntries.service';
import { V2AppCentricFiltersService } from './api/v2AppCentricFilters.service';
import { V2AppCentricL3outsService } from './api/v2AppCentricL3outs.service';
import { V2AppCentricRouteProfilesService } from './api/v2AppCentricRouteProfiles.service';
import { V2AppCentricSubjectsService } from './api/v2AppCentricSubjects.service';
import { V2AppCentricTenantsService } from './api/v2AppCentricTenants.service';
import { V2AppCentricVrfsService } from './api/v2AppCentricVrfs.service';

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
