import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerPool, Tier, V1LoadBalancerPoolsService } from 'api_client';
import { PoolListComponent, ImportPool } from './pool-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('PoolListComponent', () => {
  let component: PoolListComponent;
  let fixture: ComponentFixture<PoolListComponent>;

  beforeEach(async(() => {
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
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    const poolService = TestBed.inject(V1LoadBalancerPoolsService);
    const spy = jest.spyOn(poolService, 'v1LoadBalancerPoolsGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'Pool1', provisionedAt: {} },
        { id: '2', name: 'Pool2' },
      ] as LoadBalancerPool[]) as any);
    });

    component.ngOnInit();

    const [pool1, pool2] = component.pools;
    expect(pool1).toEqual({
      id: '1',
      name: 'Pool1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(pool2).toEqual({
      id: '2',
      name: 'Pool2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newPools = [{ name: 'Pool1', vrfName: 'Tier1' }, { name: 'Pool2' }] as ImportPool[];
    const poolService = TestBed.inject(V1LoadBalancerPoolsService);
    const spy = jest.spyOn(poolService, 'v1LoadBalancerPoolsBulkPost');

    component.import(newPools);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerPoolBulkDto: {
        bulk: [{ name: 'Pool1', tierId: '1', vrfName: 'Tier1' }, { name: 'Pool2' }],
      },
    });
  });
});
