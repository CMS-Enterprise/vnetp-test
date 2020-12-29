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
import { LoadBalancerVirtualServer, Tier, V1LoadBalancerVirtualServersService, VirtualServerImportDto } from 'api_client';
import { VirtualServerListComponent, VirtualServerView } from './virtual-server-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('VirtualServerListComponent', () => {
  let component: VirtualServerListComponent;
  let fixture: ComponentFixture<VirtualServerListComponent>;
  let service: V1LoadBalancerVirtualServersService;

  beforeEach(() => {
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
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    component.datacenterId = '3';
    component.tiers = [component.currentTier];
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerVirtualServersService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map virtual servers', () => {
    const virtualServerService = TestBed.inject(V1LoadBalancerVirtualServersService);
    const spy = jest.spyOn(virtualServerService, 'v1LoadBalancerVirtualServersGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'VirtualServer1', provisionedAt: {}, defaultPool: { name: 'Pool1' } },
        { id: '2', name: 'VirtualServer2' },
      ] as LoadBalancerVirtualServer[]) as any);
    });

    component.ngOnInit();

    const [virtualServer1, virtualServer2] = component.virtualServers;
    expect(virtualServer1).toEqual({
      id: '1',
      name: 'VirtualServer1',
      provisionedAt: {},
      state: 'Provisioned',
      defaultPool: { name: 'Pool1' },
      defaultPoolName: 'Pool1',
    });

    expect(virtualServer2).toEqual({
      id: '2',
      name: 'VirtualServer2',
      state: 'Not Provisioned',
      defaultPoolName: '--',
    });
  });

  it('should import virtual servers', () => {
    const virtualServers = [{ name: 'VirtualServer1' }, { name: 'VirtualServer2' }] as VirtualServerImportDto[];
    const spy = jest.spyOn(service, 'v1LoadBalancerVirtualServersBulkImportPost');

    component.import(virtualServers);

    expect(spy).toHaveBeenCalledWith({
      virtualServerImportCollectionDto: {
        datacenterId: '3',
        virtualServers: [{ name: 'VirtualServer1' }, { name: 'VirtualServer2' }],
      },
    });
  });

  it('should delete a virtual server', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as VirtualServerView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a virtual server', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerVirtualServersIdRestorePatch');

    component.restore({} as VirtualServerView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as VirtualServerView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });
});
