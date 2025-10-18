import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, of, throwError, BehaviorSubject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TenantGraphComponent } from './tenant-graph.component';
import { TenantGraphCoreService, PathTraceState, ContextMenuClickEvent } from '../../../../../services/tenant-graph';

// Mock the entire tenant-graph services module to avoid D3 import issues
jest.mock('../../../../../services/tenant-graph', () => ({
  TenantGraphCoreService: jest.fn().mockImplementation(() => ({
    renderGraph: jest.fn(),
    contextMenuClick: {
      subscribe: jest.fn(),
      emit: jest.fn(),
    },
    pathTraceStateChange: {
      subscribe: jest.fn(),
      emit: jest.fn(),
    },
  })),
  PathTraceState: {},
  ContextMenuClickEvent: {},
}));
import {
  V2AppCentricTenantsService,
  TenantConnectivityGraph,
  TenantConnectivityGraphNodesTypeEnum,
  TenantConnectivityGraphEdgesTypeEnum,
} from 'client';
import { TenantPortalNavigationService } from '../../../../../services/tenant-portal-navigation.service';
import { MockComponent } from '../../../../../../test/mock-components';

describe('TenantGraphComponent', () => {
  let component: TenantGraphComponent;
  let fixture: ComponentFixture<TenantGraphComponent>;
  let mockTenantService: jest.Mocked<V2AppCentricTenantsService>;
  let mockTenantGraphCore: jest.Mocked<TenantGraphCoreService>;
  let mockTenantPortalNavigation: jest.Mocked<TenantPortalNavigationService>;
  let mockActivatedRoute: any;
  let parentParentParamMapSubject: BehaviorSubject<any>;
  let contextMenuClickSubject: Subject<ContextMenuClickEvent>;
  let pathTraceStateChangeSubject: Subject<PathTraceState>;

  const mockGraph: TenantConnectivityGraph = {
    nodes: {
      tenant1: { id: 'tenant1', name: 'Tenant 1', type: TenantConnectivityGraphNodesTypeEnum.Tenant },
      fw1: { id: 'fw1', name: 'Firewall 1', type: TenantConnectivityGraphNodesTypeEnum.ExternalFirewall },
      sgfw1: { id: 'sgfw1', name: 'SG Firewall 1', type: TenantConnectivityGraphNodesTypeEnum.ServiceGraphFirewall },
    },
    edges: {
      edge1: {
        id: 'edge1',
        sourceNodeId: 'tenant1',
        targetNodeId: 'fw1',
        type: TenantConnectivityGraphEdgesTypeEnum.TenantContainsFirewall,
      },
      edge2: {
        id: 'edge2',
        sourceNodeId: 'tenant1',
        targetNodeId: 'sgfw1',
        type: TenantConnectivityGraphEdgesTypeEnum.ServiceGraphToFirewall,
      },
    },
    buildStrategy: 'default' as any,
    indexes: {} as any,
    routingPaths: [] as any,
    metadata: {} as any,
    utils: {} as any,
  } as TenantConnectivityGraph;

  const mockPathTraceState: PathTraceState = {
    selectedNodes: [
      { id: 'tenant1', name: 'Tenant 1', type: 'TENANT' },
      { id: 'fw1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL' },
    ],
    pathExists: true,
    highlightedPath: { nodes: ['tenant1', 'fw1'], edges: ['edge1'] },
    pathTraceData: {
      source: { id: 'tenant1', name: 'Tenant 1', type: 'TENANT' },
      target: { id: 'fw1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL' },
      path: [
        {
          nodeId: 'tenant1',
          edgeId: 'edge1',
          cost: 0,
          isLastHop: false,
          nodeName: 'Tenant 1',
          nodeType: 'TENANT',
          controlPlaneMetadata: { allowed: true, allowedReason: 'Contract allows traffic', generatedConfiguration: {} },
        },
        {
          nodeId: 'fw1',
          cost: 1,
          isLastHop: true,
          nodeName: 'Firewall 1',
          nodeType: 'EXTERNAL_FIREWALL',
          controlPlaneMetadata: { allowed: true, allowedReason: 'Firewall rule allows traffic', generatedConfiguration: {} },
        },
      ],
      isComplete: true,
      totalCost: 1,
    },
    showPathOnly: false,
  };

  beforeEach(async () => {
    parentParentParamMapSubject = new BehaviorSubject(new Map());
    contextMenuClickSubject = new Subject<ContextMenuClickEvent>();
    pathTraceStateChangeSubject = new Subject<PathTraceState>();

    mockTenantService = {
      buildTenantFullGraph: jest.fn().mockReturnValue(of(mockGraph) as any),
    } as any;

    mockTenantGraphCore = {
      renderGraph: jest.fn(),
      contextMenuClick: contextMenuClickSubject,
      pathTraceStateChange: pathTraceStateChangeSubject,
    } as any;

    mockTenantPortalNavigation = {
      navigateToFirewallConfig: jest.fn(),
    } as any;

    mockActivatedRoute = {
      parent: {
        parent: {
          paramMap: parentParentParamMapSubject.asObservable(),
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [TenantGraphComponent, MockComponent('fa-icon')],
      imports: [RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: TenantGraphCoreService, useValue: mockTenantGraphCore },
        { provide: TenantPortalNavigationService, useValue: mockTenantPortalNavigation },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantGraphComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.graph).toBeNull();
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.tenantId).toBeNull();
      expect(component.pathTraceState).toEqual({
        selectedNodes: [],
        pathExists: false,
        highlightedPath: undefined,
        pathTraceData: undefined,
        showPathOnly: false,
      });
    });
  });

  describe('Lifecycle Methods', () => {
    it('should extract tenant ID from route params and load graph', fakeAsync(() => {
      const paramMap = new Map();
      paramMap.set('id', 'tenant-123');
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);

      fixture.detectChanges();
      parentParentParamMapSubject.next(paramMap);
      tick(500);

      expect(component.tenantId).toBe('tenant-123');
      expect(mockTenantService.buildTenantFullGraph).toHaveBeenCalledWith({ id: 'tenant-123' });
      expect(component.graph).toEqual(mockGraph);
    }));

    it('should not load graph when no tenant ID in route params', fakeAsync(() => {
      parentParentParamMapSubject.next(new Map());
      fixture.detectChanges();
      tick(500);

      expect(component.tenantId).toBeUndefined();
      expect(mockTenantService.buildTenantFullGraph).not.toHaveBeenCalled();
    }));

    it('should subscribe to context menu clicks on init', fakeAsync(() => {
      fixture.detectChanges();
      tick(500);

      const contextMenuEvent: ContextMenuClickEvent = {
        node: { id: 'fw1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL' },
        nodeType: 'EXTERNAL_FIREWALL',
        nodeId: 'fw1',
        databaseId: 'fw1-db',
        menuItemIdentifier: 'edit-firewall',
      };

      const handleContextMenuClickSpy = jest.spyOn(component, 'handleContextMenuClick');
      contextMenuClickSubject.next(contextMenuEvent);

      expect(handleContextMenuClickSpy).toHaveBeenCalledWith(contextMenuEvent);
    }));

    it('should subscribe to path trace state changes on init', fakeAsync(() => {
      fixture.detectChanges();
      tick(500);

      pathTraceStateChangeSubject.next(mockPathTraceState);

      expect(component.pathTraceState).toEqual(mockPathTraceState);
    }));

    it('should complete destroy subject on destroy', () => {
      const destroySpy = jest.spyOn((component as any).destroy$, 'next');
      const completeDestroySpy = jest.spyOn((component as any).destroy$, 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeDestroySpy).toHaveBeenCalled();
    });
  });

  describe('Graph Loading', () => {
    beforeEach(() => {
      component.tenantId = 'tenant-123';
    });

    it('should load tenant graph successfully', fakeAsync(() => {
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);

      (component as any).loadTenantGraph();
      tick(500);

      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(component.graph).toEqual(mockGraph);
      expect(mockTenantService.buildTenantFullGraph).toHaveBeenCalledWith({ id: 'tenant-123' });
    }));

    it('should set loading state while loading graph', fakeAsync(() => {
      // Create a delayed observable to test loading state
      const delayedObservable = new Subject();
      mockTenantService.buildTenantFullGraph.mockReturnValue(delayedObservable as any);

      (component as any).loadTenantGraph();

      expect(component.isLoading).toBe(true);
      expect(component.error).toBeNull();

      // Complete the observable
      delayedObservable.next(mockGraph);
      delayedObservable.complete();
      tick(200); // Wait for setTimeout and any other timers

      expect(component.isLoading).toBe(false);
    }));

    it('should handle graph loading error', fakeAsync(() => {
      const errorMessage = 'Failed to load graph';
      mockTenantService.buildTenantFullGraph.mockReturnValue(throwError({ message: errorMessage }));

      (component as any).loadTenantGraph();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.error).toBe(errorMessage);
      expect(component.graph).toBeNull();
    }));

    it('should handle graph loading error without message', fakeAsync(() => {
      mockTenantService.buildTenantFullGraph.mockReturnValue(throwError({}));

      (component as any).loadTenantGraph();
      tick();

      expect(component.error).toBe('Failed to load tenant graph');
    }));

    it('should set error when no tenant ID available', () => {
      component.tenantId = null;

      (component as any).loadTenantGraph();

      expect(component.error).toBe('No tenant ID available');
      expect(mockTenantService.buildTenantFullGraph).not.toHaveBeenCalled();
    });
  });

  describe('Graph Rendering', () => {
    beforeEach(() => {
      component.graph = mockGraph;
    });

    it('should render graph with correct configuration', fakeAsync(() => {
      (component as any).renderGraph();
      tick(100);

      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalledWith({
        graph: mockGraph,
        containerSelector: '#tenantGraphContainer',
        svgSelector: '#tenantGraphSvg',
        hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL', 'INTERVRF_CONNECTION'],
        showLegend: true,
        enableOptimization: true,
        enableContextMenu: true,
        enablePathTrace: true,
        defaultEdgeWidth: 1.2,
        contextMenuConfig: {
          EXTERNAL_FIREWALL: [
            {
              type: 'item',
              name: 'Edit Firewall Config',
              identifier: 'edit-firewall',
              enabled: true,
            },
          ],
        },
      });
    }));

    it('should not render graph when no graph data available', fakeAsync(() => {
      component.graph = null;

      (component as any).renderGraph();
      tick(100);

      expect(mockTenantGraphCore.renderGraph).not.toHaveBeenCalled();
    }));

    it('should render graph after loading completes', fakeAsync(() => {
      // Reset the mock to ensure clean state
      mockTenantGraphCore.renderGraph.mockClear();
      component.tenantId = 'tenant-123';

      // Create a subject to control the observable timing
      const graphSubject = new Subject();
      mockTenantService.buildTenantFullGraph.mockReturnValue(graphSubject as any);

      (component as any).loadTenantGraph();

      // Complete the observable with graph data
      graphSubject.next(mockGraph);
      graphSubject.complete();
      tick(200); // Wait for both loading and rendering timeouts

      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalled();
    }));
  });

  describe('Context Menu Handling', () => {
    it('should handle external firewall context menu click', () => {
      const contextMenuEvent: ContextMenuClickEvent = {
        node: { id: 'fw1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL' },
        nodeType: 'EXTERNAL_FIREWALL',
        nodeId: 'fw1',
        databaseId: 'fw1-db',
        menuItemIdentifier: 'edit-firewall',
      };

      component.handleContextMenuClick(contextMenuEvent);

      expect(mockTenantPortalNavigation.navigateToFirewallConfig).toHaveBeenCalledWith(
        {
          type: 'external-firewall',
          firewallId: 'fw1',
          firewallName: 'Firewall 1',
        },
        mockActivatedRoute,
      );
    });

    it('should handle service graph firewall context menu click', () => {
      const contextMenuEvent: ContextMenuClickEvent = {
        node: { id: 'sgfw1', name: 'SG Firewall 1', type: 'SERVICE_GRAPH_FIREWALL' },
        nodeType: 'SERVICE_GRAPH_FIREWALL',
        nodeId: 'sgfw1',
        databaseId: 'sgfw1-db',
        menuItemIdentifier: 'edit-firewall',
      };

      component.handleContextMenuClick(contextMenuEvent);

      expect(mockTenantPortalNavigation.navigateToFirewallConfig).toHaveBeenCalledWith(
        {
          type: 'service-graph-firewall',
          firewallId: 'sgfw1',
          firewallName: 'SG Firewall 1',
        },
        mockActivatedRoute,
      );
    });

    it('should not handle context menu click for unsupported node types', () => {
      const contextMenuEvent: ContextMenuClickEvent = {
        node: { id: 'tenant1', name: 'Tenant 1', type: 'TENANT' },
        nodeType: 'TENANT',
        nodeId: 'tenant1',
        databaseId: 'tenant1-db',
        menuItemIdentifier: 'some-action',
      };

      component.handleContextMenuClick(contextMenuEvent);

      expect(mockTenantPortalNavigation.navigateToFirewallConfig).not.toHaveBeenCalled();
    });

    it('should not handle context menu click for unsupported menu items', () => {
      const contextMenuEvent: ContextMenuClickEvent = {
        node: { id: 'fw1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL' },
        nodeType: 'EXTERNAL_FIREWALL',
        nodeId: 'fw1',
        databaseId: 'fw1-db',
        menuItemIdentifier: 'unknown-action',
      };

      component.handleContextMenuClick(contextMenuEvent);

      expect(mockTenantPortalNavigation.navigateToFirewallConfig).not.toHaveBeenCalled();
    });
  });

  describe('Public Methods', () => {
    it('should refresh graph when refreshGraph is called', () => {
      component.tenantId = 'tenant-123';
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);
      const loadTenantGraphSpy = jest.spyOn(component, 'loadTenantGraph' as any);

      component.refreshGraph();

      expect(loadTenantGraphSpy).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network error during graph loading', fakeAsync(() => {
      component.tenantId = 'tenant-123';
      mockTenantService.buildTenantFullGraph.mockReturnValue(throwError({ status: 500, statusText: 'Server Error' }));

      (component as any).loadTenantGraph();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.error).toBe('Failed to load tenant graph');
      expect(component.graph).toBeNull();
    }));

    it('should handle timeout error during graph loading', fakeAsync(() => {
      component.tenantId = 'tenant-123';
      mockTenantService.buildTenantFullGraph.mockReturnValue(throwError({ name: 'TimeoutError' }));

      (component as any).loadTenantGraph();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.error).toBe('Failed to load tenant graph');
    }));

    it('should reset error state when loading new graph', () => {
      component.error = 'Previous error';
      component.tenantId = 'tenant-123';
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);

      (component as any).loadTenantGraph();

      expect(component.error).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full flow: route params -> load graph -> render graph', fakeAsync(() => {
      const paramMap = new Map();
      paramMap.set('id', 'tenant-123');
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);

      fixture.detectChanges();
      parentParentParamMapSubject.next(paramMap);
      tick(200); // Wait for both loading and rendering

      expect(component.tenantId).toBe('tenant-123');
      expect(component.graph).toEqual(mockGraph);
      expect(component.isLoading).toBe(false);
      expect(component.error).toBeNull();
      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalled();
    }));

    it('should handle route param changes', fakeAsync(() => {
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);

      fixture.detectChanges();

      // First tenant
      const paramMap1 = new Map();
      paramMap1.set('id', 'tenant-123');
      parentParentParamMapSubject.next(paramMap1);
      tick(500);

      expect(component.tenantId).toBe('tenant-123');
      expect(mockTenantService.buildTenantFullGraph).toHaveBeenCalledWith({ id: 'tenant-123' });

      // Second tenant
      const paramMap2 = new Map();
      paramMap2.set('id', 'tenant-456');
      parentParentParamMapSubject.next(paramMap2);
      tick(500);

      expect(component.tenantId).toBe('tenant-456');
      expect(mockTenantService.buildTenantFullGraph).toHaveBeenCalledWith({ id: 'tenant-456' });
      expect(mockTenantService.buildTenantFullGraph).toHaveBeenCalledTimes(2);
    }));

    it('should handle context menu and path trace events simultaneously', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const contextMenuEvent: ContextMenuClickEvent = {
        node: { id: 'fw1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL' },
        nodeType: 'EXTERNAL_FIREWALL',
        nodeId: 'fw1',
        databaseId: 'fw1-db',
        menuItemIdentifier: 'edit-firewall',
      };

      const handleContextMenuClickSpy = jest.spyOn(component, 'handleContextMenuClick');

      // Emit both events
      contextMenuClickSubject.next(contextMenuEvent);
      pathTraceStateChangeSubject.next(mockPathTraceState);

      expect(handleContextMenuClickSpy).toHaveBeenCalledWith(contextMenuEvent);
      expect(component.pathTraceState).toEqual(mockPathTraceState);
    }));
  });

  describe('Memory Management', () => {
    it('should properly clean up subscriptions', fakeAsync(() => {
      const paramMap = new Map();
      paramMap.set('id', 'tenant-123');
      mockTenantService.buildTenantFullGraph.mockReturnValue(of(mockGraph) as any);

      fixture.detectChanges();
      parentParentParamMapSubject.next(paramMap);
      tick(500);

      // Verify subscriptions are active
      expect(component.tenantId).toBe('tenant-123');

      // Destroy component
      component.ngOnDestroy();
      fixture.destroy();

      // Emit new values after destruction - should not affect component
      const newParamMap = new Map();
      newParamMap.set('id', 'tenant-999');
      parentParentParamMapSubject.next(newParamMap);
      contextMenuClickSubject.next({} as any);
      pathTraceStateChangeSubject.next({} as any);

      // Component state should remain unchanged
      expect(component.tenantId).toBe('tenant-123');
    }));
  });
});
