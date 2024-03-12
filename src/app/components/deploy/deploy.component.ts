import { Component, OnInit } from '@angular/core';
import {
  V1TiersService,
  Tier,
  Datacenter,
  V1TierGroupsService,
  TierGroup,
  V1JobsService,
  Job,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  FirewallRuleGroup,
  NatRuleGroup,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  ServiceObjectGroup,
  AuditLogEntityTypeEnum,
  V1AuditLogService,
  AuditLog,
} from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription, forkJoin } from 'rxjs';
import { TableRowWrapper } from 'src/app/models/other/table-row-wrapper';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import UndeployedChangesUtil from '../../utils/UndeployedChangesUtil';

interface DifferenceDetail {
  before: any;
  after: any;
}

interface ReportEntry {
  timestamp: string;
  actionType: string;
  differences: { [key: string]: DifferenceDetail } | string | any[];
}

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
})
export class DeployComponent implements OnInit {
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;
  changeReport = {
    tier: {} as Tier,
    firewallRuleGroups: [] as FirewallRuleGroup[],
    natRuleGroups: [] as NatRuleGroup[],
    networkObjects: [] as NetworkObject[],
    networkObjectGroups: [] as NetworkObjectGroup[],
    serviceObjects: [] as ServiceObject[],
    serviceObjectGroups: [] as ServiceObjectGroup[],
  };

  report: ReportEntry[] = [];

  reportGroups = [
    { name: 'Firewall Rule Groups', data: this.changeReport.firewallRuleGroups, type: AuditLogEntityTypeEnum.FirewallRuleGroup },
    { name: 'NAT Rule Groups', data: this.changeReport.natRuleGroups, type: AuditLogEntityTypeEnum.NatRuleGroup },
    { name: 'Network Objects', data: this.changeReport.networkObjects, type: AuditLogEntityTypeEnum.NetworkObject },
    { name: 'Network Object Groups', data: this.changeReport.networkObjectGroups, type: AuditLogEntityTypeEnum.NetworkObjectGroup },
    { name: 'Service Objects', data: this.changeReport.serviceObjects, type: AuditLogEntityTypeEnum.ServiceObject },
    { name: 'Service Object Groups', data: this.changeReport.serviceObjectGroups, type: AuditLogEntityTypeEnum.ServiceObjectGroup },
  ];

  tierGroups: TierGroup[] = [];
  tiers: TableRowWrapper<Tier>[] = [];
  AuditLogEntityTypeEnum = AuditLogEntityTypeEnum;

  constructor(
    private tierService: V1TiersService,
    private tierGroupService: V1TierGroupsService,
    private datacenterService: DatacenterContextService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private jobService: V1JobsService,
    private auditLogService: V1AuditLogService,
    private ngx: NgxSmartModalService,
  ) {}

  public deployTiers(): void {
    const tiersToDeploy = this.tiers.filter(t => t.isSelected === true).map(t => t.item);
    if (!tiersToDeploy.length) {
      return;
    }

    const tierCount = tiersToDeploy.length === 1 ? '1 tier' : `${tiersToDeploy.length} tiers`;
    const onConfirm = () => {
      this.launchTierProvisioningJobs(tiersToDeploy);
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto('Deploy Tiers', `Are you sure you would like to deploy ${tierCount}?`),
      this.ngx,
      onConfirm,
    );
  }

  public getTierGroupName = (id: string): string => this.getObjectName(id, this.tierGroups);

  private getObjectName(id: string, objects: { name: string; id?: string }[]): string {
    if (!objects) {
      return 'N/A';
    }
    const object = objects.find(o => o.id === id);
    return object ? object.name : 'N/A';
  }

