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
import { LoadBalancerRoute, Tier, V1LoadBalancerRoutesService } from 'api_client';
import { RouteListComponent, ImportRoute } from './route-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('RouteListComponent', () => {
  let component: RouteListComponent;
  let fixture: ComponentFixture<RouteListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        RouteListComponent,
        MockComponent('app-route-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerRoutesService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(RouteListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    const routeService = TestBed.inject(V1LoadBalancerRoutesService);
    const spy = jest.spyOn(routeService, 'v1LoadBalancerRoutesGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'Route1', provisionedAt: {} },
        { id: '2', name: 'Route2' },
      ] as LoadBalancerRoute[]) as any);
    });

    component.ngOnInit();

    const [route1, route2] = component.routes;
    expect(route1).toEqual({
      id: '1',
      name: 'Route1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(route2).toEqual({
      id: '2',
      name: 'Route2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newRoutes = [{ name: 'Route1', vrfName: 'Tier1' }, { name: 'Route2' }] as ImportRoute[];
    const routeService = TestBed.inject(V1LoadBalancerRoutesService);
    const spy = jest.spyOn(routeService, 'v1LoadBalancerRoutesBulkPost');

    component.import(newRoutes);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerRouteBulkDto: {
        bulk: [{ name: 'Route1', tierId: '1', vrfName: 'Tier1' }, { name: 'Route2' }],
      },
    });
  });
});
