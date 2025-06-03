import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeployComponent } from './deploy.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject } from 'rxjs';
import {
  V1TiersService,
  V1TierGroupsService,
  V1JobsService,
  FirewallRuleGroupTypeEnum,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkVlansService,
  V1NetworkSubnetsService,
  V1AuditLogService,
  AuditLogEntityTypeEnum,
} from 'client';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { MockProvider } from 'src/test/mock-providers';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

describe('DeployComponent', () => {
  let component: DeployComponent;
  let fixture: ComponentFixture<DeployComponent>;

  const testData = {
    datacenter: {
      id: '1',
      name: 'Datacenter',
    },
    tier: {
      item: {
        id: '1',
        datacenterId: '1',
        name: 'Tier1',
        firewallRuleGroups: [
          { tierId: '1', name: 'I', type: FirewallRuleGroupTypeEnum.Intervrf, id: '11', tenantVersion: null },
          { tierId: '1', name: 'E', type: FirewallRuleGroupTypeEnum.External, id: '22', tenantVersion: null },
        ],
      },
      isSelected: true,
      tenantVersion: '1',
    },
    getManyTierResponse: {
      data: [
        {
          id: '1',
          datacenterId: '1',
          name: 'Tier1',
          tenantVersion: '1',
          firewallRuleGroups: [
            { tierId: '1', name: 'I', type: FirewallRuleGroupTypeEnum.Intervrf, id: '11', tenantVersion: null },
            { tierId: '1', name: 'E', type: FirewallRuleGroupTypeEnum.External, id: '22', tenantVersion: null },
          ],
        },
      ],
    },
  };

  const datacenterSubject = new Subject();

  const mockAuditLogService = {
    getAuditLogByEntityIdAuditLog: jest.fn(),
  };

  beforeEach(() => {
    const datacenterService = {
      currentDatacenter: datacenterSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [DeployComponent, ResolvePipe, MockFontAwesomeComponent, MockNgxSmartModalComponent, MockYesNoModalComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1JobsService),
        MockProvider(V1TierGroupsService),
        MockProvider(V1TiersService, { getManyTier: of(testData.getManyTierResponse) }),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        MockProvider(V1NetworkSecurityNatRuleGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        MockProvider(V1NetworkVlansService),
        MockProvider(V1NetworkSubnetsService),
        { provide: V1AuditLogService, useValue: mockAuditLogService },
        { provide: DatacenterContextService, useValue: datacenterService },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DeployComponent);
        component = fixture.componentInstance;
        component.currentDatacenter = {
          id: '1',
          name: 'Datacenter1',
        };
        fixture.detectChanges();

        jest.clearAllMocks();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to load tiers and tier groups on init', () => {
    const tiersService = TestBed.inject(V1TiersService);
    const tierGroupService = TestBed.inject(V1TierGroupsService);

    datacenterSubject.next(testData.datacenter);

    expect(tiersService.getManyTier).toHaveBeenCalledWith({
      page: 1,
      perPage: 1000,
      filter: [`datacenterId||eq||${testData.datacenter.id}`, 'deletedAt||isnull'],
    });
    expect(tierGroupService.getManyTierGroup).toHaveBeenCalledWith({ filter: ['datacenterId||eq||1'], page: 1, perPage: 1000 });
    expect(component.tiers.length).toBe(1);
  });

  describe('getTierGroupName', () => {
    it('should return "N/A" when tier groups are not defined', () => {
      component.tierGroups = null;

      const tierGroupName = component.getTierGroupName('2');
      expect(tierGroupName).toBe('N/A');
    });

    it('should return "N/A" when the tier group is not found', () => {
      component.tierGroups = [];

      const tierGroupName = component.getTierGroupName('2');
      expect(tierGroupName).toBe('N/A');
    });

    it('should return the tier group name', () => {
      component.tierGroups = [{ datacenterId: '1', id: '2', name: 'Name', tiers: [] }];

      const tierGroupName = component.getTierGroupName('2');
      expect(tierGroupName).toBe('Name');
    });
  });

  describe('deployTiers', () => {
    it('should not open the confirmation modal when 0 tiers are selected', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      const spy = jest.spyOn(ngx, 'getModal');

      component.tiers = [];

      const deployButton = fixture.debugElement.query(By.css('.btn.btn-danger'));
      deployButton.nativeElement.click();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call to deploys tiers after confirming', () => {
      jest.spyOn(component, 'launchTierProvisioningJobs');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, confirmFn) => {
        confirmFn();
        return of().subscribe();
      });

      const launchTierProvisioningJobsSpy = jest.spyOn(component, 'launchTierProvisioningJobs');
      const deploySpy = jest.spyOn(component, 'deployTiers');

      component.tiers = [testData.tier];

      const jobService = TestBed.inject(V1JobsService);
      jest.spyOn(jobService, 'createOneJob');

      const deployButton = fixture.debugElement.query(By.css('.btn.btn-danger'));
      deployButton.nativeElement.click();
      expect(deploySpy).toHaveBeenCalled();
      expect(launchTierProvisioningJobsSpy).toHaveBeenCalled();
    });
  });

  describe('generateReport', () => {
    it('should accurately generate a report with differences for given audit logs', () => {
      const mockAuditLogs = [
        {
          id: '510d97e0-4050-4e84-a1e0-c60a26967c78',
          actionType: 'Update',
          entityType: 'FirewallRule',
          entityBefore: {
            id: '1263d980-1ad6-449d-8373-456e1881bd02',
            name: 'fw-rule2',
            action: 'Permit',
            sourceIpAddress: '10.0.0.1',
          },
          entityAfter: {
            id: '1263d980-1ad6-449d-8373-456e1881bd02',
            name: 'fw-rule2',
            action: 'Permit',
            sourceIpAddress: '10.0.0.2',
          },
          timestamp: '2024-03-13T20:29:25.398Z',
        },
      ];

      const reportEntries = component.generateReport(mockAuditLogs);

      expect(reportEntries.length).toBe(1); // Expecting one report entry
      expect(reportEntries[0].differences.length).toBeGreaterThan(0); // Expecting differences
      expect(reportEntries[0].differences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'sourceIpAddress',
            before: '10.0.0.1',
            after: '10.0.0.2',
          }),
        ]),
      );
    });

    it('should not include unchanged properties in the report', () => {
      const mockAuditLogs = [
        {
          id: '510d97e0-4050-4e84-a1e0-c60a26967c78',
          actionType: 'Update',
          entityType: 'FirewallRule',
          entityBefore: {
            id: '1263d980-1ad6-449d-8373-456e1881bd02',
            name: 'fw-rule2',
            action: 'Permit',
            sourceIpAddress: '10.0.0.1',
            toZone: [],
          },
          entityAfter: {
            id: '1263d980-1ad6-449d-8373-456e1881bd02',
            name: 'fw-rule2',
            action: 'Permit',
            sourceIpAddress: '10.0.0.1',
            toZone: [],
          },
          timestamp: '2024-03-13T20:29:25.398Z',
        },
      ];

      const reportEntries = component.generateReport(mockAuditLogs);
      expect(reportEntries.length).toBe(1);
      expect(reportEntries[0].differences).toBe('Entity state changed without specific property comparison.');
    });
  });

  describe('getObjectAuditLogEvents', () => {
    // Assuming your service is properly mocked
    beforeEach(() => {
      // Mock the service's method to return a promise that resolves to your mock data
      mockAuditLogService.getAuditLogByEntityIdAuditLog.mockReset();
      mockAuditLogService.getAuditLogByEntityIdAuditLog.mockReturnValue(of([]));
    });

    it('should call getAuditLogByEntityIdAuditLog with createdAt timestamp for a non-provisioned object', async () => {
      const mockObject = {
        id: 'test-object-id',
        updatedAt: '2024-03-15T00:00:00.000Z',
        provisionedAt: '',
        createdAt: '2024-03-13T00:00:00.000Z',
      };
      const type = AuditLogEntityTypeEnum.Vlan;

      await component.getObjectAuditLogEvents(mockObject, type);

      expect(mockAuditLogService.getAuditLogByEntityIdAuditLog).toHaveBeenCalledWith({
        entityId: mockObject.id,
        entityType: type,
        tenant: '1',
        afterTimestamp: mockObject.createdAt,
      });
    });

    it('should call getAuditLogByEntityIdAuditLog with updatedAt timestamp provisioned object that isnt a rule group', async () => {
      const mockObject = {
        id: 'test-object-id',
        updatedAt: '2024-03-15T00:00:00.000Z',
        provisionedAt: '2024-03-14T00:00:00.000Z',
        createdAt: '2024-03-13T10:00:00.000Z',
      };
      const type = AuditLogEntityTypeEnum.Vlan;

      await component.getObjectAuditLogEvents(mockObject, type);

      expect(mockAuditLogService.getAuditLogByEntityIdAuditLog).toHaveBeenCalledWith({
        entityId: mockObject.id,
        entityType: type,
        tenant: '1',
        afterTimestamp: mockObject.updatedAt,
      });
    });

    it('should call getAuditLogByEntityIdAuditLog with provisionedAt timestamp for provisioned firewall rule group', async () => {
      const mockObject = {
        id: 'test-object-id',
        updatedAt: '2024-03-15T00:00:00.000Z',
        provisionedAt: '2024-03-14T00:00:00.000Z',
        createdAt: '2024-03-13T10:00:00.000Z',
      };
      const type = AuditLogEntityTypeEnum.FirewallRuleGroup;

      await component.getObjectAuditLogEvents(mockObject, type);

      expect(mockAuditLogService.getAuditLogByEntityIdAuditLog).toHaveBeenCalledWith({
        entityId: mockObject.id,
        entityType: type,
        tenant: '1',
        afterTimestamp: mockObject.provisionedAt,
      });
    });

    it('should call getAuditLogByEntityIdAuditLog with provisionedAt timestamp for provisioned nat rule group', async () => {
      const mockObject = {
        id: 'test-object-id',
        updatedAt: '2024-03-15T00:00:00.000Z',
        provisionedAt: '2024-03-14T00:00:00.000Z',
        createdAt: '2024-03-13T10:00:00.000Z',
      };
      const type = AuditLogEntityTypeEnum.NatRuleGroup;

      await component.getObjectAuditLogEvents(mockObject, type);

      expect(mockAuditLogService.getAuditLogByEntityIdAuditLog).toHaveBeenCalledWith({
        entityId: mockObject.id,
        entityType: type,
        tenant: '1',
        afterTimestamp: mockObject.provisionedAt,
      });
    });

    it('should generate a report after retrieving audit log events', async () => {
      const mockAuditLogs = [
        /* Mock audit log data */
      ];
      mockAuditLogService.getAuditLogByEntityIdAuditLog.mockReturnValue(of(mockAuditLogs));

      const mockObject = {
        id: 'test-object-id',
        updatedAt: '2024-03-14T10:00:00.000Z',
        provisionedAt: '',
        createdAt: '2024-03-13T10:00:00.000Z',
      };
      const type = AuditLogEntityTypeEnum.ServiceObject;

      await component.getObjectAuditLogEvents(mockObject, type);

      expect(component.report).toEqual(component.generateReport(mockAuditLogs));
    });
  });

  it('should generate where param query', () => {
    const tierId = 'test';

    const where = component.getUndeployedOrNewObjects(tierId);

    expect(where).toEqual(
      JSON.stringify({
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
              eq: 'test',
            },
          },
        ],
      }),
    );
  });

  describe('toggleExpand', () => {
    beforeEach(() => {
      component.expandedRows = []; // Reset expandedRows before each test
    });

    it('should add an index to expandedRows if it is not present', () => {
      const indexToAdd = 1;
      component.toggleExpand(indexToAdd);
      expect(component.expandedRows.includes(indexToAdd)).toBeTruthy();
    });

    it('should remove an index from expandedRows if it is already present', () => {
      const indexToRemove = 2;
      // Pre-add the index to simulate it being there from previous interactions
      component.expandedRows.push(indexToRemove);
      component.toggleExpand(indexToRemove);
      expect(component.expandedRows.includes(indexToRemove)).toBeFalsy();
    });

    it('should not affect other indices when one is toggled', () => {
      const initialIndices = [3, 4];
      component.expandedRows = [...initialIndices];
      const indexToToggle = 5;

      component.toggleExpand(indexToToggle); // Add new index
      expect(component.expandedRows.includes(indexToToggle)).toBeTruthy();
      expect(component.expandedRows).toEqual([...initialIndices, indexToToggle]);

      component.toggleExpand(indexToToggle); // Remove it again
      expect(component.expandedRows.includes(indexToToggle)).toBeFalsy();
      expect(component.expandedRows).toEqual(initialIndices);
    });
  });
});
