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
import { LoadBalancerNode, Tier, V1LoadBalancerNodesService } from 'api_client';
import { NodeListComponent, ImportNode } from './node-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('NodeListComponent', () => {
  let component: NodeListComponent;
  let fixture: ComponentFixture<NodeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NodeListComponent,
        MockComponent('app-node-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerNodesService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(NodeListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    const nodeService = TestBed.inject(V1LoadBalancerNodesService);
    const spy = jest.spyOn(nodeService, 'v1LoadBalancerNodesGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'Node1', provisionedAt: {} },
        { id: '2', name: 'Node2' },
      ] as LoadBalancerNode[]) as any);
    });

    component.ngOnInit();

    const [node1, node2] = component.nodes;
    expect(node1).toEqual({
      id: '1',
      name: 'Node1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(node2).toEqual({
      id: '2',
      name: 'Node2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newNodes = [{ name: 'Node1', vrfName: 'Tier1' }, { name: 'Node2' }] as ImportNode[];
    const nodeService = TestBed.inject(V1LoadBalancerNodesService);
    const spy = jest.spyOn(nodeService, 'v1LoadBalancerNodesBulkPost');

    component.import(newNodes);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerNodeBulkDto: {
        bulk: [{ name: 'Node1', tierId: '1', vrfName: 'Tier1' }, { name: 'Node2' }],
      },
    });
  });
});
