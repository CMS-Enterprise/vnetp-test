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
import { LoadBalancerRoute, Tier, V1LoadBalancerRoutesService } from 'client';
import { RouteListComponent, ImportRoute, RouteView } from './route-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';

describe('RouteListComponent', () => {
  let component: RouteListComponent;
  let fixture: ComponentFixture<RouteListComponent>;
  let service: V1LoadBalancerRoutesService;

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
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerRoutesService),
      ],
    });

    fixture = TestBed.createComponent(RouteListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerRoutesService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map routes', () => {
    jest.spyOn(service, 'getManyLoadBalancerRoute').mockImplementation(() => {
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
      nameView: 'Route1',
      provisionedAt: {},
      state: 'Provisioned',
    });

    expect(route2).toEqual({
      id: '2',
      name: 'Route2',
      nameView: 'Route2',
      state: 'Not Provisioned',
    });
  });

  it('should default routes to be empty on error', () => {
    component.routes = [{ id: '1', name: 'Route1' }] as RouteView[];
    jest.spyOn(service, 'getManyLoadBalancerRoute').mockImplementation(() => throwError(''));

    component.ngOnInit();

    expect(component.routes).toEqual([]);
  });

  it('should import routes', () => {
    const routes = [{ name: 'Route1', vrfName: 'Tier1' }, { name: 'Route2' }] as ImportRoute[];
    const spy = jest.spyOn(service, 'createManyLoadBalancerRoute');

    component.import(routes);

    expect(spy).toHaveBeenCalledWith({
      createManyLoadBalancerRouteDto: {
        bulk: [{ name: 'Route1', tierId: '1', vrfName: 'Tier1' }, { name: 'Route2' }],
      },
    });
  });

  it('should delete a route', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as RouteView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a route', () => {
    const spy = jest.spyOn(service, 'restoreOneLoadBalancerRoute');

    component.restore({} as RouteView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as RouteView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should open the modal to create a route', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    const spy = jest.spyOn(ngx, 'open');

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('routeModal');
  });
});
