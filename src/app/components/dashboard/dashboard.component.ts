import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  V1DatacentersService,
  V1TiersService,
  V1LoadBalancerVirtualServersService,
  UserDto,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSubnetsService,
  V1NetworkVlansService,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNatRulesService,
  V1AuditLogService,
  Datacenter,
} from 'client';
import { DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { PieChartData } from 'src/app/common/d3-pie-chart/d3-pie-chart.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import SubscriptionUtil from '../../utils/SubscriptionUtil';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TableConfig } from 'src/app/common/table/table.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];

  private currentUserSubscription: Subscription;

  currentDatacenter: Datacenter;
  private currentDatacenterSubscription: Subscription;

  constructor(
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
    public helpText: DashboardHelpText,
    private loadBalancerService: V1LoadBalancerVirtualServersService,
    private auth: AuthService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private subnetService: V1NetworkSubnetsService,
    private vlanService: V1NetworkVlansService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private natRuleService: V1NetworkSecurityNatRulesService,
    private auditLogService: V1AuditLogService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  datacenters: number;
  tiers: number;
  vmwareVirtualMachines: number;
  loadBalancerVirtualServers: number;
  networkObjectCount: number;
  networkObjectGroupCount: number;
  serviceObjectCount: number;
  serviceObjectGroupCount: number;
  subnetCount: number;
  vlanCount: number;
  firewallRuleCount: number;
  natRuleCount: number;
  auditLogs;

  public config: TableConfig<any> = {
    description: 'Audit Log',
    columns: [
      { name: 'Action', property: 'actionType' },
      { name: 'Object Type', property: 'entityType' },
      { name: 'Tier Name', property: 'tierName' },
      // { name: 'Object Name', template: () => this.entityAfterTemplate },
      { name: 'User', property: 'changedBy' },
      { name: 'Timestamp', property: 'timestamp' },
    ],
  };

  status = [
    { name: 'User Interface', status: 'green' },
    { name: 'API', status: 'red' },
    { name: 'Infrastructure', status: 'green' },
  ];
  jobs: any;
  failedJobs = 0;
  successfulJobs = 0;
  pendingJobs = 0;
  cancelledJobs = 0;
  runningJobs = 0;
  pieChartData: Array<PieChartData>;

  dashboardPoller: any;

  ngOnInit() {
    this.pieChartData = [{ value: 1, color: '#f2f2f2' }];

    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      // console.log('cd',cd);
      if (cd) {
        this.currentDatacenter = cd;
      }
    });

    if (this.auth.currentUser) {
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        this.userRoles = this.user.dcsPermissions.map(p => p.roles).flat();
      });
    }
    this.loadDashboard(this.userRoles);
    this.dashboardPoller = setInterval(() => this.loadDashboard(this.userRoles), 1000 * 300);
  }

  ngOnDestroy() {
    clearInterval(this.dashboardPoller);
    SubscriptionUtil.unsubscribe([this.currentUserSubscription]);
  }

  // only fetch the dashboard entities that the user has the correct permissions to view
  private loadDashboard(roles?: string[]): void {
    this.getDatacenters();
    this.getTiers();
    if (roles && roles.includes('admin')) {
      this.getFWRules();
      this.getNatRules();
      this.getNetworkObjects();
      this.getNetworkObjectGroups();
      this.getServiceObjects();
      this.getServiceObjectGroups();
      this.getSubnets();
      this.getVlans();
    }
  }

  private getDatacenters(): void {
    this.datacenterService.getManyDatacenter({ page: 1, limit: 1 }).subscribe(data => {
      const paged: any = data;
      this.datacenters = paged.total;
      try {
        this.status[1].status = 'green';
      } catch {}
    });
  }

  private getTiers(): void {
    this.tierService.getManyTier({ page: 1, limit: 1 }).subscribe(data => {
      const paged: any = data;
      this.tiers = paged.total;
    });
  }

  private getFWRules(): void {
    this.firewallRuleService.getManyFirewallRule({ page: 1, limit: 1 }).subscribe(data => {
      this.firewallRuleCount = data.total;
    });
  }

  private getNatRules(): void {
    this.natRuleService.getManyNatRule({ page: 1, limit: 1 }).subscribe(data => {
      this.natRuleCount = data.total;
    });
  }

  private getSubnets(): void {
    this.subnetService.getManySubnet({ page: 1, limit: 1 }).subscribe(data => {
      this.subnetCount = data.total;
    });
  }

  private getVlans(): void {
    this.vlanService.getManyVlan({ page: 1, limit: 1 }).subscribe(data => {
      this.vlanCount = data.total;
    });
  }

  private getNetworkObjects(): void {
    this.networkObjectService
      .getManyNetworkObject({
        page: 1,
        limit: 1,
      })
      .subscribe(data => {
        this.networkObjectCount = data.total;
      });
  }

  private getNetworkObjectGroups(): void {
    this.networkObjectGroupService
      .getManyNetworkObjectGroup({
        page: 1,
        limit: 1,
      })
      .subscribe(data => {
        this.networkObjectGroupCount = data.total;
      });
  }

  private getServiceObjects(): void {
    this.serviceObjectService
      .getManyServiceObject({
        page: 1,
        limit: 1,
      })
      .subscribe(data => {
        this.serviceObjectCount = data.total;
      });
  }

  private getServiceObjectGroups(): void {
    this.serviceObjectGroupService
      .getManyServiceObjectGroup({
        page: 1,
        limit: 1,
      })
      .subscribe(data => {
        this.serviceObjectGroupCount = data.total;
      });
  }
}
