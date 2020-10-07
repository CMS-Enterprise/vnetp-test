import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DeployComponent } from './deploy.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockFontAwesomeComponent, MockComponent, MockNgxSmartModalComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject } from 'rxjs';
import { V1TiersService, V1TierGroupsService, V1JobsService, FirewallRuleGroupType } from 'api_client';
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
          { tierId: '1', name: 'I', type: FirewallRuleGroupType.Intervrf, id: '11' },
          { tierId: '1', name: 'E', type: FirewallRuleGroupType.External, id: '22' },
        ],
      },
      isSelected: true,
    },
  };

  const datacenterSubject = new Subject();

  beforeEach(async(() => {
    const datacenterService = {
      currentDatacenter: datacenterSubject.asObservable(),
    };
    const tiersService = {
      v1DatacentersDatacenterIdTiersGet: jest.fn(() => of([testData.tier.item])),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [DeployComponent, ResolvePipe, MockFontAwesomeComponent, MockNgxSmartModalComponent, MockYesNoModalComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1JobsService),
        MockProvider(V1TierGroupsService),
        { provide: DatacenterContextService, useValue: datacenterService },
        { provide: V1TiersService, useValue: tiersService },
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to load tiers and tier groups on init', () => {
    const tiersService = TestBed.get(V1TiersService);
    const tierGroupService = TestBed.get(V1TierGroupsService);

    datacenterSubject.next(testData.datacenter);

    expect(tiersService.v1DatacentersDatacenterIdTiersGet).toHaveBeenCalledWith({ datacenterId: '1', join: 'firewallRuleGroups' });
    expect(tierGroupService.v1TierGroupsGet).toHaveBeenCalledWith({ filter: 'datacenterId||eq||1' });
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
      const ngx = TestBed.get(NgxSmartModalService);
      const spy = jest.spyOn(ngx, 'getModal');

      component.tiers = [];

      const deployButton = fixture.debugElement.query(By.css('.btn.btn-danger'));
      deployButton.nativeElement.click();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should call to deploys tiers after confirming', () => {
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, confirmFn, closeFn) => {
        confirmFn();
        return of().subscribe();
      });

      component.tiers = [testData.tier];

      const jobService = TestBed.get(V1JobsService);
      const deploySpy = jest.spyOn(jobService, 'v1JobsPost');

      const deployButton = fixture.debugElement.query(By.css('.btn.btn-danger'));
      deployButton.nativeElement.click();
      expect(deploySpy).toHaveBeenCalled();
    });
  });
});
