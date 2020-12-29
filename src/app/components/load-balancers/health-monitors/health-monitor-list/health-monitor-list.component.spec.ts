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
import { LoadBalancerHealthMonitor, Tier, V1LoadBalancerHealthMonitorsService } from 'api_client';
import { HealthMonitorListComponent, ImportHealthMonitor } from './health-monitor-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('HealthMonitorListComponent', () => {
  let component: HealthMonitorListComponent;
  let fixture: ComponentFixture<HealthMonitorListComponent>;
  let service: V1LoadBalancerHealthMonitorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        HealthMonitorListComponent,
        MockComponent('app-health-monitor-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerHealthMonitorsService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(HealthMonitorListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerHealthMonitorsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    jest.spyOn(service, 'v1LoadBalancerHealthMonitorsGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'HealthMonitor1', provisionedAt: {} },
        { id: '2', name: 'HealthMonitor2' },
      ] as LoadBalancerHealthMonitor[]) as any);
    });

    component.ngOnInit();

    const [healthMonitor1, healthMonitor2] = component.healthMonitors;
    expect(healthMonitor1).toEqual({
      id: '1',
      name: 'HealthMonitor1',
      provisionedAt: {},
      state: 'Provisioned',
    });

    expect(healthMonitor2).toEqual({
      id: '2',
      name: 'HealthMonitor2',
      state: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    const healthMonitors = [{ name: 'HealthMonitor1', vrfName: 'Tier1' }, { name: 'HealthMonitor2' }] as ImportHealthMonitor[];
    const spy = jest.spyOn(service, 'v1LoadBalancerHealthMonitorsBulkPost');

    component.import(healthMonitors);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerHealthMonitorBulkDto: {
        bulk: [{ name: 'HealthMonitor1', tierId: '1', vrfName: 'Tier1' }, { name: 'HealthMonitor2' }],
      },
    });
  });

  it('should delete a health monitor', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as LoadBalancerHealthMonitor);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a health monitor', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerHealthMonitorsIdRestorePatch');

    component.restore({} as LoadBalancerHealthMonitor);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as LoadBalancerHealthMonitor);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });
});
