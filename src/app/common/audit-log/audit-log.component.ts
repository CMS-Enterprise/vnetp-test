/* eslint-disable */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  ApplicationProfile,
  AuditLogActionTypeEnum,
  BridgeDomain,
  Contract,
  Datacenter,
  EndpointGroup,
  GetManyTenantResponseDto,
  L3Out,
  NetworkObject,
  NetworkObjectGroup,
  RouteProfile,
  ServiceObject,
  ServiceObjectGroup,
  Tier,
  V1AuditLogService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1TiersService,
  V2AppCentricApplicationProfilesService,
  V2AppCentricL3outsService,
  V2AppCentricRouteProfilesService,
  V2AppCentricTenantsService,
  Vrf,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationMode } from '../../models/other/application-mode-enum';

// TODO: TenantV2 - when loading audit logs for a V2 tenant we need to get data from what was traditionally in "appcentric" audit logs
// and what was traditionally in "netcentric" audit logs. TenantV2 consists of an updated app-centric tenant and the security management
// components of a netcentric datacenter.
//
//  This will be done by using the relationship between the app-centric tenant and the netcentric datacenter to get all of those specific audit logs.

@Component({
  selector: 'app-audit-log',
  styleUrls: ['./audit-log.component.scss'],
  templateUrl: './audit-log.component.html',
})
export class AuditLogComponent implements OnInit {
  @ViewChild('entityAfterTemplate') entityAfterTemplate: TemplateRef<any>;
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;

  private dataChanges: Subscription;

  // Property to store route data
  public routeData: any;

  public perPage = 10;
  public tableComponentDto = new TableComponentDto();

  // Expose the enum to the template
  public auditLogMode = ApplicationMode;

  public currentMode: ApplicationMode;

  public appCentricConfig: TableConfig<any> = {
    description: 'Audit Log',
    columns: [
      { name: 'Action', property: 'actionType' },
      { name: 'Object Type', property: 'entityType' },
      { name: 'Tenant Name', property: 'tenantName' },
      { name: 'Object Name', template: () => this.entityAfterTemplate },
      { name: 'User', property: 'changedBy' },
      { name: 'Timestamp', property: 'timestamp' },
    ],
  };

  public config: TableConfig<any> = {
    description: 'Audit Log',
    columns: [
      { name: 'Action', property: 'actionType' },
      { name: 'Object Type', property: 'entityType' },
      { name: 'Tier Name', property: 'tierName' },
      { name: 'Object Name', template: () => this.entityAfterTemplate },
      { name: 'User', property: 'changedBy' },
      { name: 'Timestamp', property: 'timestamp' },
    ],
  };

  public tenantV2Config: TableConfig<any> = {
    description: 'Audit Log',
    columns: [
      { name: 'Action', property: 'actionType' },
      { name: 'Object Type', property: 'entityType' },
      { name: 'Tenant Name', property: 'tenantName' },
      { name: 'Object Name', template: () => this.entityAfterTemplate },
      { name: 'User', property: 'changedBy' },
      { name: 'Timestamp', property: 'timestamp' },
    ],
  };

  public auditLogs;
  public tiers: Tier[] = [];
  public networkObjects: NetworkObject[] = [];
  public networkObjectGroups: NetworkObjectGroup[] = [];
  public serviceObjects: ServiceObject[] = [];
  public serviceObjectGroups: ServiceObjectGroup[] = [];
  public isLoading = false;
  public showingAppCentricLogs = true;
  selectedAuditLog;

  routeProfiles: RouteProfile[];
  l3Outs: L3Out[];
  appProfiles: ApplicationProfile[];
  bridgeDomains: BridgeDomain[];
  endpointGroups: EndpointGroup[];
  providedContracts: Contract[];
  consumedContracts: Contract[];
  vrfs: Vrf[];

  appCentricTenants: GetManyTenantResponseDto;

  constructor(
    private auditLogService: V1AuditLogService,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private route: ActivatedRoute,
    private appCentricTenantService: V2AppCentricTenantsService,
    private appProfileService: V2AppCentricApplicationProfilesService,
    private routeProfileService: V2AppCentricRouteProfilesService,
    private l3OutService: V2AppCentricL3outsService,
  ) {
    // We'll determine the mode in ngOnInit after we have access to route data
    this.currentMode = ApplicationMode.NETCENTRIC; // Default mode
  }

