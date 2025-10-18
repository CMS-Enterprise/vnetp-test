/* eslint-disable */
import { TenantGraphHighlightService, EdgeStyle, TenantEdgeStyleMap } from './tenant-graph-highlight.service';
import { PathTraceState } from './tenant-graph-path-trace.service';

// Mock D3 module
jest.mock('d3', () => ({
  select: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    each: jest.fn().mockReturnThis(),
  }),
}));

describe('TenantGraphHighlightService', () => {
  let service: TenantGraphHighlightService;
  let mockNodeSelection: any;
  let mockLinkSelection: any;
  let mockCircleSelection: any;
  let mockTextSelection: any;
  let mockIndicatorSelection: any;
  let mockGraphData: { nodes: any[]; links: any[] };

  beforeEach(() => {
    service = new TenantGraphHighlightService();

    // Mock D3 selections
    mockCircleSelection = {
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
    };

    mockTextSelection = {
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      remove: jest.fn().mockReturnThis(),
    };

    mockIndicatorSelection = {
      remove: jest.fn().mockReturnThis(),
    };

    mockNodeSelection = {
      selectAll: jest.fn().mockImplementation((selector: string) => {
        if (selector === 'circle') return mockCircleSelection;
        if (selector === 'text') return mockTextSelection;
        if (selector === '.control-plane-indicator') return mockIndicatorSelection;
        return mockCircleSelection;
      }),
      each: jest.fn().mockImplementation((callback: any) => {
        // Mock the each() method for rendering control plane indicators
        return mockNodeSelection;
      }),
    };

    mockLinkSelection = {
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
    };

    mockGraphData = {
      nodes: [
        { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' },
        { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL' },
      ],
      links: [
        {
          id: 'link-1',
          source: 'tenant-1',
          target: 'vrf-1',
          type: 'TENANT_CONTAINS_VRF',
          originalEdge: { id: 'edge-1' },
        },
        {
          id: 'link-2',
          source: 'vrf-1',
          target: 'firewall-1',
          type: 'VRF_TO_L3OUT',
          originalEdge: { id: 'edge-2' },
        },
      ],
    };

    service.setSelections(mockNodeSelection, mockLinkSelection, mockGraphData);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have default edge styles defined', () => {
      // Test that default styles are accessible through the service behavior
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: false,
        highlightedPath: undefined,
      };

      service.updateVisualHighlighting(pathTraceState);
      service.resetHighlighting();

      // Verify that resetHighlighting was called (indicates default styles are used)
      expect(mockLinkSelection.attr).toHaveBeenCalled();
    });
  });

  describe('setSelections', () => {
    it('should store D3 selections and graph data', () => {
      const newMockCircleSelection = {
        attr: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis(),
      };

      const newMockTextSelection = {
        attr: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis(),
      };

      const newMockIndicatorSelection = {
        remove: jest.fn().mockReturnThis(),
      };

      const newNodeSelection = {
        selectAll: jest.fn().mockImplementation((selector: string) => {
          if (selector === 'circle') return newMockCircleSelection;
          if (selector === 'text') return newMockTextSelection;
          if (selector === '.control-plane-indicator') return newMockIndicatorSelection;
          return newMockCircleSelection;
        }),
        each: jest.fn().mockReturnThis(),
      };

      const newLinkSelection = {
        attr: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis(),
      };

      const newGraphData = { nodes: [], links: [] };

      service.setSelections(newNodeSelection, newLinkSelection, newGraphData);

      // Test by calling a method that uses the selections
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: false,
        highlightedPath: undefined,
      };

      service.updateVisualHighlighting(pathTraceState);

      expect(newNodeSelection.selectAll).toHaveBeenCalled();
    });
  });

  describe('updateVisualHighlighting', () => {
    it('should reset highlighting when no highlighted path exists', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: false,
        highlightedPath: undefined,
      };

      service.updateVisualHighlighting(pathTraceState);

      // Should reset to normal appearance
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('stroke', '#fff');
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('stroke-width', 1.5);
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('opacity', 1);
      expect(mockCircleSelection.style).toHaveBeenCalledWith('display', 'block');
    });

    it('should return early if selections are not set', () => {
      const serviceWithoutSelections = new TenantGraphHighlightService();
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: false,
        highlightedPath: { nodes: ['test'], edges: [] },
      };

      // Should not throw error
      serviceWithoutSelections.updateVisualHighlighting(pathTraceState);
      expect(true).toBe(true); // Test passes if no error thrown
    });

    it('should highlight selected nodes with orange stroke', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [{ id: 'vrf-1', name: 'VRF 1', type: 'VRF' }],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1', 'firewall-1'], edges: ['edge-2'] },
      };

      service.updateVisualHighlighting(pathTraceState);

      expect(mockCircleSelection.attr).toHaveBeenCalledWith('stroke', expect.any(Function));
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('stroke-width', expect.any(Function));

      // Test the stroke color function for selected node
      const strokeColorFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      expect(strokeColorFn({ id: 'vrf-1' })).toBe('#ff6b35'); // Orange for selected
    });

    it('should highlight path nodes with blue stroke', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [{ id: 'vrf-1', name: 'VRF 1', type: 'VRF' }],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1', 'firewall-1'], edges: ['edge-2'] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeColorFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      expect(strokeColorFn({ id: 'firewall-1' })).toBe('#007bff'); // Blue for path node
    });

    it('should highlight incomplete path last hop with red stroke', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [
          { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
          { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL' },
        ],
        pathExists: false,
        highlightedPath: { nodes: ['vrf-1', 'firewall-1'], edges: ['edge-2'] },
        pathTraceData: {
          source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
          target: { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL' },
          path: [],
          isComplete: false,
          totalCost: 0,
          lastHopNodeId: 'firewall-1',
        },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeColorFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      expect(strokeColorFn({ id: 'firewall-1' })).toBe('#dc3545'); // Red for incomplete last hop
    });

    it('should set default white stroke for non-highlighted nodes', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1'], edges: [] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeColorFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      expect(strokeColorFn({ id: 'tenant-1' })).toBe('#fff'); // White for non-highlighted
    });

    it('should set appropriate stroke width for highlighted vs normal nodes', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1'], edges: [] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeWidthFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'stroke-width')[1];
      expect(strokeWidthFn({ id: 'vrf-1' })).toBe(3); // Highlighted
      expect(strokeWidthFn({ id: 'tenant-1' })).toBe(1.5); // Normal
    });

    it('should fade non-highlighted nodes in normal mode', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1'], edges: [] },
        showPathOnly: false,
      };

      service.updateVisualHighlighting(pathTraceState);

      const opacityFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'opacity')[1];
      expect(opacityFn({ id: 'vrf-1' })).toBe(1); // Highlighted
      expect(opacityFn({ id: 'tenant-1' })).toBe(0.3); // Faded
    });

    it('should hide non-highlighted nodes in path-only mode', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1'], edges: [] },
        showPathOnly: true,
      };

      service.updateVisualHighlighting(pathTraceState);

      const opacityFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'opacity')[1];
      expect(opacityFn({ id: 'vrf-1' })).toBe(1); // Visible
      expect(opacityFn({ id: 'tenant-1' })).toBe(0); // Hidden

      const displayFn = mockCircleSelection.style.mock.calls.find(call => call[0] === 'display')[1];
      expect(displayFn({ id: 'vrf-1' })).toBe('block'); // Visible
      expect(displayFn({ id: 'tenant-1' })).toBe('none'); // Hidden
    });

    it('should handle node labels (text elements) opacity and display', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1'], edges: [] },
        showPathOnly: true,
      };

      service.updateVisualHighlighting(pathTraceState);

      expect(mockTextSelection.attr).toHaveBeenCalledWith('opacity', expect.any(Function));
      expect(mockTextSelection.style).toHaveBeenCalledWith('display', expect.any(Function));

      const opacityFn = mockTextSelection.attr.mock.calls.find(call => call[0] === 'opacity')[1];
      expect(opacityFn({ id: 'vrf-1' })).toBe(1); // Visible
      expect(opacityFn({ id: 'tenant-1' })).toBe(0); // Hidden
    });

    it('should highlight path edges with orange color and increased width', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: ['vrf-1', 'firewall-1'], edges: ['edge-2'] },
      };

      service.updateVisualHighlighting(pathTraceState);

      expect(mockLinkSelection.attr).toHaveBeenCalledWith('stroke', expect.any(Function));
      expect(mockLinkSelection.attr).toHaveBeenCalledWith('stroke-width', expect.any(Function));

      // Test edge highlighting
      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const mockEdge = {
        originalEdge: { id: 'edge-2' },
        type: 'VRF_TO_L3OUT',
        source: { id: 'vrf-1' },
        target: { id: 'firewall-1' },
      };
      expect(strokeFn(mockEdge)).toBe('#ff6b35'); // Orange for path edge
    });

    it('should preserve special edge colors for INTERVRF_CONNECTION', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: [], edges: [] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const mockEdge = {
        type: 'INTERVRF_CONNECTION',
        source: { id: 'vrf-1' },
        target: { id: 'vrf-2' },
      };
      expect(strokeFn(mockEdge)).toBe('#ff6b35'); // Special color for INTERVRF
    });

    it('should preserve special edge colors for L3OUT_TO_FIREWALL with intervrf metadata', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: [], edges: [] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const mockEdge = {
        type: 'L3OUT_TO_FIREWALL',
        metadata: { l3outType: 'intervrf' },
        source: { id: 'l3out-1' },
        target: { id: 'firewall-1' },
      };
      expect(strokeFn(mockEdge)).toBe('#ff6b35'); // Special color for intervrf L3OUT
    });

    it('should handle edges without originalEdge by generating edge ID', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: [], edges: ['vrf-1-firewall-1'] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const mockEdge = {
        type: 'VRF_TO_L3OUT',
        source: { id: 'vrf-1' },
        target: { id: 'firewall-1' },
        // No originalEdge
      };
      expect(strokeFn(mockEdge)).toBe('#ff6b35'); // Should highlight based on generated ID
    });

    it('should handle string-based source/target in edge ID generation', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: [], edges: ['vrf-1-firewall-1'] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const mockEdge = {
        type: 'VRF_TO_L3OUT',
        source: 'vrf-1', // String instead of object
        target: 'firewall-1',
      };
      expect(strokeFn(mockEdge)).toBe('#ff6b35'); // Should highlight based on generated ID
    });

    it('should adjust edge opacity in path-only mode', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: [], edges: ['edge-2'] },
        showPathOnly: true,
      };

      service.updateVisualHighlighting(pathTraceState);

      expect(mockLinkSelection.attr).toHaveBeenCalledWith('stroke-opacity', expect.any(Function));
      expect(mockLinkSelection.style).toHaveBeenCalledWith('display', expect.any(Function));

      const opacityFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke-opacity')[1];
      const pathEdge = { originalEdge: { id: 'edge-2' } };
      const nonPathEdge = { originalEdge: { id: 'edge-1' } };

      expect(opacityFn(pathEdge)).toBe(1); // Path edge visible
      expect(opacityFn(nonPathEdge)).toBe(0); // Non-path edge hidden
    });
  });

  describe('resetHighlighting', () => {
    it('should reset all visual elements to normal state', () => {
      service.resetHighlighting();

      // Verify nodes are reset
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('stroke', '#fff');
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('stroke-width', 1.5);
      expect(mockCircleSelection.attr).toHaveBeenCalledWith('opacity', 1);
      expect(mockCircleSelection.style).toHaveBeenCalledWith('display', 'block');

      // Verify text labels are reset
      expect(mockTextSelection.attr).toHaveBeenCalledWith('opacity', 1);
      expect(mockTextSelection.style).toHaveBeenCalledWith('display', 'block');

      // Verify edges are reset
      expect(mockLinkSelection.attr).toHaveBeenCalledWith('stroke', expect.any(Function));
      expect(mockLinkSelection.attr).toHaveBeenCalledWith('stroke-width', expect.any(Function));
      expect(mockLinkSelection.attr).toHaveBeenCalledWith('stroke-opacity', expect.any(Function));
      expect(mockLinkSelection.style).toHaveBeenCalledWith('display', 'block');
    });

    it('should return early if selections are not set', () => {
      const serviceWithoutSelections = new TenantGraphHighlightService();

      // Should not throw error
      serviceWithoutSelections.resetHighlighting();
      expect(true).toBe(true); // Test passes if no error thrown
    });

    it('should restore default edge colors during reset', () => {
      service.resetHighlighting();

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];

      // Test INTERVRF_CONNECTION keeps special color
      const intervrfEdge = { type: 'INTERVRF_CONNECTION' };
      expect(strokeFn(intervrfEdge)).toBe('#ff6b35');

      // Test L3OUT_TO_FIREWALL with intervrf metadata keeps special color
      const intervrfL3outEdge = {
        type: 'L3OUT_TO_FIREWALL',
        metadata: { l3outType: 'intervrf' },
      };
      expect(strokeFn(intervrfL3outEdge)).toBe('#ff6b35');

      // Test normal edge gets default color
      const normalEdge = { type: 'VRF_TO_L3OUT' };
      expect(strokeFn(normalEdge)).toBe('#adb5bd'); // Default color from DEFAULT_EDGE_STYLES
    });

    it('should restore default edge widths during reset', () => {
      service.resetHighlighting();

      const widthFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke-width')[1];

      const mockEdge = { type: 'VRF_TO_L3OUT' };
      expect(widthFn(mockEdge)).toBe(3); // 2.5 * 1.2 = 3 (default width * multiplier)
    });

    it('should restore default edge opacity during reset', () => {
      service.resetHighlighting();

      const opacityFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke-opacity')[1];

      const mockEdge = { type: 'VRF_TO_L3OUT' };
      expect(opacityFn(mockEdge)).toBe(0.8); // Default opacity from DEFAULT_EDGE_STYLES
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty highlighted path gracefully', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: false,
        highlightedPath: { nodes: [], edges: [] },
      };

      expect(() => service.updateVisualHighlighting(pathTraceState)).not.toThrow();
    });

    it('should handle missing edge types in DEFAULT_EDGE_STYLES', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: false,
        highlightedPath: undefined,
      };

      service.updateVisualHighlighting(pathTraceState);
      service.resetHighlighting();

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const unknownEdge = { type: 'UNKNOWN_EDGE_TYPE' };

      // Should fall back to VRF_TO_L3OUT default
      expect(strokeFn(unknownEdge)).toBe('#adb5bd');
    });

    it('should handle edges with missing source/target IDs', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [],
        pathExists: true,
        highlightedPath: { nodes: [], edges: ['undefined-undefined'] },
      };

      service.updateVisualHighlighting(pathTraceState);

      const strokeFn = mockLinkSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      const edgeWithMissingIds = {
        type: 'VRF_TO_L3OUT',
        source: {}, // No id property
        target: {}, // No id property
      };

      expect(() => strokeFn(edgeWithMissingIds)).not.toThrow();
    });

    it('should handle pathTraceData without lastHopNodeId', () => {
      const pathTraceState: PathTraceState = {
        selectedNodes: [{ id: 'vrf-1', name: 'VRF 1', type: 'VRF' }],
        pathExists: false,
        highlightedPath: { nodes: ['vrf-1'], edges: [] },
        pathTraceData: {
          source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
          target: { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL' },
          path: [],
          isComplete: false,
          totalCost: 0,
          // No lastHopNodeId
        },
      };

      expect(() => service.updateVisualHighlighting(pathTraceState)).not.toThrow();

      const strokeColorFn = mockCircleSelection.attr.mock.calls.find(call => call[0] === 'stroke')[1];
      expect(strokeColorFn({ id: 'vrf-1' })).toBe('#ff6b35'); // Should still highlight as selected
    });
  });
});
