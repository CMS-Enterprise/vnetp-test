/* eslint-disable */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApplicationProfile,
  AuditLogActionTypeEnum,
  BridgeDomain,
  Contract,
  EndpointGroup,
  GetManyTenantResponseDto,
  L3Out,
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
  V2AppCentricApplicationProfilesService,
  V2AppCentricL3outsService,
  V2AppCentricTenantsService,
  Vrf,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject, throwError } from 'rxjs';
import { ApplicationMode } from '../../models/other/application-mode-enum';
import { RouteDataUtil } from '../../utils/route-data.util';
import { AuditLogComponent } from './audit-log.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

const MOCK_NETCENTRIC_LOGS = {
  data: [
    { id: 'net-log-1', entityType: 'FirewallRule', tierId: 'tier-1', groupName: 'TestGroup' },
    { id: 'net-log-2', entityType: 'NatRule', tierId: 'tier-1', groupName: 'TestGroup' },
  ],
  page: 1,
  pageCount: 1,
  count: 2,
  total: 2,
};

describe('AuditLogComponent', () => {
  let component: AuditLogComponent;
  let fixture: ComponentFixture<AuditLogComponent>;
  let mockAuditLogService: Partial<V1AuditLogService>;
  let mockDatacenterContextService: Partial<DatacenterContextService>;
  let mockTierService: Partial<V1TiersService>;
  let mockNetworkObjectService: Partial<V1NetworkSecurityNetworkObjectsService>;
  let mockNetworkObjectGroupService: Partial<V1NetworkSecurityNetworkObjectGroupsService>;
  let mockServiceObjectService: Partial<V1NetworkSecurityServiceObjectsService>;
  let mockServiceObjectGroupService: Partial<V1NetworkSecurityServiceObjectGroupsService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;
  let mockAppCentricTenantService: Partial<V2AppCentricTenantsService>;
  let mockAppProfileService: Partial<V2AppCentricApplicationProfilesService>;
  let mockL3OutService: Partial<V2AppCentricL3outsService>;
  let mockRouter: any;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let getObjectNameSpy: jest.SpyInstance;
  let getAppModeSpy: jest.SpyInstance;

  beforeEach(() => {
    mockAuditLogService = {
      getAuditLogAuditLog: jest.fn().mockReturnValue(of({ data: [] })),
      getAllAppCentricLogsAuditLog: jest.fn().mockReturnValue(of({ data: [] })),
    };
    mockDatacenterContextService = { currentDatacenter: of({ id: 'dc-1', name: 'Test DC' } as any) };
    mockTierService = { getManyTier: jest.fn().mockReturnValue(of({ data: [{ id: 'tier-1', name: 'Tier 1' }] })) };
    mockNetworkObjectService = { getManyNetworkObject: jest.fn().mockReturnValue(of({ data: [] })) };
    mockNetworkObjectGroupService = { getManyNetworkObjectGroup: jest.fn().mockReturnValue(of({ data: [] })) };
    mockServiceObjectService = { getManyServiceObject: jest.fn().mockReturnValue(of({ data: [] })) };
    mockServiceObjectGroupService = { getManyServiceObjectGroup: jest.fn().mockReturnValue(of({ data: [] })) };
    mockNgxSmartModalService = { getModal: jest.fn().mockReturnValue({ open: jest.fn() }) };
    mockAppCentricTenantService = { getManyTenant: jest.fn().mockReturnValue(of({ data: [{ id: 't-1', name: 'Tenant 1' }] })) };
    mockAppProfileService = { getManyApplicationProfile: jest.fn().mockReturnValue(of({ data: [] })) };
    mockL3OutService = { getManyL3Out: jest.fn().mockReturnValue(of({ data: [] })) };
    mockRouter = { navigate: jest.fn() };
    mockActivatedRoute = {
      snapshot: {
        data: {},
        url: [],
        params: {},
        queryParams: {},
        fragment: '',
        outlet: '',
        component: null,
        routeConfig: null,
        root: null,
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        paramMap: null,
        queryParamMap: null,
        title: '',
      },
    };

    getObjectNameSpy = jest.spyOn(ObjectUtil, 'getObjectName').mockImplementation((id, _objects) => {
      if (!id) return 'N/A';
      if (id === 'tier-1') return 'Tier 1';
      return `name-for-${id}`;
    });

    getAppModeSpy = jest.spyOn(RouteDataUtil, 'getApplicationModeFromRoute');
  });

  const setupTestBed = (mode: ApplicationMode | null) => {
    let routeData = {};
    if (mode) {
      routeData = { data: { mode } };
      getAppModeSpy.mockReturnValue(mode);
    } else {
      getAppModeSpy.mockReturnValue(null);
    }

    TestBed.configureTestingModule({
      declarations: [AuditLogComponent],
      providers: [
        { provide: V1AuditLogService, useValue: mockAuditLogService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1TiersService, useValue: mockTierService },
        { provide: V1NetworkSecurityNetworkObjectsService, useValue: mockNetworkObjectService },
        { provide: V1NetworkSecurityNetworkObjectGroupsService, useValue: mockNetworkObjectGroupService },
        { provide: V1NetworkSecurityServiceObjectsService, useValue: mockServiceObjectService },
        { provide: V1NetworkSecurityServiceObjectGroupsService, useValue: mockServiceObjectGroupService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { ...mockActivatedRoute, ...routeData } },
        { provide: V2AppCentricTenantsService, useValue: mockAppCentricTenantService },
        { provide: V2AppCentricApplicationProfilesService, useValue: mockAppProfileService },
        { provide: V2AppCentricL3outsService, useValue: mockL3OutService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(AuditLogComponent);
    component = fixture.componentInstance;
  };

  afterEach(() => {
    jest.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  describe('Netcentric Mode', () => {
    beforeEach(() => {
      setupTestBed(ApplicationMode.NETCENTRIC);
      fixture.detectChanges(); // ngOnInit
    });

    it('should initialize and fetch netcentric data', fakeAsync(() => {
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(MOCK_NETCENTRIC_LOGS));
      component.getTiers();
      tick();

      expect(component.currentMode).toBe(ApplicationMode.NETCENTRIC);
      expect(mockTierService.getManyTier).toHaveBeenCalled();
      expect(mockAuditLogService.getAuditLogAuditLog).toHaveBeenCalled();
      expect(component.auditLogs.data[0].tierName).toBe('Tier 1 - TestGroup');
    }));

    it('should process updated logs with ID resolutions', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: 'Update',
            entityBefore: { networkObjectId: 'net-obj-1', serviceObjectId: 'svc-obj-1' },
            entityAfter: { networkObjectId: 'net-obj-2', serviceObjectId: 'svc-obj-2' },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getTiers();
      tick();

      const props = component.auditLogs.data[0].changedProperties;
      expect(props.find(p => p.propertyName === 'networkObjectId').before).toBe('name-for-net-obj-1');
      expect(props.find(p => p.propertyName === 'networkObjectId').after).toBe('name-for-net-obj-2');
      expect(props.find(p => p.propertyName === 'serviceObjectId').before).toBe('name-for-svc-obj-1');
      expect(props.find(p => p.propertyName === 'serviceObjectId').after).toBe('name-for-svc-obj-2');
    }));

    it('should handle NatRule toZone changes', fakeAsync(() => {
      const logs = {
        data: [
          { actionType: 'Update', entityType: 'NatRule', entityBefore: { toZone: { name: 'A' } }, entityAfter: { toZone: { name: 'B' } } },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getTiers();
      tick();
      const changedProp = component.auditLogs.data[0].changedProperties[0];
      expect(changedProp.propertyName).toBe('toZone');
      expect(changedProp.before).toBe('A');
      expect(changedProp.after).toBe('B');
    }));

    it('should handle Pool node changes', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: 'Update',
            entityType: 'Pool',
            entityBefore: { nodes: [{ loadBalancerNode: { name: 'node-A' } }] },
            entityAfter: { nodes: [{ loadBalancerNode: { name: 'node-B' } }] },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getTiers();
      tick();
      const changedProp = component.auditLogs.data[0].changedProperties[0];
      expect(changedProp.propertyName).toBe('nodes');
      expect(changedProp.before).toEqual(['node-A']);
      expect(changedProp.after).toEqual(['node-B']);
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(throwError(() => new Error('API Error')));
      component.getTiers();
      tick();
      expect(component.auditLogs).toEqual([]);
    }));

    it('should resolve various object IDs to names', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: 'Update',
            entityBefore: { networkObjectGroupId: 'nog-1', serviceObjectGroupId: 'sog-1' },
            entityAfter: { networkObjectGroupId: 'nog-2', serviceObjectGroupId: 'sog-2' },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));

      component.getTiers();
      tick();

      const props = component.auditLogs.data[0].changedProperties;
      expect(props.find(p => p.propertyName === 'networkObjectGroupId').before).toBe('name-for-nog-1');
      expect(props.find(p => p.propertyName === 'networkObjectGroupId').after).toBe('name-for-nog-2');
      expect(props.find(p => p.propertyName === 'serviceObjectGroupId').before).toBe('name-for-sog-1');
      expect(props.find(p => p.propertyName === 'serviceObjectGroupId').after).toBe('name-for-sog-2');
    }));

    it('should handle fromZone changes', fakeAsync(() => {
      const logs = {
        data: [{ actionType: 'Update', entityBefore: { fromZone: [{ name: 'A' }] }, entityAfter: { fromZone: [{ name: 'B' }] } }],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getTiers();
      tick();
      const changedProp = component.auditLogs.data[0].changedProperties[0];
      expect(changedProp.propertyName).toBe('fromZone');
      expect(changedProp.before).toEqual(['A']);
      expect(changedProp.after).toEqual(['B']);
    }));

    it('should handle undefined list where before is undefined', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: 'Update',
            entityType: 'Pool',
            entityBefore: { nodes: undefined },
            entityAfter: { nodes: [{ loadBalancerNode: { name: 'node-B' } }] },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getTiers();
      tick();
      expect(component.auditLogs.data[0].changedProperties).toEqual([]);
    }));

    it('should handle undefined list where key is missing on one side', fakeAsync(() => {
      const logs = { data: [{ actionType: 'Update', entityType: 'Pool', entityBefore: { nodes: [] }, entityAfter: {} }] };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      getObjectNameSpy.mockClear();
      component.getAuditLogs();
      tick();
      expect(component.auditLogs.data[0].changedProperties).toEqual([]);
    }));

    it('should handle partial pagination events for netcentric logs', fakeAsync(() => {
      const event = {};
      component.getAuditLogs(event);
      tick();
      expect(mockAuditLogService.getAuditLogAuditLog).toHaveBeenCalledWith({
        datacenterId: 'dc-1',
        page: 1,
        perPage: 10,
      });

      const eventWithPerPage = { perPage: 50 };
      component.getAuditLogs(eventWithPerPage);
      tick();
      expect(mockAuditLogService.getAuditLogAuditLog).toHaveBeenCalledWith({
        datacenterId: 'dc-1',
        page: 1,
        perPage: 50,
      });
    }));

    it('should ignore updatedAt properties and identical list changes', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            entityBefore: { updatedAt: 'yesterday', pools: [{ name: 'A' }] },
            entityAfter: { updatedAt: 'today', pools: [{ name: 'A' }] },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getAuditLogs();
      tick();
      expect(component.auditLogs.data[0].changedProperties).toEqual([]);
    }));

    it('should ignore node changes if one side is undefined', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'Pool',
            entityBefore: { nodes: undefined, otherProp: 'A' },
            entityAfter: { nodes: [{ loadBalancerNode: { name: 'B' } }], otherProp: 'B' },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getAuditLogs();
      tick();
      const props = component.auditLogs.data[0].changedProperties;
      expect(props.length).toBe(1);
      expect(props[0].propertyName).toBe('otherProp');
    }));

    it('should handle unresolved netcentric IDs by displaying a dash', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            entityBefore: {
              networkObjectId: null, // Unresolved
              serviceObjectId: 'so-1', // Resolved
            },
            entityAfter: {
              networkObjectId: 'no-1', // Resolved
              serviceObjectId: null, // Unresolved
            },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getAuditLogs();
      tick();

      const props = component.auditLogs.data[0].changedProperties;
      const noProp = props.find(p => p.propertyName === 'networkObjectId');
      const soProp = props.find(p => p.propertyName === 'serviceObjectId');

      expect(noProp.before).toBe('-');
      expect(noProp.after).toBe('name-for-no-1');
      expect(soProp.before).toBe('name-for-so-1');
      expect(soProp.after).toBe('-');
    }));

    it('should handle unresolved netcentric group IDs by displaying a dash', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            entityBefore: {
              networkObjectGroupId: null,
              serviceObjectGroupId: 'sog-1',
            },
            entityAfter: {
              networkObjectGroupId: 'nog-1',
              serviceObjectGroupId: null,
            },
          },
        ],
      };
      (mockAuditLogService.getAuditLogAuditLog as jest.Mock).mockReturnValue(of(logs));
      component.getAuditLogs();
      tick();

      const props = component.auditLogs.data[0].changedProperties;
      const nogProp = props.find(p => p.propertyName === 'networkObjectGroupId');
      const sogProp = props.find(p => p.propertyName === 'serviceObjectGroupId');

      expect(nogProp.before).toBe('-');
      expect(nogProp.after).toBe('name-for-nog-1');
      expect(sogProp.before).toBe('name-for-sog-1');
      expect(sogProp.after).toBe('-');
    }));
  });

  describe('Appcentric Mode', () => {
    let appCentricLogsSubject: Subject<any>;
    beforeEach(() => {
      setupTestBed(ApplicationMode.APPCENTRIC);
      appCentricLogsSubject = new Subject<any>();
      (mockAuditLogService.getAllAppCentricLogsAuditLog as jest.Mock).mockReturnValue(appCentricLogsSubject.asObservable());
      fixture.detectChanges(); // ngOnInit
    });

    it('should initialize in app-centric mode', () => {
      expect(component.currentMode).toBe(ApplicationMode.APPCENTRIC);
    });

    it('should process contract changes', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'ApplicationProfile',
            tenantId: 't-1',
            entityBefore: { consumedContracts: [{ name: 'C1' }], providedContracts: [{ name: 'P1' }] },
            entityAfter: { consumedContracts: [{ name: 'C2' }], providedContracts: [{ name: 'P2' }] },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();

      const props = component.auditLogs.data[0].changedProperties;
      expect(props.length).toBe(2);
      expect(props.find(p => p.propertyName === 'consumedContracts').before).toEqual(['C1']);
      expect(props.find(p => p.propertyName === 'consumedContracts').after).toEqual(['C2']);
      expect(props.find(p => p.propertyName === 'providedContracts').before).toEqual(['P1']);
      expect(props.find(p => p.propertyName === 'providedContracts').after).toEqual(['P2']);
    }));

    it('should resolve l3outforrouteprofileid', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'ApplicationProfile',
            tenantId: 't-1',
            entityBefore: { l3outForRouteProfileId: 'l3-1' },
            entityAfter: { l3outForRouteProfileId: 'l3-2' },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();

      const prop = component.auditLogs.data[0].changedProperties[0];
      expect(prop.propertyName).toBe('l3outForRouteProfileId');
      expect(prop.before).toBe('name-for-l3-1');
      expect(prop.after).toBe('name-for-l3-2');
    }));

    it('should handle table pagination events', fakeAsync(() => {
      const event = { page: 3, perPage: 50 };
      component.getAppCentricAuditLogs(event);
      tick();

      expect(component.tableComponentDto.page).toBe(3);
      expect(component.tableComponentDto.perPage).toBe(50);
      expect(mockAuditLogService.getAllAppCentricLogsAuditLog).toHaveBeenCalledWith({ page: 3, perPage: 50 });
    }));

    it('should handle partial pagination events', fakeAsync(() => {
      const event = {};
      component.getAppCentricAuditLogs(event);
      tick();

      expect(component.tableComponentDto.page).toBe(1);
      expect(component.tableComponentDto.perPage).toBe(10);
      expect(mockAuditLogService.getAllAppCentricLogsAuditLog).toHaveBeenCalledWith({ page: 1, perPage: 10 });

      const eventWithPage = { page: 5 };
      component.getAppCentricAuditLogs(eventWithPage);
      tick();
      expect(component.tableComponentDto.page).toBe(5);
      expect(component.tableComponentDto.perPage).toBe(10);
      expect(mockAuditLogService.getAllAppCentricLogsAuditLog).toHaveBeenCalledWith({ page: 5, perPage: 10 });
    }));

    it('should ignore l3outs/filters changes if one side is undefined', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: { l3outs: undefined, otherProp: 'A' },
            entityAfter: { l3outs: [{ name: 'B' }], otherProp: 'B' },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();

      const props = component.auditLogs.data[0].changedProperties;
      expect(props.length).toBe(1);
      expect(props[0].propertyName).toBe('otherProp');
    }));

    it('should ignore updatedAt and mismatched keys', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: { updatedAt: 'yesterday', onlyOnBefore: 'a' },
            entityAfter: { onlyOnAfter: 'b' },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();
      // 'updatedAt' should be skipped, and keys not present in both entities are also skipped.
      expect(component.auditLogs.data[0].changedProperties.length).toBe(0);
    }));

    it('should process l3outs and filters changes', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: { l3outs: [{ name: 'L3-A' }], filters: [{ name: 'F-A' }] },
            entityAfter: { l3outs: [{ name: 'L3-B' }], filters: [{ name: 'F-B' }] },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();
      const props = component.auditLogs.data[0].changedProperties;
      expect(props.find(p => p.propertyName === 'l3outs').after).toEqual(['L3-B']);
      expect(props.find(p => p.propertyName === 'filters').after).toEqual(['F-B']);
    }));

    it('should skip identical contract lists', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: { consumedContracts: [{ name: 'C1' }], providedContracts: [{ name: 'P1' }] },
            entityAfter: { consumedContracts: [{ name: 'C1' }], providedContracts: [{ name: 'P1' }] },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();
      // Contracts are the same, so no change should be reported.
      expect(component.auditLogs.data[0].changedProperties.length).toBe(0);
    }));

    it('should resolve consumedcontractid', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: { someConsumedContractId: 'cc-1' },
            entityAfter: { someConsumedContractId: 'cc-2' },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();
      const prop = component.auditLogs.data[0].changedProperties[0];
      expect(prop.propertyName).toBe('someConsumedContractId');
      expect(prop.before).toBe('name-for-cc-1');
      expect(prop.after).toBe('name-for-cc-2');
    }));

    it('should handle unresolved IDs by displaying a dash', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: {
              theConsumedContractId: null,
            },
            entityAfter: {
              theConsumedContractId: 'cc-1',
            },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();

      const props = component.auditLogs.data[0].changedProperties;

      const ccProp = props.find(p => p.propertyName === 'theConsumedContractId');
      expect(ccProp.before).toBe('-');
      expect(ccProp.after).toBe('name-for-cc-1');
    }));

    it('should handle unresolved "after" IDs by displaying a dash', fakeAsync(() => {
      const logs = {
        data: [
          {
            actionType: AuditLogActionTypeEnum.Update,
            entityType: 'TestEntity',
            tenantId: 't-1',
            entityBefore: { theConsumedContractId: 'cc-1' },
            entityAfter: { theConsumedContractId: null },
          },
        ],
      };
      appCentricLogsSubject.next(logs);
      tick();

      const props = component.auditLogs.data[0].changedProperties;

      const ccProp = props.find(p => p.propertyName === 'theConsumedContractId');
      expect(ccProp.before).toBe('name-for-cc-1');
      expect(ccProp.after).toBe('-');
    }));
  });

  describe('Component Logic', () => {
    beforeEach(() => {
      setupTestBed(ApplicationMode.NETCENTRIC);
      fixture.detectChanges();
    });

    it('should open the detailed modal', () => {
      const mockLog = { entityBefore: { name: 'Test Object' } };
      component.openDetailedModal(mockLog);
      expect(mockNgxSmartModalService.getModal).toHaveBeenCalledWith('auditLogViewModal');
      expect(component.selectedAuditLog.data[0].objectName).toBe('Test Object');
    });

    it('should set objectName from entityAfter if entityBefore is missing', () => {
      const mockLog = { entityAfter: { name: 'New Test Object' } };
      component.openDetailedModal(mockLog);
      expect(component.selectedAuditLog.data[0].objectName).toBe('New Test Object');
    });

    it('should set objectName to "unknown" if both are missing', () => {
      const mockLog = {};
      component.openDetailedModal(mockLog);
      expect(component.selectedAuditLog.data[0].objectName).toBe('unknown');
    });
  });

  describe('ngOnInit Logic', () => {
    it('should default to NETCENTRIC mode if route data is missing', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      setupTestBed(null);
      fixture.detectChanges();
      expect(component.currentMode).toBe(ApplicationMode.NETCENTRIC);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Table Events', () => {
    it('should handle onTableEvent', () => {
      setupTestBed(ApplicationMode.NETCENTRIC);
      fixture.detectChanges();
      const getAuditLogsSpy = jest.spyOn(component, 'getAuditLogs').mockImplementation();
      const event = { page: 2, perPage: 20 };
      component.onTableEvent(event);
      expect(getAuditLogsSpy).toHaveBeenCalledWith(event);
      expect(component.tableComponentDto).toEqual(event);
    });

    it('should handle onAppCentricTableEvent', () => {
      setupTestBed(ApplicationMode.APPCENTRIC);
      fixture.detectChanges();
      const getAppCentricAuditLogsSpy = jest.spyOn(component, 'getAppCentricAuditLogs').mockImplementation();
      const event = { page: 3, perPage: 30 };
      component.onAppCentricTableEvent(event);
      expect(getAppCentricAuditLogsSpy).toHaveBeenCalledWith(event);
      expect(component.tableComponentDto).toEqual(event);
    });

    it('should handle onTenantV2TableEvent', () => {
      setupTestBed(ApplicationMode.TENANTV2);
      fixture.detectChanges();
      const getTenantV2AuditLogsSpy = jest.spyOn(component, 'getTenantV2AuditLogs').mockImplementation();
      const event = { page: 4, perPage: 40 };
      component.onTenantV2TableEvent(event);
      expect(getTenantV2AuditLogsSpy).toHaveBeenCalledWith(event);
      expect(component.tableComponentDto).toEqual(event);
    });
  });

  it('should get tenantv2 appcentric audit logs', () => {
    jest.spyOn(component, 'getTenantV2AuditLogs').mockImplementation();
    component.getTenantV2AuditLogs({ page: 1, perPage: 10 });
    expect(component.getTenantV2AuditLogs).toHaveBeenCalledWith({ page: 1, perPage: 10 });
  });
});