  private getTierGroups(loadTiers = false): void {
    this.tierGroupService
      .getManyTierGroup({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(response => {
        this.tierGroups = response.data;

        if (loadTiers) {
          this.getTiers();
        }
      });
  }

  private getTiers(): void {
    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`, 'deletedAt||isnull'],
        page: 1,
        perPage: 1000,
      })
      .subscribe(data => {
        this.tiers = data.data.map(tier => new TableRowWrapper(tier));
      });
  }

  private launchTierProvisioningJobs(tiersToDeploy: Tier[]): void {
    tiersToDeploy.forEach(tier => {
      const tierProvisionJob = {} as Job;

      tierProvisionJob.datacenterId = this.currentDatacenter.id;
      tierProvisionJob.jobType = 'provision-tier';
      tierProvisionJob.definition = {
        tierId: tier.id,
      };

      this.jobService.createOneJob({ job: tierProvisionJob }).subscribe(() => {});

      const tierNetworkSecurityJob = {} as Job;

      tierNetworkSecurityJob.datacenterId = this.currentDatacenter.id;
      tierNetworkSecurityJob.jobType = 'provision-tier-network-security';
      tierNetworkSecurityJob.definition = {
        tierId: tier.id,
      };

      this.jobService.createOneJob({ job: tierNetworkSecurityJob }).subscribe(() => {});
    });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getTierGroups(true);
      }
    });
  }

  checkUndeployedChanges(object) {
    return UndeployedChangesUtil.hasUndeployedChanges(object);
  }

  getChangeReport(tier: Tier) {
    const firewallRuleGroupRequest = this.firewallRuleGroupService.getManyFirewallRuleGroup({
      s: this.getUndeployedOrNewObjects(tier.id),
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name', 'provisionedAt', 'provisionedVersion'],
      page: 1,
      perPage: 10,
    });
    const natRuleGroupRequest = this.natRuleGroupService.getManyNatRuleGroup({
      s: this.getUndeployedOrNewObjects(tier.id),
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name', 'provisionedAt', 'provisionedVersion'],
      page: 1,
      perPage: 10,
    });
    const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
      s: this.getUndeployedOrNewObjects(tier.id),
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name', 'provisionedAt', 'provisionedVersion'],
      page: 1,
      perPage: 50000,
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
      s: this.getUndeployedOrNewObjects(tier.id),
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name', 'provisionedAt', 'provisionedVersion'],
      page: 1,
      perPage: 50000,
    });
    const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
      s: this.getUndeployedOrNewObjects(tier.id),
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name', 'provisionedAt', 'provisionedVersion'],
      page: 1,
      perPage: 50000,
    });
    const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
      s: this.getUndeployedOrNewObjects(tier.id),
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name', 'provisionedAt', 'provisionedVersion'],
      page: 1,
      perPage: 50000,
    });

    forkJoin([
      firewallRuleGroupRequest,
      natRuleGroupRequest,
      networkObjectRequest,
      networkObjectGroupRequest,
      serviceObjectRequest,
      serviceObjectGroupRequest,
    ]).subscribe(result => {
      this.changeReport.firewallRuleGroups = result[0].data;
      this.changeReport.natRuleGroups = result[1].data;
      this.changeReport.networkObjects = result[2].data;
      this.changeReport.networkObjectGroups = result[3].data;
      this.changeReport.serviceObjects = result[4].data;
      this.changeReport.serviceObjectGroups = result[5].data;
      this.changeReport.tier = tier;

      this.updateReportGroups();

      this.ngx.getModal('changeReportModal').open();
    });
  }

  private updateReportGroups() {
    this.reportGroups = [
      { name: 'Firewall Rule Groups', data: this.changeReport.firewallRuleGroups, type: AuditLogEntityTypeEnum.FirewallRuleGroup },
      { name: 'NAT Rule Groups', data: this.changeReport.natRuleGroups, type: AuditLogEntityTypeEnum.NatRuleGroup },
      { name: 'Network Objects', data: this.changeReport.networkObjects, type: AuditLogEntityTypeEnum.NetworkObject },
      { name: 'Network Object Groups', data: this.changeReport.networkObjectGroups, type: AuditLogEntityTypeEnum.NetworkObjectGroup },
      { name: 'Service Objects', data: this.changeReport.serviceObjects, type: AuditLogEntityTypeEnum.ServiceObject },
      { name: 'Service Object Groups', data: this.changeReport.serviceObjectGroups, type: AuditLogEntityTypeEnum.ServiceObjectGroup },
    ];
  }

  getUndeployedOrNewObjects(tierId) {
    return JSON.stringify({
      OR: [
        {
          provisionedVersion: {
            isnull: true,
          },
        },
        {
          version: {
            gt_prop: 'provisionedVersion',
          },
        },
      ],
      AND: [
        {
          tierId: {
            eq: tierId,
          },
        },
      ],
    });
  }

  getObjectAuditLogEvents(id: string, updatedAt: string, type: AuditLogEntityTypeEnum) {
    console.log(id, updatedAt, type, 'audit log data');
    this.auditLogService
      .getAuditLogByEntityIdAuditLog({
        entityId: id,
        entityType: type,
        tenant: '1',
        afterTimestamp: new Date(updatedAt).toISOString(),
      })
      .subscribe(data => {
        console.log(data, 'audit log data');
        this.report = this.generateReport(data);
        console.log(this.report, 'change report');
        this.ngx.getModal('changeReportDetailModal').open();
      });
  }

  generateReport(auditLogs: any[]): ReportEntry[] {
    return auditLogs.map(log => {
      if (log.entityBefore && log.entityAfter) {
        const differencesArray = Object.entries(log.entityAfter).reduce((acc, [key, afterValue]) => {
          const beforeValue = log.entityBefore[key];
          if (beforeValue !== afterValue) {
            acc.push({ key, before: beforeValue, after: afterValue });
          }
          return acc;
        }, []);

        return {
          timestamp: log.timestamp,
          actionType: log.actionType,
          differences: differencesArray.length ? differencesArray : 'Entity state changed without specific property comparison.',
        };
      } else {
        return {
          timestamp: log.timestamp,
          actionType: log.actionType,
          differences: 'Entity state changed without specific property comparison.',
        };
      }
    });
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  expandedRows: number[] = [];

  toggleExpand(index: number): void {
    const position = this.expandedRows.indexOf(index);
    if (position > -1) {
      this.expandedRows.splice(position, 1); // Collapse row
    } else {
      this.expandedRows.push(index); // Expand row
    }
  }
}
