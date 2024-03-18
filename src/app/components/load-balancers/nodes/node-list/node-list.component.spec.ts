import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockTooltipComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerNode, Tier, V1LoadBalancerNodesService } from 'client';
import { NodeListComponent, ImportNode, NodeView } from './node-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('NodeListComponent', () => {
  let component: NodeListComponent;
  let fixture: ComponentFixture<NodeListComponent>;
  let service: V1LoadBalancerNodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        NodeListComponent,
        MockComponent('app-node-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockTooltipComponent,
        MockComponent({
          selector: 'app-standard-component',
          inputs: ['config', 'searchColumns', 'perPage', 'objectType'],
        }),
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerNodesService),
      ],
    });

    fixture = TestBed.createComponent(NodeListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerNodesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map nodes', () => {
    jest.spyOn(service, 'getManyLoadBalancerNode').mockImplementation(() =>
      of({
        data: [
          { id: '1', name: 'Node1', provisionedAt: {}, autoPopulate: true, fqdn: 'www.google.com' },
          { id: '2', name: 'Node2', ipAddress: '192.168.1.1' },
        ] as LoadBalancerNode[],
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      } as any),
    );

    component.ngOnInit();

    const [node1, node2] = component.nodes.data;
    expect(node1).toEqual({
      autoPopulate: true,
      autoPopulateView: 'true',
      fqdn: 'www.google.com',
      id: '1',
      ipAddress: '--',
      name: 'Node1',
      nameView: 'Node1',
      provisionedAt: {},
      state: 'Provisioned',
    });

    expect(node2).toEqual({
      autoPopulateView: '--',
      fqdn: '--',
      id: '2',
      ipAddress: '192.168.1.1',
      name: 'Node2',
      nameView: 'Node2',
      state: 'Not Provisioned',
    });
  });

  // it('should default nodes to be empty on error', () => {
  //   component.nodes = {
  //     data: [{ id: '1', name: 'Node1' }],
  //     count: 1,
  //     total: 1,
  //     page: 1,
  //     pageCount: 1,
  //   } as GetManyLoadBalancerNodeResponseDto;
  //   jest.spyOn(service, 'getManyLoadBalancerNode').mockImplementation(() => throwError(''));

  //   component.ngOnInit();

  //   expect(component.nodes).toEqual(null);
  // });

  it('should import nodes', () => {
    const nodes = [{ name: 'Node1', tierName: 'Tier1' }, { name: 'Node2' }] as ImportNode[];
    const spy = jest.spyOn(service, 'createManyLoadBalancerNode');

    component.import(nodes);

    expect(spy).toHaveBeenCalledWith({
      createManyLoadBalancerNodeDto: {
        bulk: [{ name: 'Node1', tierId: '1', tierName: 'Tier1' }, { name: 'Node2' }],
      },
    });
  });

  it('should delete a node', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as NodeView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a node', () => {
    const spy = jest.spyOn(service, 'restoreOneLoadBalancerNode');

    component.restore({} as NodeView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as NodeView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  // it('should open the modal to create a node', () => {
  //   const ngx = TestBed.inject(NgxSmartModalService);
  //   const spy = jest.spyOn(ngx, 'open');

  //   const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
  //   createButton.nativeElement.click();

  //   expect(spy).toHaveBeenCalledWith('nodeModal');
  // });
});