  getAppCentricObjects(): void {
    const appProfileRequest = this.appProfileService.getManyApplicationProfile({
      fields: ['id,name'],
      perPage: 50000,
    });
    const routeProfileRequest = this.routeProfileService.getManyRouteProfile({
      fields: ['id,name'],
      perPage: 50000,
    });
    const l3OutRequest = this.l3OutService.getManyL3Out({
      fields: ['id,name'],
      perPage: 50000,
    });
    forkJoin([appProfileRequest, routeProfileRequest, l3OutRequest]).subscribe((result: unknown) => {
      this.appProfiles = (result as ApplicationProfile)[0];
      this.routeProfiles = (result as RouteProfile)[1];
      this.l3Outs = (result as L3Out)[2];
      this.getAppCentricAuditLogs();
    });
  }

  getAppCentricAuditLogs(event?): void {
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }

    this.auditLogService
      .getAllAppCentricLogsAuditLog({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(data => {
        this.auditLogs = data;
        this.auditLogs.data.map(log => {
          log.tenantName = ObjectUtil.getObjectName(log.tenantId, this.appCentricTenants.data);
          if (log.actionType === AuditLogActionTypeEnum.Update) {
            const messageArray = [];
            const keys = Object.keys(log.entityBefore);
            // get the entity before and entity after object
            const { entityBefore, entityAfter } = log;

            keys.map(key => {
              if (key === 'updatedAt') {
                return;
              }
              if (entityBefore[key] === undefined || entityAfter[key] === undefined) {
                return;
              }

              // will need to handle object-to-object relational additions/subtractions
              if (key === 'l3outs' || key === 'filters') {
                let beforeList;
                let afterList;
                beforeList = entityBefore[key]?.map(obj => obj?.name);
                afterList = entityAfter[key]?.map(obj => obj?.name);

                if (entityBefore[key] === undefined || entityAfter[key] === undefined) {
                  return;
                }
                const message = { propertyName: key, before: beforeList, after: afterList };
                messageArray.push(message);
                return;
              }

              if (key === 'consumedContracts') {
                let beforeList;
                let afterList;

                beforeList = entityBefore[key]?.map(obj => obj?.name);
                afterList = entityAfter[key]?.map(obj => obj?.name);

                if (JSON.stringify(beforeList) === JSON.stringify(afterList)) {
                  return;
                }
                const message = { propertyName: key, before: beforeList, after: afterList };
                messageArray.push(message);
                return;
              }
              if (key === 'providedContracts') {
                let beforeList;
                let afterList;

                beforeList = entityBefore[key]?.map(obj => obj?.name);
                afterList = entityAfter[key]?.map(obj => obj?.name);

                if (JSON.stringify(beforeList) === JSON.stringify(afterList)) {
                  return;
                }
                const message = { propertyName: key, before: beforeList, after: afterList };
                messageArray.push(message);
                return;
              }

              if (entityBefore[key] !== entityAfter[key]) {
                if (key.includes('Id')) {
                  let beforeMatch;
                  let afterMatch;
                  const lowerCaseKey = key.toLocaleLowerCase();
                  if (lowerCaseKey === 'routeprofileid') {
                    beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.routeProfiles);
                    beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                    entityBefore[key] = beforeMatch;
                    afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.routeProfiles);
                    afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                    entityAfter[key] = afterMatch;
                  }
                  if (lowerCaseKey.includes('consumedcontractid')) {
                    beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.consumedContracts);
                    beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                    entityBefore[key] = beforeMatch;
                    afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.consumedContracts);
                    afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                    entityAfter[key] = afterMatch;
                  }
                  if (lowerCaseKey === 'l3outforrouteprofileid') {
                    beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.l3Outs);
                    beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                    entityBefore[key] = beforeMatch;
                    afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.l3Outs);
                    afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                    entityAfter[key] = afterMatch;
                  }
                }
                const message = { propertyName: key, before: entityBefore[key], after: entityAfter[key] };
                messageArray.push(message);
              }
            });

            messageArray.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
            log.changedProperties = messageArray;
          }
        });
      });
  }

  public getAuditLogs(event?): void {
    this.isLoading = true;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }

    this.auditLogService
      .getAuditLogAuditLog({
        datacenterId: `${this.currentDatacenter.id}`,
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.auditLogs = data;
          if (this.auditLogs.data) {
            this.auditLogs.data.map(log => {
              log.tierName = ObjectUtil.getObjectName(log.tierId, this.tiers);
              // if entityType is firewall rule or nat rule
              // append the group name to the tier name
              if (log.entityType === 'FirewallRule' || log.entityType === 'NatRule') {
                log.tierName = `${log.tierName} - ${log.groupName}`;
              }
              // if the action type is of type "update"
              if (log.actionType === AuditLogActionTypeEnum.Update) {
                const messageArray = [];
                const keys = Object.keys(log.entityBefore);
                // get the entity before and entity after object
                const { entityBefore, entityAfter } = log;
                keys.map(key => {
                  // no need to show this property as a changed value
                  if (key === 'updatedAt') {
                    return;
                  }
                  // if adding or removing an object from a group, show the before and after object names
                  if (
                    key === 'networkObjects' ||
                    key === 'serviceObjects' ||
                    key === 'profiles' ||
                    key === 'policies' ||
                    key === 'irules' ||
                    key === 'pools' ||
                    key === 'healthMonitors' ||
                    key === 'pools' ||
                    key === 'nodes' ||
                    key === 'fromZone' ||
                    key === 'toZone'
                  ) {
                    let beforeList;
                    let afterList;
                    if (key === 'nodes') {
                      if (entityBefore[key] === undefined || entityAfter[key] === undefined) {
                        return;
                      }
                      if (entityBefore[key]) {
                        beforeList = entityBefore[key]?.map(obj => obj?.loadBalancerNode?.name);
                      }
                      if (entityAfter[key]) {
                        afterList = entityAfter[key]?.map(obj => obj?.loadBalancerNode?.name);
                      }
                    } else {
                      if (log.entityType === 'NatRule' && key === 'toZone') {
                        beforeList = entityBefore[key]?.name;
                        afterList = entityAfter[key]?.name;
                      } else {
                        beforeList = entityBefore[key]?.map(obj => obj?.name);
                        afterList = entityAfter[key]?.map(obj => obj?.name);
                      }
                    }

                    if (JSON.stringify(beforeList) === JSON.stringify(afterList)) {
                      return;
                    }
                    const message = { propertyName: key, before: beforeList, after: afterList };
                    messageArray.push(message);
                    return;
                  }
                  // if a property on the "before" entity does not match a property on the "after" entity, we know
                  // that the value of that property has changed
                  if (entityBefore[key] !== entityAfter[key]) {
                    if (key.includes('Id')) {
                      let beforeMatch;
                      let afterMatch;
                      const lowerCaseKey = key.toLocaleLowerCase();
                      /* tslint:disable */
                      if (lowerCaseKey.includes('networkobjectid')) {
                        beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.networkObjects);
                        beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                        entityBefore[key] = beforeMatch;
                        afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.networkObjects);
                        afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                        entityAfter[key] = afterMatch;
                      } else if (lowerCaseKey.includes('networkobjectgroupid')) {
                        beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.networkObjectGroups);
                        beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                        entityBefore[key] = beforeMatch;
                        afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.networkObjectGroups);
                        afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                        entityAfter[key] = afterMatch;
                      } else if (lowerCaseKey.includes('serviceobjectid')) {
                        beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.serviceObjects);
                        beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                        entityBefore[key] = beforeMatch;
                        afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.serviceObjects);
                        afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                        entityAfter[key] = afterMatch;
                      } else if (lowerCaseKey.includes('serviceobjectgroupid')) {
                        beforeMatch = ObjectUtil.getObjectName(entityBefore[key], this.serviceObjectGroups);
                        beforeMatch === 'N/A' ? (beforeMatch = '-') : beforeMatch;
                        entityBefore[key] = beforeMatch;
                        afterMatch = ObjectUtil.getObjectName(entityAfter[key], this.serviceObjectGroups);
                        afterMatch === 'N/A' ? (afterMatch = '-') : afterMatch;
                        entityAfter[key] = afterMatch;
                      }
                      /* tslint:enable */
                    }
                    // so we create a string message listing the property that was changed and its "before" and "after" values
                    const message = { propertyName: key, before: entityBefore[key], after: entityAfter[key] };
                    messageArray.push(message);
                  }
                });
                // sort array of changedProperties by property name for readability
                // version is now always at bottom of list
                messageArray.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
                log.changedProperties = messageArray;
              } else if (log.actionType === AuditLogActionTypeEnum.Deploy) {
              }
            });
          }
        },
        () => {
          this.auditLogs = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  getObjects(): void {
    const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
      fields: ['id,name'],
      perPage: 50000,
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
      fields: ['id,name'],
      perPage: 50000,
    });
    const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
      fields: ['id,name'],
      perPage: 50000,
    });
    const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
      fields: ['id,name'],
      perPage: 50000,
    });
    forkJoin([networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest, serviceObjectGroupRequest]).subscribe(
      (result: unknown) => {
        this.networkObjects = (result as NetworkObject)[0];
        this.networkObjectGroups = (result as NetworkObjectGroup)[1];
        this.serviceObjects = (result as ServiceObject)[2];
        this.serviceObjectGroups = (result as ServiceObjectGroup)[3];
        this.getAuditLogs();
      },
    );
  }

  public getAppCentricTenants(): void {
    this.appCentricTenantService
      .getManyTenant({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(data => {
        this.appCentricTenants = data;
      });
    this.getAppCentricAuditLogs();
  }

  public getTiers(): void {
    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(data => {
        this.tiers = data.data;
        this.getObjects();
      });
  }

  public openDetailedModal(auditLog: any): void {
    if (auditLog.entityBefore) {
      auditLog.objectName = auditLog.entityBefore.name;
    } else if (auditLog.entityAfter) {
      auditLog.objectName = auditLog.entityAfter.name;
    } else {
      auditLog.objectName = 'unknown';
    }
    this.selectedAuditLog = { data: [auditLog], page: 1, pageCount: 1, count: 1, total: 1 };

    this.ngx.getModal('auditLogViewModal').open();
  }

  ngOnInit() {
    // Access route data first to determine the mode
    this.route.data.subscribe(data => {
      this.routeData = data;
      console.log('Route data:', this.routeData);

      // Set the mode from route data if it exists
      if (this.routeData && this.routeData.mode) {
        // Set mode explicitly from router configuration
        this.currentMode = this.routeData.mode;
        console.log(`Mode set from router config: ${this.currentMode}`);
      } else {
        // If no mode is specified in router config, use NETCENTRIC as default
        this.currentMode = ApplicationMode.NETCENTRIC;
        console.log(`No mode specified in route data. Using default mode: ${this.currentMode}`);
      }

      // Initialize based on the determined mode
      this.initializeForCurrentMode();
    });

    // Only observe datacenter changes for netcentric mode
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;

        // Only the netcentric mode needs to respond to datacenter changes
        if (this.currentMode === ApplicationMode.NETCENTRIC) {
          this.getTiers();
        }
      } else if (this.showingAppCentricLogs) {
        this.getAppCentricTenants();
        this.getAppCentricObjects();
      }
    });
  }

  /**
   * Initialize the component based on the current mode
   */
  private initializeForCurrentMode(): void {
    switch (this.currentMode) {
      case ApplicationMode.APPCENTRIC:
        this.getAppCentricTenants();
        this.getAppCentricObjects();
        break;

      case ApplicationMode.TENANTV2:
        this.getAppCentricTenants();
        this.getAppCentricObjects();
        break;

      case ApplicationMode.NETCENTRIC:
        // For netcentric mode, initialization will happen through the datacenter subscription
        break;
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getAuditLogs(event);
  }

  public onAppCentricTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getAppCentricAuditLogs(event);
  }

  public getTenantV2AuditLogs(event?): void {
    // Implementation for TenantV2 audit logs will go here
    // For now, it can be similar to AppCentric but with potentially different data handling
    this.getAppCentricAuditLogs(event);
  }

  public onTenantV2TableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getTenantV2AuditLogs(event);
  }
}
