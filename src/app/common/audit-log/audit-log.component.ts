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
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { Router } from '@angular/router';

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

  public perPage = 20;
  public tableComponentDto = new TableComponentDto();

  public searchColumns: SearchColumnConfig[] = [
    {
      displayName: 'CR#',
      propertyName: 'changeRequestNumber',
      propertyType: 'string',
    },
  ];

  public appCentricConfig: TableConfig<any> = {
    description: 'App Centric Audit Log',
    columns: [
      { name: 'Action', property: 'actionType' },
      { name: 'Object Type', property: 'entityType' },
      { name: 'Tenant Name', property: 'tenantName' },
      { name: 'Object Name', template: () => this.entityAfterTemplate },
      { name: 'User', property: 'changedBy' },
      { name: 'Timestamp', property: 'timestamp' },
      { name: 'Change Request', property: 'changeRequestNumber' },
    ],
    hideAdvancedSearch: true,
    hideDefaultSearch: true,
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
      { name: 'Change Request', property: 'changeRequestNumber' },
    ],
    hideAdvancedSearch: true,
    hideDefaultSearch: true,
  };
  public auditLogs;
  public tiers: Tier[] = [];
  public networkObjects: NetworkObject[] = [];
  public networkObjectGroups: NetworkObjectGroup[] = [];
  public serviceObjects: ServiceObject[] = [];
  public serviceObjectGroups: ServiceObjectGroup[] = [];
  public isLoading = false;
  selectedAuditLog;

  routeProfiles: RouteProfile[];
  l3Outs: L3Out[];
  appProfiles: ApplicationProfile[];
  bridgeDomains: BridgeDomain[];
  endpointGroups: EndpointGroup[];
  providedContracts: Contract[];
  consumedContracts: Contract[];
  vrfs: Vrf[];

  showingAppCentricLogs = false;
  appCentricTenants: GetManyTenantResponseDto;

  constructor(
    private auditLogService: V1AuditLogService,
    private datacenterContextService: DatacenterContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {
    const match = this.router.routerState.snapshot.url.includes('appcentric');
    if (match) {
      this.showingAppCentricLogs = true;
    }
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
        this.showingAppCentricLogs = true;
        this.auditLogs = data;
      });
  }

  public searchAuditLogs(event?) {
    let eventParams;
    this.showingAppCentricLogs = false;
    this.isLoading = true;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      eventParams = `${propertyName}||cont||${searchText}`;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }
    this.auditLogService
      .searchAuditLogAuditLog({
        filter: [eventParams],
      })
      .subscribe(
        data => {
          this.auditLogs = data;
        },
        () => {
          this.auditLogs = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public searchAppCentricAuditLogs(event?) {
    let eventParams;
    this.isLoading = true;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      eventParams = `${propertyName}||cont||${searchText}`;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }
    this.auditLogService
      .searchAppCentricAuditLogAuditLog({
        filter: [eventParams],
      })
      .subscribe(
        data => {
          this.auditLogs = data;
        },
        () => {
          this.auditLogs = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public getAuditLogs(event?): void {
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
        },
        () => {
          this.auditLogs = [];
        },
        () => {},
      );
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
    if (this.showingAppCentricLogs) {
      this.getAppCentricAuditLogs();
    } else {
      this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
        if (cd) {
          this.currentDatacenter = cd;
          this.getAuditLogs();
        }
      });
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
}
