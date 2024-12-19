import { Component, OnInit, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
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
} from 'client';
import { DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import SubscriptionUtil from '../../utils/SubscriptionUtil';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TableConfig } from 'src/app/common/table/table.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

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
  messages: any;
  messagesPerPage = 5;
  otherMessages;
  currentTenant;
  public messageTableComponentDto = new TableComponentDto();
  showOtherMessages = false;
  tenantShowName;

  @ViewChild('jobTimestampTemplate') jobTimestampTemplate: TemplateRef<any>;

  @ViewChild('messageTimestampTemplate') messageTimestampTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Dashboard-Deployments',
    columns: [
      { name: 'Type', property: 'jobType' },
      { name: 'Started', template: () => this.jobTimestampTemplate },
    ],
  };

  public messagesConfig: TableConfig<any> = {
    description: 'Dashboard Global Messages',
    columns: [
      { name: 'Description', property: 'description' },
      { name: 'Created At', template: () => this.messageTimestampTemplate },
    ],
    hideAdvancedSearch: true,
    hideSearchBar: true,
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
    map(() => [
      { title: 'Upcoming in VNETP', cols: 1, rows: 1, data: ['PANOS App-Id', 'Admin Portal - Provider Admin'] },
      { title: 'Training Resources', cols: 1, rows: 1, data: ['TRAINING STUFF', 'SOME MORE TRAINING STUFF'] },
      // { title: 'Troubleshooting', cols: 1, rows: 1, data: ['SOME TROUBLE SHOOTING STUFF', 'MORE TROUBLESHOOTING STUFF'] },
      // { title: 'Latest Features', cols: 1, rows: 1, data: ['FEATURE X - implemented yesterday', 'FEATURE Y - never coming'] },
    ]),
  );

  ngOnInit() {
    this.messageTableComponentDto.page = 1;
    this.messageTableComponentDto.perPage = this.messagesPerPage;
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
    this.getGlobalMessages();
    this.currentTenant = localStorage.getItem('tenantQueryParam');
    if (this.currentTenant) {
      this.currentTenant = this.currentTenant.replace(/['"]+/g, '');
      this.tenantShowName = this.currentTenant.split('_').slice(0, -1).toString().replaceAll(',', '_');
    }
    this.loadDashboard(this.userRoles);

    this.getTenantMessages();
    this.dashboardPoller = setInterval(() => this.loadDashboard(this.userRoles), 1000 * 300);
  }

  public onTableEvent(event: TableComponentDto): void {
    this.messageTableComponentDto = event;
    this.getGlobalMessages(event);
  }

  private getGlobalMessages(event?) {
    if (event) {
      this.messageTableComponentDto.page = event.page ? event.page : 1;
      this.messageTableComponentDto.perPage = event.perPage ? event.perPage : 5;
    } else {
      this.messageTableComponentDto.searchText = undefined;
    }
    this.globalMessagesService
      .getManyMessage({
        page: this.messageTableComponentDto.page,
        perPage: this.messageTableComponentDto.perPage,
        sort: ['createdAt,DESC'],
        filter: ['messageType||eq||General'],
      })
      .subscribe(
        data => {
          this.messages = data;
        },
        () => {},
      );
  }

  public getTenantMessages() {
    this.globalMessagesService
      .getManyMessage({ page: 1, perPage: 100, sort: ['createdAt,DESC'], filter: [`tenantName||eq||${this.currentTenant}`] })
      .subscribe(data => {
        this.otherMessages = data;

        // use this to dynamically change the title / messages in the bottom cards
        const trainingMessages = [];
        const newFeatureMessages = [];
        this.otherMessages.data = this.otherMessages.data.filter(message => {
          if (message.messageType === 'Training') {
            // if (trainingMessages.length === 5) {
            //   return;
            // }

            trainingMessages.push(message.description);
          } else if (message.messageType === 'NewFeature') {
            // if (newFeatureMessages.length === 5) {
            //   return;
            // }
            newFeatureMessages.push(message.description);
          }

          return message.messageType !== 'Training' && message.messageType !== 'NewFeature';
        });

        // use this to dynamically change the title / messages in the bottom cards
        this.cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
          map(() => [
            { title: 'Training', cols: 1, rows: 1, data: trainingMessages },
            { title: 'New Features', cols: 1, rows: 1, data: newFeatureMessages },
            // { title: 'Troubleshooting', cols: 1, rows: 1, data: ['SOME TROUBLE SHOOTING STUFF', 'MORE TROUBLESHOOTING STUFF'] },
            // { title: 'Latest Features', cols: 1, rows: 1, data: ['FEATURE X - implemented yesterday', 'FEATURE Y - planned for 11/24'] },
          ]),
        );
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
    this.getJobs();
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
        perPage: 5,
        sort: ['updatedAt,DESC'],
      })
      .subscribe(data => {
        this.jobs = data;
      });
  }
  // private addLinks(message) {
  //   const anchorTag = document.getElementById('anchorTag') as any;
  //   if (message.linkUrl) {
  //     anchorTag.setAttribute('href', `${message.linkUrl}`)
  //   }
  // }
}
