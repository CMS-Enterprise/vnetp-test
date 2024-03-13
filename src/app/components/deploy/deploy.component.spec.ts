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
          { tierId: '1', name: 'I', type: FirewallRuleGroupTypeEnum.Intervrf, id: '11' },
          { tierId: '1', name: 'E', type: FirewallRuleGroupTypeEnum.External, id: '22' },
        ],
      },
      isSelected: true,
    },
    getManyTierResponse: {
      data: [
        {
          id: '1',
          datacenterId: '1',
          name: 'Tier1',
          firewallRuleGroups: [
            { tierId: '1', name: 'I', type: FirewallRuleGroupTypeEnum.Intervrf, id: '11' },
            { tierId: '1', name: 'E', type: FirewallRuleGroupTypeEnum.External, id: '22' },
          ],
        },
      ],
    },
  };

  const datacenterSubject = new Subject();

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
        MockProvider(V1AuditLogService),
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
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, confirmFn) => {
        confirmFn();
        return of().subscribe();
      });

      component.tiers = [testData.tier];

      const jobService = TestBed.inject(V1JobsService);
      const deploySpy = jest.spyOn(jobService, 'createOneJob');

      const deployButton = fixture.debugElement.query(By.css('.btn.btn-danger'));
      deployButton.nativeElement.click();
      expect(deploySpy).toHaveBeenCalled();
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
});
