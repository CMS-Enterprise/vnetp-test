import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  AuditLog,
  AuditLogActionTypeEnum,
  Datacenter,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  ServiceObjectGroup,
  Tier,
  V1AuditLogService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1TiersService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Subscription } from 'rxjs';
import { audit, first } from 'rxjs/operators';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { TableComponentDto } from '../../models/other/table-component-dto';

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

  public perPage = 10;
  public tableComponentDto = new TableComponentDto();

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
  public auditLogs;
  public tiers: Tier[] = [];
  public networkObjects = [];
  public networkObjectGroups = [];
  public serviceObjects = [];
  public serviceObjectGroups = [];
  public isLoading = false;
  selectedAuditLog;

  constructor(
    private auditLogService: V1AuditLogService,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private ngx: NgxSmartModalService,
  ) {}

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
                    key === 'nodes'
                  ) {
                    let beforeList;
                    let afterList;
                    if (key === 'nodes') {
                      if (entityBefore[key] === undefined || entityAfter[key] === undefined) {
                        return;
                      }
                      if (entityBefore[key]) {
                        beforeList = entityBefore[key].map(obj => {
                          return obj.loadBalancerNode.name;
                        });
                      }
                      if (entityAfter[key]) {
                        afterList = entityAfter[key].map(obj => {
                          return obj.loadBalancerNode.name;
                        });
                      }
                    } else {
                      beforeList = entityBefore[key].map(obj => {
                        return obj.name;
                      });
                      afterList = entityAfter[key].map(obj => {
                        return obj.name;
                      });
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

  // method for retrieving tiers and all objects within those tiers for object lookups
  // this seems to cause failures / hangups / pending calls that
  // can cascade throughout the app

  public getTiersWithObjects(): void {
    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`],
        join: ['networkObjects,networkObjectGroups,serviceObjects,serviceObjectGroups'],
      })
      .pipe(first())
      .subscribe((data: unknown) => {
        this.tiers = data as Tier[];
        this.tiers.map(tier => {
          this.networkObjects.push(...tier.networkObjects);
          this.networkObjectGroups.push(...tier.networkObjectGroups);
          this.serviceObjects.push(...tier.serviceObjects);
          this.serviceObjectGroups.push(...tier.serviceObjectGroups);
          this.getAuditLogs();
        });
      });
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
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getTiers();
      }
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getAuditLogs(event);
  }
}
