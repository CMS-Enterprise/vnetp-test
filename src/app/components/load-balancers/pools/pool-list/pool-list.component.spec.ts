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
  GetManyLoadBalancerPoolResponseDto,
  LoadBalancerPool,
  LoadBalancerPoolBulkImportDto,
  LoadBalancerPoolLoadBalancingMethodEnum,
  Tier,
  V1LoadBalancerPoolsService,
} from 'client';
import { PoolListComponent, PoolView } from './pool-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';

describe('PoolListComponent', () => {
  let component: PoolListComponent;
  let fixture: ComponentFixture<PoolListComponent>;
  let service: V1LoadBalancerPoolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PoolListComponent,
        MockComponent('app-pool-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerPoolsService),
      ],
    });

    fixture = TestBed.createComponent(PoolListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerPoolsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map pools', () => {
    jest.spyOn(service, 'getPoolsLoadBalancerPool').mockImplementation(() => {
      return of({
        data: [
          {
            id: '1',
            name: 'Pool1',
            loadBalancingMethod: LoadBalancerPoolLoadBalancingMethodEnum.PredictiveMember,
            provisionedAt: {},
            nodes: [{}],
            healthMonitors: [{}],
            defaultHealthMonitors: [{}],
          },
          { id: '2', name: 'Pool2', loadBalancingMethod: LoadBalancerPoolLoadBalancingMethodEnum.DynamicRatioMember },
        ] as LoadBalancerPool[],
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      } as any);
    });

    component.ngOnInit();

    const [pool1, pool2] = component.pools.data;
    expect(pool1).toEqual({
      defaultHealthMonitors: [{}],
      healthMonitors: [{}],
      id: '1',
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethodEnum.PredictiveMember,
      methodName: 'Predictive Member',
      name: 'Pool1',
      nameView: 'Pool1',
      nodes: [{}],
      provisionedAt: {},
      state: 'Provisioned',
      totalHealthMonitors: 2,
      totalNodes: 1,
    });

    expect(pool2).toEqual({
      id: '2',
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethodEnum.DynamicRatioMember,
      methodName: 'Dynamic Ratio Member',
      name: 'Pool2',
      nameView: 'Pool2',
      state: 'Not Provisioned',
      totalHealthMonitors: 0,
      totalNodes: 0,
    });
  });

  // it('should default pools to be empty on error', () => {
  //   component.pools = {
  //     data: [{ id: '1', name: 'Pool1' }],
  //     count: 1,
  //     total: 1,
  //     page: 1,
  //     pageCount: 1,
  //   } as GetManyLoadBalancerPoolResponseDto;
  //   jest.spyOn(service, 'getPoolsLoadBalancerPool').mockImplementation(() => throwError(''));

  //   component.ngOnInit();

  //   expect(component.pools).toEqual(null);
  // });

  it('should import pools', () => {
    const pools = [{ name: 'Pool1' }, { name: 'Pool2' }] as LoadBalancerPoolBulkImportDto[];
    const spy = jest.spyOn(service, 'bulkImportPoolsLoadBalancerPool');

    component.import(pools);

    expect(spy).toHaveBeenCalledWith({
      poolImportCollectionDto: {
        datacenterId: '1',
        pools: [{ name: 'Pool1' }, { name: 'Pool2' }],
      },
    });
  });

  it('should delete a pool', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as PoolView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a pool', () => {
    const spy = jest.spyOn(service, 'restoreOneLoadBalancerPool');

    component.restore({} as PoolView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as PoolView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should open the modal to create a pool', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    const spy = jest.spyOn(ngx, 'open');

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('poolModal');
  });
});
