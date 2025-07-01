import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Datacenter, Tier } from 'client';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { LoadBalancersComponent } from './load-balancers.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';

jest.mock('src/app/utils/SubscriptionUtil', () => ({
  __esModule: true,
  default: {
    unsubscribe: jest.fn(),
  },
}));

describe('LoadBalancersComponent', () => {
  let component: LoadBalancersComponent;
  let fixture: ComponentFixture<LoadBalancersComponent>;
  let mockDatacenterContextService: Partial<DatacenterContextService>;
  let mockTierContextService: Partial<TierContextService>;
  let mockRouter: Partial<Router>;

  const MOCK_DATACENTER: Datacenter = { id: 'dc-1', name: 'Datacenter 1' };
  const MOCK_TIER: Tier = { id: 't-1', name: 'Tier 1', datacenterId: 'dc-1' };

  beforeEach(() => {
    const datacenterSubject = new BehaviorSubject<Datacenter>(MOCK_DATACENTER);
    const tierSubject = new BehaviorSubject<Tier>(MOCK_TIER);

    mockDatacenterContextService = {
      currentDatacenter: datacenterSubject.asObservable(),
    };
    mockTierContextService = {
      currentTier: tierSubject.asObservable(),
    };
    mockRouter = {
      navigate: jest.fn(),
      url: '/load-balancers/(load-balancer:virtual-servers)',
    };

    TestBed.configureTestingModule({
      declarations: [LoadBalancersComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: Router, useValue: mockRouter },
        { provide: TierContextService, useValue: mockTierContextService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadBalancersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should subscribe to data changes and set initial tab index', () => {
    expect((component as any).dataChanges).toBeDefined();
    expect(component.initialTabIndex).toBe(0); // Based on default mockRouter.url
    expect(component.currentDatacenter).toEqual(MOCK_DATACENTER);
    expect(component.currentTier).toEqual(MOCK_TIER);
  });

  it('ngOnDestroy should unsubscribe from data changes', () => {
    const sub = new Subscription();
    (component as any).dataChanges = sub;
    component.ngOnDestroy();
    expect(SubscriptionUtil.unsubscribe).toHaveBeenCalledWith([sub]);
  });

  describe('handleTabChange', () => {
    it('should navigate when datacenter and tier are set', () => {
      const tab: Tab = { name: 'Pools' };
      component.handleTabChange(tab);
      expect(mockRouter.navigate).toHaveBeenCalledWith([{ outlets: { 'load-balancer': ['pools'] } }], {
        queryParamsHandling: 'merge',
        relativeTo: {},
      });
    });

    it('should do nothing if datacenter is not set', () => {
      component.currentDatacenter = null;
      const tab: Tab = { name: 'Pools' };
      component.handleTabChange(tab);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should do nothing if tier is not set', () => {
      component.currentTier = null;
      const tab: Tab = { name: 'Pools' };
      component.handleTabChange(tab);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('getInitialTabIndex', () => {
    it('should return 0 if URL does not match', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/some/other/url',
      });
      expect((component as any).getInitialTabIndex()).toBe(0);
    });

    it('should return 0 if regex matches but page[1] is missing', () => {
      // This mocks a scenario where regex execution is abnormal
      const mockExecArray = ['some-match-but-no-capture'] as any;
      mockExecArray.index = 0;
      mockExecArray.input = 'mock-input';
      jest.spyOn(RegExp.prototype, 'exec').mockReturnValueOnce(mockExecArray);
      expect((component as any).getInitialTabIndex()).toBe(0);
    });

    it('should return correct index for a multi-segment route', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/load-balancers/(load-balancer:pools/relations)',
      });
      expect((component as any).getInitialTabIndex()).toBe(2);
    });

    it('should return 0 for an invalid but matching route', () => {
      Object.defineProperty(mockRouter, 'url', {
        get: () => '/load-balancers/(load-balancer:this/route/is/fake)',
      });
      expect((component as any).getInitialTabIndex()).toBe(0);
    });
  });
});
