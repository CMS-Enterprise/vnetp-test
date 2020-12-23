import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import {
  LoadBalancerPool,
  LoadBalancerPoolBulkImportDto,
  LoadBalancerPoolLoadBalancingMethod,
  Tier,
  V1LoadBalancerPoolsService,
} from 'api_client';
import { PoolListComponent } from './pool-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('PoolListComponent', () => {
  let component: PoolListComponent;
  let fixture: ComponentFixture<PoolListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PoolListComponent,
        MockComponent('app-pool-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerPoolsService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(PoolListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.datacenterId = '3';
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map pools', () => {
    const poolService = TestBed.inject(V1LoadBalancerPoolsService);
    jest.spyOn(poolService, 'v1LoadBalancerPoolsIdTierIdGet').mockImplementation(() => {
      return of(([
        {
          id: '1',
          name: 'Pool1',
          loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.PredictiveMember,
          provisionedAt: {},
          nodes: [{}],
          healthMonitors: [{}],
          defaultHealthMonitors: [{}],
        },
        { id: '2', name: 'Pool2', loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.DynamicRatioMember },
      ] as LoadBalancerPool[]) as any);
    });

    component.ngOnInit();

    const [pool1, pool2] = component.pools;
    expect(pool1).toEqual({
      defaultHealthMonitors: [{}],
      healthMonitors: [{}],
      id: '1',
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.PredictiveMember,
      methodName: 'Predictive Member',
      name: 'Pool1',
      nodes: [{}],
      provisionedAt: {},
      provisionedState: 'Provisioned',
      totalHealthMonitors: 2,
      totalNodes: 1,
    });

    expect(pool2).toEqual({
      id: '2',
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.DynamicRatioMember,
      methodName: 'Dynamic Ratio Member',
      name: 'Pool2',
      provisionedState: 'Not Provisioned',
      totalHealthMonitors: 0,
      totalNodes: 0,
    });
  });

  it('should import pools', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newPools = [{ name: 'Pool1' }, { name: 'Pool2' }] as LoadBalancerPoolBulkImportDto[];
    const poolService = TestBed.inject(V1LoadBalancerPoolsService);
    const spy = jest.spyOn(poolService, 'v1LoadBalancerPoolsBulkImportPost');

    component.import(newPools);

    expect(spy).toHaveBeenCalledWith({
      poolImportCollectionDto: {
        datacenterId: '3',
        pools: [{ name: 'Pool1' }, { name: 'Pool2' }],
      },
    });
  });
});
