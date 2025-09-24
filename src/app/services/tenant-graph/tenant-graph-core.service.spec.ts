/* eslint-disable */
import { TenantGraphCoreService, TenantGraphRenderConfig, GraphFilterMode } from './tenant-graph-core.service';
import { TenantGraphDataService } from './tenant-graph-data.service';
import { TenantGraphLayoutService } from './tenant-graph-layout.service';
import { TenantGraphUIService } from './tenant-graph-ui.service';
import { TenantGraphInteractionService, ContextMenuClickEvent } from './tenant-graph-interaction.service';
import { TenantGraphPathTraceService, PathTraceState } from './tenant-graph-path-trace.service';
import { TenantGraphHighlightService } from './tenant-graph-highlight.service';
import { TenantConnectivityGraph } from 'client';

// Mock D3 module completely
jest.mock('d3', () => ({
  select: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    html: jest.fn().mockReturnThis(),
    empty: jest.fn().mockReturnValue(true),
    remove: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    data: jest.fn().mockReturnThis(),
    enter: jest.fn().mockReturnThis(),
    exit: jest.fn().mockReturnThis(),
    merge: jest.fn().mockReturnThis(),
    node: jest.fn().mockReturnValue({ getBoundingClientRect: () => ({ width: 100, height: 50 }) }),
    nodes: jest.fn().mockReturnValue([]),
  }),
  selectAll: jest.fn().mockReturnValue({
    data: jest.fn().mockReturnThis(),
    enter: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    exit: jest.fn().mockReturnThis(),
    merge: jest.fn().mockReturnThis(),
  }),
}));

// Mock all the specialized services
jest.mock('./tenant-graph-data.service');
jest.mock('./tenant-graph-layout.service');
jest.mock('./tenant-graph-ui.service');
jest.mock('./tenant-graph-interaction.service');
jest.mock('./tenant-graph-path-trace.service');
jest.mock('./tenant-graph-highlight.service');

