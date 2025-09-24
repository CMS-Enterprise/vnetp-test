/* eslint-disable */
import { TenantGraphPathTraceService, PathTraceNode, PathTraceData, PathTraceState, GraphData } from './tenant-graph-path-trace.service';

describe('TenantGraphPathTraceService', () => {
  let service: TenantGraphPathTraceService;
  let mockGraphData: GraphData;

  beforeEach(() => {
    service = new TenantGraphPathTraceService();

    // Setup mock graph data
    mockGraphData = {
      nodes: [
        { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
        { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
        { id: 'firewall-1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL', originalNode: { config: { routingCost: 100 } } },
        { id: 'vrf-2', name: 'VRF 2', type: 'VRF', originalNode: {} },
        { id: 'tenant-2', name: 'Tenant 2', type: 'TENANT', originalNode: {} },
      ],
      links: [
        { source: 'tenant-1', target: 'vrf-1', type: 'TENANT_CONTAINS_VRF', originalEdge: { id: 'edge-1' } },
        { source: 'vrf-1', target: 'firewall-1', type: 'VRF_TO_FIREWALL', originalEdge: { id: 'edge-2' } },
        { source: 'firewall-1', target: 'vrf-2', type: 'FIREWALL_TO_VRF', originalEdge: { id: 'edge-3' } },
        { source: 'vrf-2', target: 'tenant-2', type: 'VRF_CONTAINS_TENANT', originalEdge: { id: 'edge-4' } },
      ],
    };

    service.setGraphData(mockGraphData);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty state', () => {
      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(0);
      expect(state.pathExists).toBe(false);
      expect(state.highlightedPath).toBeUndefined();
      expect(state.pathTraceData).toBeUndefined();
      expect(state.showPathOnly).toBe(false);
    });
  });

  describe('setGraphData', () => {
    it('should set graph data correctly', () => {
      const newGraphData: GraphData = {
        nodes: [{ id: 'test-node', name: 'Test', type: 'TEST', originalNode: {} }],
        links: [],
      };

      service.setGraphData(newGraphData);

      // We can't directly access private currentGraphData, but we can test indirectly
      // by testing path calculation behavior
      const node: PathTraceNode = { id: 'test-node', name: 'Test', type: 'TEST' };
      service.handlePathTraceAdd(node);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(1);
      expect(state.selectedNodes[0].id).toBe('test-node');
    });
  });

  describe('handlePathTraceAdd', () => {
    it('should add first node to selection', () => {
      const node: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };

      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      service.handlePathTraceAdd(node);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(1);
      expect(state.selectedNodes[0]).toEqual(node);
      expect(state.pathExists).toBe(false);
      expect(state.highlightedPath?.nodes).toEqual(['tenant-1']);
      expect(state.highlightedPath?.edges).toEqual([]);
      expect(stateChangeSpy).toHaveBeenCalledWith(state);
    });

    it('should add second node and calculate path', () => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(2);
      expect(state.pathExists).toBe(true);
      expect(state.pathLength).toBeGreaterThan(0);
      expect(state.highlightedPath?.nodes).toContain('vrf-1');
      expect(state.highlightedPath?.nodes).toContain('vrf-2');
      expect(state.pathTraceData).toBeDefined();
      expect(state.pathTraceData?.calculationSource).toBe('client');
    });

    it('should replace oldest node when adding third node (FIFO)', () => {
      const node1: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };
      const node2: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node3: PathTraceNode = { id: 'tenant-2', name: 'Tenant 2', type: 'TENANT' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
      service.handlePathTraceAdd(node3);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(2);
      expect(state.selectedNodes[0]).toEqual(node2); // node1 was removed
      expect(state.selectedNodes[1]).toEqual(node3);
    });

    it('should handle path calculation for disconnected nodes', () => {
      // Add isolated node to graph
      mockGraphData.nodes.push({ id: 'isolated', name: 'Isolated', type: 'ISOLATED', originalNode: {} });
      service.setGraphData(mockGraphData);

      const node1: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };
      const node2: PathTraceNode = { id: 'isolated', name: 'Isolated', type: 'ISOLATED' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(2);
      expect(state.pathExists).toBe(false);
      expect(state.highlightedPath?.nodes).toEqual(['tenant-1', 'isolated']);
      expect(state.highlightedPath?.edges).toEqual([]);
      expect(state.pathTraceData).toBeUndefined();
    });
  });

  describe('clearPathTrace', () => {
    it('should clear all path trace state', () => {
      const node: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };
      service.handlePathTraceAdd(node);

      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      service.clearPathTrace();

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(0);
      expect(state.pathExists).toBe(false);
      expect(state.highlightedPath).toBeUndefined();
      expect(state.pathTraceData).toBeUndefined();
      expect(state.showPathOnly).toBe(false);
      expect(stateChangeSpy).toHaveBeenCalledWith(state);
    });
  });

  describe('setExternalPathTraceData', () => {
    it('should set external path trace data correctly', () => {
      const pathTraceData: PathTraceData = {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [
          { nodeId: 'vrf-1', edgeId: 'edge-2', cost: 0 },
          { nodeId: 'firewall-1', edgeId: 'edge-3', cost: 100 },
          { nodeId: 'vrf-2', cost: 0, isLastHop: true },
        ],
        isComplete: true,
        totalCost: 100,
        calculationSource: 'server',
      };

      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      service.setExternalPathTraceData(pathTraceData);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(2);
      expect(state.selectedNodes[0]).toEqual(pathTraceData.source);
      expect(state.selectedNodes[1]).toEqual(pathTraceData.target);
      expect(state.pathExists).toBe(true);
      expect(state.pathLength).toBe(3);
      expect(state.pathTraceData).toEqual(pathTraceData);
      expect(state.highlightedPath?.nodes).toEqual(['vrf-1', 'firewall-1', 'vrf-2']);
      expect(state.highlightedPath?.edges).toEqual(['edge-2', 'edge-3']);
      expect(stateChangeSpy).toHaveBeenCalledWith(state);
    });

    it('should handle incomplete path data', () => {
      const pathTraceData: PathTraceData = {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [
          { nodeId: 'vrf-1', edgeId: 'edge-2', cost: 0 },
          { nodeId: 'firewall-1', cost: 100, isLastHop: true },
        ],
        isComplete: false,
        totalCost: 100,
        calculationSource: 'server',
        lastHopNodeId: 'firewall-1',
      };

      service.setExternalPathTraceData(pathTraceData);

      const state = service.getPathTraceState();
      expect(state.pathExists).toBe(false);
      expect(state.pathLength).toBe(2);
      expect(state.pathTraceData?.isComplete).toBe(false);
      expect(state.pathTraceData?.lastHopNodeId).toBe('firewall-1');
    });

    it('should filter out undefined edge IDs from highlighted path', () => {
      const pathTraceData: PathTraceData = {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [
          { nodeId: 'vrf-1', edgeId: 'edge-2', cost: 0 },
          { nodeId: 'firewall-1', cost: 100 }, // No edgeId
          { nodeId: 'vrf-2', edgeId: 'edge-3', cost: 0, isLastHop: true },
        ],
        isComplete: true,
        totalCost: 100,
        calculationSource: 'server',
      };

      service.setExternalPathTraceData(pathTraceData);

      const state = service.getPathTraceState();
      expect(state.highlightedPath?.edges).toEqual(['edge-2', 'edge-3']);
    });
  });

  describe('togglePathOnlyView', () => {
    it('should toggle path-only view mode', () => {
      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      // Initially false
      expect(service.getPathTraceState().showPathOnly).toBe(false);

      // Toggle to true
      service.togglePathOnlyView();
      expect(service.getPathTraceState().showPathOnly).toBe(true);
      expect(stateChangeSpy).toHaveBeenCalledWith(expect.objectContaining({ showPathOnly: true }));

      // Toggle back to false
      service.togglePathOnlyView();
      expect(service.getPathTraceState().showPathOnly).toBe(false);
      expect(stateChangeSpy).toHaveBeenCalledWith(expect.objectContaining({ showPathOnly: false }));
    });
  });

  describe('getPathTraceState', () => {
    it('should return a copy of the current state', () => {
      const node: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };
      service.handlePathTraceAdd(node);

      const state1 = service.getPathTraceState();
      const state2 = service.getPathTraceState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });
  });

  describe('Dijkstra Algorithm Implementation', () => {
    it('should find optimal path between connected nodes', () => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.pathExists).toBe(true);
      expect(state.pathTraceData?.path).toBeDefined();
      expect(state.pathTraceData?.totalCost).toBe(100); // Cost through firewall
      expect(state.pathTraceData?.isComplete).toBe(true);
    });

    it('should handle same source and target node', () => {
      const node: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };

      service.handlePathTraceAdd(node);
      service.handlePathTraceAdd(node); // Same node

      const state = service.getPathTraceState();
      expect(state.pathExists).toBe(true);
      expect(state.pathTraceData?.path).toHaveLength(1);
      expect(state.pathTraceData?.totalCost).toBe(0);
    });

    it('should skip tenant containment edges in path calculation', () => {
      // This test ensures TENANT_CONTAINS_* edges are ignored during pathfinding
      const mockData: GraphData = {
        nodes: [
          { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
          { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
          { id: 'vrf-2', name: 'VRF 2', type: 'VRF', originalNode: {} },
        ],
        links: [
          { source: 'tenant-1', target: 'vrf-1', type: 'TENANT_CONTAINS_VRF', originalEdge: { id: 'edge-1' } },
          { source: 'tenant-1', target: 'vrf-2', type: 'TENANT_CONTAINS_VRF', originalEdge: { id: 'edge-2' } },
          { source: 'vrf-1', target: 'vrf-2', type: 'VRF_TO_VRF', originalEdge: { id: 'edge-3' } },
        ],
      };

      service.setGraphData(mockData);

      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.pathExists).toBe(true);
      // Should use direct VRF_TO_VRF connection, not through tenant
      expect(state.pathTraceData?.path).toHaveLength(2);
    });

    it('should calculate costs based on firewall routing costs', () => {
      const mockData: GraphData = {
        nodes: [
          { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
          { id: 'firewall-1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL', originalNode: { config: { routingCost: 500 } } },
          { id: 'vrf-2', name: 'VRF 2', type: 'VRF', originalNode: {} },
        ],
        links: [
          { source: 'vrf-1', target: 'firewall-1', type: 'VRF_TO_FIREWALL', originalEdge: { id: 'edge-1' } },
          { source: 'firewall-1', target: 'vrf-2', type: 'FIREWALL_TO_VRF', originalEdge: { id: 'edge-2' } },
        ],
      };

      service.setGraphData(mockData);

      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.pathTraceData?.totalCost).toBe(500);
    });

    it('should use default cost for firewall without routing cost', () => {
      const mockData: GraphData = {
        nodes: [
          { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
          { id: 'firewall-1', name: 'Firewall 1', type: 'EXTERNAL_FIREWALL', originalNode: {} }, // No routing cost
          { id: 'vrf-2', name: 'VRF 2', type: 'VRF', originalNode: {} },
        ],
        links: [
          { source: 'vrf-1', target: 'firewall-1', type: 'VRF_TO_FIREWALL', originalEdge: { id: 'edge-1' } },
          { source: 'firewall-1', target: 'vrf-2', type: 'FIREWALL_TO_VRF', originalEdge: { id: 'edge-2' } },
        ],
      };

      service.setGraphData(mockData);

      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.pathTraceData?.totalCost).toBe(999); // Default cost
    });

    it('should handle object-based source/target in links', () => {
      const mockData: GraphData = {
        nodes: [
          { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
          { id: 'vrf-2', name: 'VRF 2', type: 'VRF', originalNode: {} },
        ],
        links: [
          {
            source: { id: 'vrf-1' },
            target: { id: 'vrf-2' },
            type: 'VRF_TO_VRF',
            originalEdge: { id: 'edge-1' },
          },
        ],
      };

      service.setGraphData(mockData);

      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      const state = service.getPathTraceState();
      expect(state.pathExists).toBe(true);
      expect(state.pathTraceData?.path).toHaveLength(2);
    });
  });

  describe('Event Emission', () => {
    it('should emit state changes when nodes are added', () => {
      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      const node: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };
      service.handlePathTraceAdd(node);

      expect(stateChangeSpy).toHaveBeenCalledTimes(1);
      expect(stateChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedNodes: [node],
          pathExists: false,
        }),
      );
    });

    it('should emit state changes when path is cleared', () => {
      const stateChangeSpy = jest.fn();

      // Add a node first
      const node: PathTraceNode = { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT' };
      service.handlePathTraceAdd(node);

      // Subscribe after adding node
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      service.clearPathTrace();

      expect(stateChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedNodes: [],
          pathExists: false,
          highlightedPath: undefined,
        }),
      );
    });

    it('should emit state changes when external data is set', () => {
      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      const pathTraceData: PathTraceData = {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [
          { nodeId: 'vrf-1', edgeId: 'edge-1', cost: 0 },
          { nodeId: 'vrf-2', cost: 0, isLastHop: true },
        ],
        isComplete: true,
        totalCost: 0,
        calculationSource: 'server',
      };

      service.setExternalPathTraceData(pathTraceData);

      expect(stateChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pathExists: true,
          pathTraceData,
        }),
      );
    });
  });
});
