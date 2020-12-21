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
import { LoadBalancerVirtualServer, Tier, V1LoadBalancerVirtualServersService } from 'api_client';
import { VirtualServerListComponent, ImportVirtualServer } from './virtual-server-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('VirtualServerListComponent', () => {
  let component: VirtualServerListComponent;
  let fixture: ComponentFixture<VirtualServerListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        VirtualServerListComponent,
        MockComponent('app-virtual-server-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerVirtualServersService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(VirtualServerListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    const virtualServerService = TestBed.inject(V1LoadBalancerVirtualServersService);
    const spy = jest.spyOn(virtualServerService, 'v1LoadBalancerVirtualServersGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'VirtualServer1', provisionedAt: {} },
        { id: '2', name: 'VirtualServer2' },
      ] as LoadBalancerVirtualServer[]) as any);
    });

    component.ngOnInit();

    const [virtualServer1, virtualServer2] = component.virtualServers;
    expect(virtualServer1).toEqual({
      id: '1',
      name: 'VirtualServer1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(virtualServer2).toEqual({
      id: '2',
      name: 'VirtualServer2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newVirtualServers = [{ name: 'VirtualServer1', vrfName: 'Tier1' }, { name: 'VirtualServer2' }] as ImportVirtualServer[];
    const virtualServerService = TestBed.inject(V1LoadBalancerVirtualServersService);
    const spy = jest.spyOn(virtualServerService, 'v1LoadBalancerVirtualServersBulkPost');

    component.import(newVirtualServers);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerVirtualServerBulkDto: {
        bulk: [{ name: 'VirtualServer1', tierId: '1', vrfName: 'Tier1' }, { name: 'VirtualServer2' }],
      },
    });
  });
});