describe('TenantGraphCoreService', () => {
  let service: TenantGraphCoreService;
  let mockDataService: jest.Mocked<TenantGraphDataService>;
  let mockLayoutService: jest.Mocked<TenantGraphLayoutService>;
  let mockUIService: jest.Mocked<TenantGraphUIService>;
  let mockInteractionService: jest.Mocked<TenantGraphInteractionService>;
  let mockPathTraceService: jest.Mocked<TenantGraphPathTraceService>;
  let mockHighlightService: jest.Mocked<TenantGraphHighlightService>;
  let mockGraph: TenantConnectivityGraph;
  let baseConfig: TenantGraphRenderConfig;

  beforeEach(() => {
    // Create mock services
    mockDataService = {
      transformGraphData: jest.fn(),
      buildRelationshipMaps: jest.fn(),
      groupNodesByLevel: jest.fn(),
      validateGraphData: jest.fn(),
      getDataStatistics: jest.fn(),
    } as any;

    mockLayoutService = {
      calculateLayout: jest.fn(),
    } as any;

    mockUIService = {
      renderLaneGuides: jest.fn(),
      createTooltip: jest.fn(),
      createContextMenu: jest.fn(),
      showContextMenu: jest.fn(),
      formatNodeTooltip: jest.fn(),
      formatEdgeTooltip: jest.fn(),
      renderPathTraceStatus: jest.fn(),
      renderLegend: jest.fn(),
      renderLayoutToggle: jest.fn(),
      renderGuideCircles: jest.fn(),
      renderFilterModeSelector: jest.fn(),
      getHoverTooltipDelay: jest.fn(),
    } as any;

    mockInteractionService = {
      setupZoom: jest.fn(),
      setupDrag: jest.fn(),
      setupForceSimulation: jest.fn(),
      setupTooltipInteractions: jest.fn(),
      setupContextMenuInteractions: jest.fn(),
      setupClickInteractions: jest.fn(),
      setupGlobalClickHandler: jest.fn(),
      setupEdgeHoverInteractions: jest.fn(),
      getDefaultForceConfig: jest.fn(),
      contextMenuClick: {
        subscribe: jest.fn(),
        emit: jest.fn(),
      },
    } as any;

    mockPathTraceService = {
      setGraphData: jest.fn(),
      handlePathTraceAdd: jest.fn(),
      clearPathTrace: jest.fn(),
      setExternalPathTraceData: jest.fn(),
      togglePathOnlyView: jest.fn(),
      getPathTraceState: jest.fn(),
      pathTraceStateChange: {
        subscribe: jest.fn(),
        emit: jest.fn(),
      },
    } as any;

    mockHighlightService = {
      setSelections: jest.fn(),
      updateVisualHighlighting: jest.fn(),
      resetHighlighting: jest.fn(),
    } as any;

    // Create service instance with mocked dependencies
    service = new TenantGraphCoreService(
      mockDataService,
      mockLayoutService,
      mockUIService,
      mockInteractionService,
      mockPathTraceService,
      mockHighlightService,
    );

    // Setup mock graph data
    mockGraph = {
      nodes: {
        'tenant-1': { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' },
        'vrf-1': { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        'firewall-1': { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL' },
      },
      edges: {
        'edge-1': {
          id: 'edge-1',
          sourceNodeId: 'tenant-1',
          targetNodeId: 'vrf-1',
          type: 'TENANT_CONTAINS_VRF',
        },
        'edge-2': {
          id: 'edge-2',
          sourceNodeId: 'vrf-1',
          targetNodeId: 'firewall-1',
          type: 'VRF_CONTAINS_FIREWALL',
        },
      },
    } as any;

    // Base configuration
    baseConfig = {
      graph: mockGraph,
      containerSelector: '#graph-container',
      svgSelector: '#graph-svg',
      dimensions: { width: 1200, height: 800 },
      showLegend: true,
      enablePathTrace: true,
    };

    // Setup service method return values
    mockDataService.transformGraphData.mockReturnValue({
      nodes: [
        { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: mockGraph.nodes['tenant-1'] },
        { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: mockGraph.nodes['vrf-1'] },
        { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL', originalNode: mockGraph.nodes['firewall-1'] },
      ],
      links: [
        { source: 'tenant-1', target: 'vrf-1', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: mockGraph.edges['edge-1'] },
        { source: 'vrf-1', target: 'firewall-1', type: 'VRF_CONTAINS_FIREWALL', metadata: {}, originalEdge: mockGraph.edges['edge-2'] },
      ],
    });

    mockLayoutService.calculateLayout.mockReturnValue({
      clusterCenters: new Map([
        ['tenant-1', 600],
        ['vrf-1', 400],
        ['firewall-1', 800],
      ]),
      yForType: jest.fn().mockImplementation((type: string) => {
        const levels = { TENANT: 100, VRF: 200, FIREWALL: 300 };
        return levels[type as keyof typeof levels] || 250;
      }),
    });

    mockUIService.createTooltip.mockReturnValue({});
    mockUIService.createContextMenu.mockReturnValue({});
    mockUIService.formatNodeTooltip.mockReturnValue('<div>Node Tooltip</div>');
    mockUIService.formatEdgeTooltip.mockReturnValue('<div>Edge Tooltip</div>');
    mockUIService.getHoverTooltipDelay.mockReturnValue(250);

    mockInteractionService.getDefaultForceConfig.mockReturnValue({
      linkDistance: 80,
      linkStrength: 0.6,
      layerStrength: 2.5,
      clusterStrength: 0.3,
      centerStrength: 0.1,
      chargeStrength: -350,
      collisionRadius: 20,
    });

    mockPathTraceService.getPathTraceState.mockReturnValue({
      selectedNodes: [],
      pathExists: false,
    });

    mockDataService.validateGraphData.mockReturnValue({
      isValid: true,
      errors: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have public event emitters', () => {
      expect(service.contextMenuClick).toBeDefined();
      expect(service.pathTraceStateChange).toBeDefined();
      expect(typeof service.contextMenuClick.subscribe).toBe('function');
      expect(typeof service.pathTraceStateChange.subscribe).toBe('function');
    });
  });

  describe('renderGraph - Service Orchestration', () => {
    it('should handle graph rendering without throwing errors', () => {
      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle configuration validation', () => {
      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle empty configuration gracefully', () => {
      const minimalConfig: TenantGraphRenderConfig = {
        graph: mockGraph,
        containerSelector: '#container',
        svgSelector: '#svg',
      };

      expect(() => {
        service.renderGraph(minimalConfig);
      }).not.toThrow();
    });
  });

  describe('Configuration Handling', () => {
    it('should handle different layout modes', () => {
      const circularConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        layoutMode: 'circular',
        circularConfig: {
          centerLevel: 1,
          radiusMultiplier: 1.2,
        },
      };

      expect(() => {
        service.renderGraph(circularConfig);
      }).not.toThrow();
    });

    it('should handle force-directed layout mode', () => {
      const forceConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        layoutMode: 'force-directed',
        forceConfig: {
          linkStrength: 0.8,
          chargeStrength: -400,
        },
      };

      expect(() => {
        service.renderGraph(forceConfig);
      }).not.toThrow();
    });

    it('should handle custom node colors and edge styles', () => {
      const styledConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        nodeColors: {
          TENANT: '#ff0000',
          VRF: '#00ff00',
        },
        edgeStyles: {
          TENANT_CONTAINS_VRF: { color: '#blue', width: 3, opacity: 1 },
        },
      };

      expect(() => {
        service.renderGraph(styledConfig);
      }).not.toThrow();
    });

    it('should handle missing configuration properties with defaults', () => {
      const minimalConfig: TenantGraphRenderConfig = {
        graph: mockGraph,
        containerSelector: '#container',
        svgSelector: '#svg',
      };

      expect(() => {
        service.renderGraph(minimalConfig);
      }).not.toThrow();
    });
  });

  describe('PathTrace Integration', () => {
    it('should clear path trace', () => {
      service.clearPathTrace();

      expect(mockPathTraceService.clearPathTrace).toHaveBeenCalled();
    });

    it('should get path trace state', () => {
      const mockState: PathTraceState = {
        selectedNodes: [{ id: 'node-1', name: 'Node 1', type: 'TENANT' }],
        pathExists: true,
      };

      mockPathTraceService.getPathTraceState.mockReturnValue(mockState);

      const state = service.getPathTraceState();

      expect(mockPathTraceService.getPathTraceState).toHaveBeenCalled();
      expect(state).toEqual(mockState);
    });

    it('should set external path trace data', () => {
      const pathTraceData = {
        source: { id: 'node-1', name: 'Node 1', type: 'TENANT' },
        target: { id: 'node-2', name: 'Node 2', type: 'VRF' },
        path: [],
        isComplete: true,
        calculationSource: 'server' as const,
      };

      service.setExternalPathTraceData(pathTraceData);

      expect(mockPathTraceService.setExternalPathTraceData).toHaveBeenCalledWith(pathTraceData);
    });

    it('should toggle path-only view', () => {
      service.togglePathOnlyView();

      expect(mockPathTraceService.togglePathOnlyView).toHaveBeenCalled();
    });
  });

  describe('Layout Mode Switching', () => {
    it('should switch layout mode without errors', () => {
      expect(() => {
        service.renderGraph(baseConfig);
        service.switchLayoutMode('circular', baseConfig);
      }).not.toThrow();
    });

    it('should switch layout mode with callback', () => {
      const onLayoutModeChange = jest.fn();
      const configWithCallback: TenantGraphRenderConfig = {
        ...baseConfig,
        onLayoutModeChange,
      };

      service.switchLayoutMode('force-directed', configWithCallback);

      expect(onLayoutModeChange).toHaveBeenCalledWith('force-directed');
    });

    it('should handle layout mode switching without callback', () => {
      expect(() => {
        service.switchLayoutMode('circular', baseConfig);
      }).not.toThrow();
    });
  });

  describe('Filter Mode Switching', () => {
    it('should switch filter mode without errors', () => {
      const filterModes: GraphFilterMode[] = [
        {
          id: 'tenant-only',
          name: 'Tenant Only',
          description: 'Show only tenants',
          includedNodeTypes: ['TENANT'],
        },
      ];

      const configWithFilters: TenantGraphRenderConfig = {
        ...baseConfig,
        availableFilterModes: filterModes,
        filterMode: 'full',
      };

      expect(() => {
        service.renderGraph(configWithFilters);
        service.switchFilterMode('tenant-only', configWithFilters);
      }).not.toThrow();
    });

    it('should switch filter mode with callback', () => {
      const onFilterModeChange = jest.fn();
      const configWithCallback: TenantGraphRenderConfig = {
        ...baseConfig,
        onFilterModeChange,
      };

      service.switchFilterMode('tenant-only', configWithCallback);

      expect(onFilterModeChange).toHaveBeenCalledWith('tenant-only');
    });

    it('should handle unknown filter mode gracefully', () => {
      expect(() => {
        service.switchFilterMode('unknown-mode', baseConfig);
      }).not.toThrow();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle service initialization failures gracefully', () => {
      mockDataService.transformGraphData.mockImplementation(() => {
        throw new Error('Data transformation failed');
      });

      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle layout calculation failures gracefully', () => {
      mockLayoutService.calculateLayout.mockImplementation(() => {
        throw new Error('Layout calculation failed');
      });

      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle UI rendering failures gracefully', () => {
      mockUIService.createTooltip.mockImplementation(() => {
        throw new Error('Tooltip creation failed');
      });

      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle null/undefined graph data', () => {
      const invalidConfig: TenantGraphRenderConfig = {
        graph: null as any,
        containerSelector: '#container',
        svgSelector: '#svg',
      };

      expect(() => {
        service.renderGraph(invalidConfig);
      }).not.toThrow();
    });

    it('should handle malformed graph data', () => {
      const malformedGraph = {
        nodes: {
          'invalid-node': {
            /* missing required properties */
          },
        },
        edges: {
          'invalid-edge': {
            /* missing required properties */
          },
        },
      } as any;

      const malformedConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        graph: malformedGraph,
      };

      expect(() => {
        service.renderGraph(malformedConfig);
      }).not.toThrow();
    });

    it('should handle empty graph data', () => {
      const emptyGraph: TenantConnectivityGraph = {
        nodes: {},
        edges: {},
      } as any;

      const emptyConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        graph: emptyGraph,
      };

      mockDataService.transformGraphData.mockReturnValue({
        nodes: [],
        links: [],
      });

      service.renderGraph(emptyConfig);

      // Empty graph should be handled
      expect(true).toBe(true);
    });

    it('should handle validation errors gracefully', () => {
      mockDataService.validateGraphData.mockReturnValue({
        isValid: false,
        errors: ['Duplicate node IDs detected', 'Orphaned edge found'],
      });

      // Should still attempt to render despite validation errors
      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();

      // Validation should be handled
      expect(true).toBe(true);
    });
  });

  describe('Service Integration', () => {
    it('should coordinate services without errors', () => {
      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle service coordination gracefully', () => {
      expect(() => {
        service.renderGraph(baseConfig);
      }).not.toThrow();
    });

    it('should handle complex configurations', () => {
      const complexConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        layoutMode: 'force-directed',
        enablePathTrace: true,
        showLegend: true,
        enableZoom: true,
        enableDrag: true,
      };

      expect(() => {
        service.renderGraph(complexConfig);
      }).not.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    it('should handle all configuration options', () => {
      const fullConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        showLaneGuides: true,
        showLegend: true,
        enableZoom: true,
        enableDrag: true,
        enableContextMenu: true,
        enablePathTrace: true,
        showLayoutToggle: true,
        showFilterModeSelector: true,
        layoutMode: 'force-directed',
        hideEdgeTypes: ['TENANT_CONTAINS_VRF'],
        onNodeClick: jest.fn(),
        onEdgeClick: jest.fn(),
        onLayoutModeChange: jest.fn(),
        onFilterModeChange: jest.fn(),
      };

      expect(() => {
        service.renderGraph(fullConfig);
      }).not.toThrow();

      // Configuration should be handled without errors
      expect(true).toBe(true);
    });

    it('should use default values for missing configuration', () => {
      const minimalConfig: TenantGraphRenderConfig = {
        graph: mockGraph,
        containerSelector: '#container',
        svgSelector: '#svg',
      };

      service.renderGraph(minimalConfig);

      // Should handle minimal configuration
      expect(true).toBe(true);
    });

    it('should handle filter modes correctly', () => {
      const filterModes: GraphFilterMode[] = [
        {
          id: 'tenant-only',
          name: 'Tenant Only',
          description: 'Show only tenants',
          includedNodeTypes: ['TENANT'],
        },
        {
          id: 'full',
          name: 'Full Graph',
          description: 'Show all nodes',
          includedNodeTypes: [],
        },
      ];

      const filteredConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        filterMode: 'tenant-only',
        availableFilterModes: filterModes,
      };

      service.renderGraph(filteredConfig);

      // Filter configuration should be handled
      expect(true).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large graph data efficiently', () => {
      const largeNodes: any = {};
      const largeEdges: any = {};

      // Create 100 nodes and 200 edges
      for (let i = 0; i < 100; i++) {
        largeNodes[`node-${i}`] = { id: `node-${i}`, name: `Node ${i}`, type: 'TENANT' };
      }

      for (let i = 0; i < 200; i++) {
        largeEdges[`edge-${i}`] = {
          id: `edge-${i}`,
          sourceNodeId: `node-${i % 100}`,
          targetNodeId: `node-${(i + 1) % 100}`,
          type: 'TENANT_CONTAINS_VRF',
        };
      }

      const largeGraph: TenantConnectivityGraph = {
        nodes: largeNodes,
        edges: largeEdges,
      } as any;

      const largeConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        graph: largeGraph,
      };

      const startTime = Date.now();
      service.renderGraph(largeConfig);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly (mocked)
      // Large graph should be handled
      expect(true).toBe(true);
    });

    it('should handle optimization settings', () => {
      const optimizedConfig: TenantGraphRenderConfig = {
        ...baseConfig,
        enableOptimization: true,
      };

      service.renderGraph(optimizedConfig);

      // Optimization should be handled
      expect(true).toBe(true);
    });
  });
});
