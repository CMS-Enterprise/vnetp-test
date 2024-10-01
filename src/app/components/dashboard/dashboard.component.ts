import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  V1JobsService,
  V3GlobalMessagesService,
  PaginationDTO,
} from 'client';
import { DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import SubscriptionUtil from '../../utils/SubscriptionUtil';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TableConfig } from 'src/app/common/table/table.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
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
    private jobService: V1JobsService,
    private globalMessagesService: V3GlobalMessagesService,
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
  messages: PaginationDTO;
  public config: TableConfig<any> = {
    description: 'Dashboard-Deployments',
    columns: [
      { name: 'Type', property: 'jobType' },
      { name: 'Timestamp', property: 'createdAt' },
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

  dashboardPoller: any;
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Card 1', cols: 1, rows: 1, data: 'CARD DATA HERE' },
          { title: 'Training Resources', cols: 1, rows: 1, data: ['TRAINING STUFF', 'SOME MORE TRAINING STUFF'] },
          { title: 'Troubleshooting', cols: 1, rows: 1, data: ['SOME TROUBLE SHOOTING STUFF', 'MORE TROUBLESHOOTING STUFF'] },
          { title: 'Latest Features', cols: 1, rows: 1, data: ['FEATURE X - implemented yesterday', 'FEATURE Y - never coming'] },
        ];
      }
      console.log('matches', matches);
      return [
        { title: 'Upcoming in VNETP', cols: 1, rows: 1, data: ['NEW FEATURE A', 'NEW FEATURE B'] },
        { title: 'Training Resources', cols: 1, rows: 1, data: ['TRAINING STUFF', 'SOME MORE TRAINING STUFF'] },
        { title: 'Troubleshooting', cols: 1, rows: 1, data: ['SOME TROUBLE SHOOTING STUFF', 'MORE TROUBLESHOOTING STUFF'] },
        { title: 'Latest Features', cols: 1, rows: 1, data: ['FEATURE X - implemented yesterday', 'FEATURE Y - never coming'] },
      ];
    }),
  );

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
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
    this.getGlobalMessages();
    this.dashboardPoller = setInterval(() => this.loadDashboard(this.userRoles), 1000 * 300);
  }

  private getGlobalMessages() {
    this.globalMessagesService.getMessagesMessage({ page: 1, perPage: 3 }).subscribe(data => {
      this.messages = data;
    });
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
      this.getJobs();
    }
  }

  private getDatacenters(): void {
    this.datacenterService.getManyDatacenter({ page: 1, perPage: 1 }).subscribe(data => {
      const paged: any = data;
      this.datacenters = paged.total;
      try {
        this.status[1].status = 'green';
      } catch {}
    });
  }

  private getTiers(): void {
    this.tierService.getManyTier({ page: 1, perPage: 1 }).subscribe(data => {
      const paged: any = data;
      this.tiers = paged.total;
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

  private getSubnets(): void {
    this.subnetService.getManySubnet({ page: 1, perPage: 1 }).subscribe(data => {
      this.subnetCount = data.total;
    });
  }

  private getVlans(): void {
    this.vlanService.getManyVlan({ page: 1, perPage: 1 }).subscribe(data => {
      this.vlanCount = data.total;
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

  private getJobs(): void {
    this.jobService
      .getManyJob({
        page: 1,
        perPage: 3,
      })
      .subscribe(data => {
        this.jobs = data;
      });
  }
}
