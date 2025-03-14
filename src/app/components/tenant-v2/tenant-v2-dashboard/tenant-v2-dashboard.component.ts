import { Component, OnInit } from '@angular/core';
import {
  UserDto,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricVrfsService,
  V2AppCentricTenantsService,
  V3GlobalMessagesService,
} from 'client';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-tenant-v2-dashboard',
  templateUrl: './tenant-v2-dashboard.component.html',
  styleUrls: ['./tenant-v2-dashboard.component.scss'],
})
export class TenantV2DashboardComponent implements OnInit {
  private currentUserSubscription: Subscription;
  public user: UserDto;
  public userRoles: string[];
  networkObjectCount: number;
  networkObjectGroupCount: number;
  serviceObjectCount: number;
  serviceObjectGroupCount: number;
  subnetCount: number;
  vlanCount: number;
  firewallRuleCount: number;
  natRuleCount: number;
  public vrfs: number;
  public bridgeDomains: number;
  public contracts: number;
  public endpointGroups: number;
  public tenants: number;

  dashboardPoller;

  public status = [
    { name: 'User Interface', status: 'green' },
    { name: 'API', status: 'red' },
    { name: 'Infrastructure', status: 'green' },
  ];

  constructor(
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private auth: AuthService,
    private globalMessagesService: V3GlobalMessagesService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private natRuleService: V1NetworkSecurityNatRulesService,
    private vrfsService: V2AppCentricVrfsService,
    private bridgeDomainsService: V2AppCentricBridgeDomainsService,
    private contractsService: V2AppCentricContractsService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private tenantsService: V2AppCentricTenantsService,
  ) {}
  ngOnInit() {
    if (this.auth.currentUser) {
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        this.userRoles = this.user.dcsPermissions.map(p => p.roles).flat();
        this.loadDashboard(this.userRoles);
        this.dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);
      });
    }
  }

  ngOnDestroy() {
    clearInterval(this.dashboardPoller);
    SubscriptionUtil.unsubscribe([this.currentUserSubscription]);
  }

  // only fetch the dashboard entities that the user has the correct permissions to view
  private loadDashboard(roles?: string[]): void {
    if (roles) {
      // this.getFWRules();
      // this.getNatRules();
      // this.getNetworkObjects();
      // this.getNetworkObjectGroups();
      // this.getServiceObjects();
      // this.getServiceObjectGroups();
      // this.getVrfCount();
      // this.getBridgeDomainCount();
      // this.getContractCount();
      // this.getEpgs();
      this.getTenants();
    }
  }

  private getTenants(): void {
    this.tenantsService.getManyTenant({ page: 1, perPage: 1, filter: ['tenantVersion||eq||2'] }).subscribe(data => {
      this.tenants = data.total;
    });
  }

  private getFWRules(): void {
    this.firewallRuleService.getManyFirewallRule({ page: 1, perPage: 1 }).subscribe(data => {
      this.firewallRuleCount = data.total;
    });
  }

  private getNatRules(): void {
    this.natRuleService.getManyNatRule({ page: 1, perPage: 1 }).subscribe(data => {
      this.natRuleCount = data.total;
    });
  }

  private getNetworkObjects(): void {
    this.networkObjectService
      .getManyNetworkObject({
        page: 1,
        perPage: 1,
      })
      .subscribe(data => {
        this.networkObjectCount = data.total;
      });
  }

  private getNetworkObjectGroups(): void {
    this.networkObjectGroupService
      .getManyNetworkObjectGroup({
        page: 1,
        perPage: 1,
      })
      .subscribe(data => {
        this.networkObjectGroupCount = data.total;
      });
  }

  private getServiceObjects(): void {
    this.serviceObjectService
      .getManyServiceObject({
        page: 1,
        perPage: 1,
      })
      .subscribe(data => {
        this.serviceObjectCount = data.total;
      });
  }

  private getServiceObjectGroups(): void {
    this.serviceObjectGroupService
      .getManyServiceObjectGroup({
        page: 1,
        perPage: 1,
      })
      .subscribe(data => {
        this.serviceObjectGroupCount = data.total;
      });
  }

  private getVrfCount(): void {
    this.vrfsService.getManyVrf({ page: 1, perPage: 1 }).subscribe(data => {
      this.vrfs = data.total;
    });
  }

  private getBridgeDomainCount(): void {
    this.bridgeDomainsService.getManyBridgeDomain({ page: 1, perPage: 1 }).subscribe(data => {
      this.bridgeDomains = data.total;
    });
  }

  private getContractCount(): void {
    this.contractsService.getManyContract({ page: 1, perPage: 1 }).subscribe(data => {
      this.contracts = data.total;
    });
  }

  private getEpgs(): void {
    this.endpointGroupService.getManyEndpointGroup({ page: 1, perPage: 1 }).subscribe(data => {
      this.endpointGroups = data.total;
    });
  }
}
