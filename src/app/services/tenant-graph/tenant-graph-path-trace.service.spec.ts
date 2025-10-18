/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TenantGraphPathTraceService, PathTraceNode, PathTraceData, PathTraceState, PathInfo } from './tenant-graph-path-trace.service';
import { UtilitiesService, PathResult, PathTraceHop } from 'client';

describe('TenantGraphPathTraceService', () => {
  let service: TenantGraphPathTraceService;
  let mockGenerateNodeConnectivity: jest.Mock;

  const mockPathTraceHop1: PathTraceHop = {
    nodeId: 'vrf-1',
    nodeName: 'VRF 1',
    nodeType: 'VRF',
    edgeId: 'edge-1',
    cost: 0,
    isLastHop: false,
    controlPlaneMetadata: {
      allowed: true,
      allowedReason: 'Contract allows traffic',
      generatedConfiguration: {},
    },
  };

  const mockPathTraceHop2: PathTraceHop = {
    nodeId: 'firewall-1',
    nodeName: 'Firewall 1',
    nodeType: 'EXTERNAL_FIREWALL',
    edgeId: 'edge-2',
    cost: 100,
    isLastHop: false,
    controlPlaneMetadata: {
      allowed: true,
      allowedReason: 'Firewall rule allows traffic',
      generatedConfiguration: {},
    },
  };

  const mockPathTraceHop3: PathTraceHop = {
    nodeId: 'vrf-2',
    nodeName: 'VRF 2',
    nodeType: 'VRF',
    cost: 0,
    isLastHop: true,
    controlPlaneMetadata: {
      allowed: true,
      allowedReason: 'Destination reached',
      generatedConfiguration: {},
    },
  };

  const mockPathTraceData: PathTraceData = {
    source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
    target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
    path: [mockPathTraceHop1, mockPathTraceHop2, mockPathTraceHop3],
    isComplete: true,
    totalCost: 100,
  };

  const mockControlPath: PathInfo = {
    nodes: ['vrf-1', 'firewall-1', 'vrf-2'],
    edges: ['edge-1', 'edge-2'],
    costs: [0, 100, 0],
    totalCost: 100,
    hopCount: 3,
    isComplete: true,
    pathTraceData: mockPathTraceData,
  };

  const mockDataPath: PathInfo = {
    nodes: ['vrf-1', 'firewall-1', 'vrf-2'],
    edges: ['edge-1', 'edge-2'],
    costs: [0, 100, 0],
    totalCost: 100,
    hopCount: 3,
    isComplete: true,
    pathTraceData: mockPathTraceData,
  };

  const mockPathResult: PathResult = {
    graphTenantVersion: 1,
    dataPath: mockDataPath,
    controlPath: mockControlPath,
    traversalScope: 'intervrf',
  };

  beforeEach(() => {
    mockGenerateNodeConnectivity = jest.fn().mockReturnValue(of(mockPathResult));

    const mockUtilitiesService = {
      generateNodeConnectivityReportUtilities: mockGenerateNodeConnectivity,
    };

    TestBed.configureTestingModule({
      providers: [TenantGraphPathTraceService, { provide: UtilitiesService, useValue: mockUtilitiesService }],
    });

    service = TestBed.inject(TenantGraphPathTraceService);
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
      expect(state.isCalculating).toBe(false);
      expect(state.calculationError).toBeUndefined();
    });
  });

  describe('setTenantId', () => {
    it('should set tenant ID correctly', () => {
      service.setTenantId('test-tenant-123');

      // Test indirectly by ensuring API calls work
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(mockPathResult));

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);

      expect(mockGenerateNodeConnectivity).toHaveBeenCalledWith({
        endpointConnectivityNodeQuery: {
          sourceNodeId: 'vrf-1',
          destinationNodeId: 'vrf-2',
          tenantId: 'test-tenant-123',
        },
      });
    });
  });

  describe('handlePathTraceAdd', () => {
    beforeEach(() => {
      service.setTenantId('test-tenant-123');
    });

    it('should add first node to selection', () => {
      const node: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };

      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      service.handlePathTraceAdd(node);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(1);
      expect(state.selectedNodes[0]).toEqual(node);
      expect(state.pathExists).toBe(false);
      expect(state.highlightedPath?.nodes).toEqual(['vrf-1']);
      expect(state.highlightedPath?.edges).toEqual([]);
      expect(stateChangeSpy).toHaveBeenCalledWith(state);
    });

    it('should add second node and trigger API path calculation', done => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(mockPathResult));

      // Subscribe to final state after path calculation
      service.pathTraceStateChange.subscribe(state => {
        if (state.isCalculating === false && state.selectedNodes.length === 2 && state.pathTraceData) {
          expect(state.pathExists).toBe(true);
          expect(state.pathLength).toBe(3);
          expect(state.highlightedPath?.nodes).toEqual(['vrf-1', 'firewall-1', 'vrf-2']);
          expect(state.highlightedPath?.edges).toEqual(['edge-1', 'edge-2']);
          expect(state.pathTraceData).toBeDefined();
          expect(state.calculationError).toBeUndefined();
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });

    it('should replace oldest node when adding third node (FIFO)', () => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };
      const node3: PathTraceNode = { id: 'vrf-3', name: 'VRF 3', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(mockPathResult));

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
      service.handlePathTraceAdd(node3);

      const state = service.getPathTraceState();
      expect(state.selectedNodes).toHaveLength(2);
      expect(state.selectedNodes[0]).toEqual(node2); // node1 was removed
      expect(state.selectedNodes[1]).toEqual(node3);
    });

    it('should handle API error gracefully', done => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      const errorMessage = 'API connection failed';
      mockGenerateNodeConnectivity.mockReturnValue(throwError({ message: errorMessage }));

      let errorHandled = false;
      service.pathTraceStateChange.subscribe(state => {
        if (state.calculationError && !errorHandled) {
          errorHandled = true;
          expect(state.isCalculating).toBe(false);
          expect(state.calculationError).toBe(errorMessage);
          expect(state.pathExists).toBe(false);
          expect(state.pathTraceData).toBeUndefined();
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });

    it('should handle outdated query response', done => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      const outdatedResponse: PathResult = {
        graphTenantVersion: 1,
        dataPath: mockDataPath,
        controlPath: mockControlPath,
        traversalScope: 'intervrf',
        queryOutdated: true,
      };

      mockGenerateNodeConnectivity.mockReturnValue(of(outdatedResponse));

      let errorHandled = false;
      service.pathTraceStateChange.subscribe(state => {
        if (state.calculationError && !errorHandled) {
          errorHandled = true;
          expect(state.isCalculating).toBe(false);
          expect(state.calculationError).toContain('Graph is outdated');
          expect(state.calculationError).toContain('refresh');
          expect(state.pathExists).toBe(false);
          expect(state.controlPath).toBeUndefined();
          expect(state.dataPath).toBeUndefined();
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });

    it('should handle missing tenantId', () => {
      // Create service without setting tenant ID
      const mockUtilService = { generateNodeConnectivityReportUtilities: jest.fn() };
      const serviceWithoutTenant = new TenantGraphPathTraceService(mockUtilService as any);

      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      const stateChangeSpy = jest.fn();
      serviceWithoutTenant.pathTraceStateChange.subscribe(stateChangeSpy);

      serviceWithoutTenant.handlePathTraceAdd(node1);
      serviceWithoutTenant.handlePathTraceAdd(node2);

      const state = serviceWithoutTenant.getPathTraceState();
      expect(state.calculationError).toBe('Tenant ID not configured for path calculation');
      expect(state.isCalculating).toBe(false);
      expect(mockUtilService.generateNodeConnectivityReportUtilities).not.toHaveBeenCalled();
    });

    it('should handle incomplete path from API', done => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      const incompletePathData: PathTraceData = {
        source: node1,
        target: node2,
        path: [mockPathTraceHop1, mockPathTraceHop2],
        isComplete: false,
        totalCost: 100,
        lastHopNodeId: 'firewall-1',
      };

      const incompleteControlPath: PathInfo = {
        nodes: ['vrf-1', 'firewall-1'],
        edges: ['edge-1'],
        costs: [10, 20],
        totalCost: 100,
        hopCount: 2,
        isComplete: false,
        pathTraceData: incompletePathData,
      };

      const incompleteResult: PathResult = {
        ...mockPathResult,
        controlPath: incompleteControlPath,
        dataPath: incompleteControlPath,
      };

      mockGenerateNodeConnectivity.mockReturnValue(of(incompleteResult));

      service.pathTraceStateChange.subscribe(state => {
        if (state.isCalculating === false && state.pathTraceData) {
          expect(state.pathExists).toBe(false);
          expect(state.pathTraceData.isComplete).toBe(false);
          expect(state.pathTraceData.lastHopNodeId).toBe('firewall-1');
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });

    it('should handle API returning null result', done => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(null));

      service.pathTraceStateChange.subscribe(state => {
        if (state.isCalculating === false && state.selectedNodes.length === 2) {
          expect(state.pathExists).toBe(false);
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });
  });

  describe('clearPathTrace', () => {
    it('should clear all path trace state', () => {
      service.setTenantId('test-tenant-123');

      const node: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
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
      expect(state.isCalculating).toBe(false);
      expect(state.calculationError).toBeUndefined();
      expect(stateChangeSpy).toHaveBeenCalledWith(state);
    });
  });

  describe('setExternalPathTraceData', () => {
    it('should set external path trace data correctly', () => {
      const pathTraceData: PathTraceData = {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [mockPathTraceHop1, mockPathTraceHop2, mockPathTraceHop3],
        isComplete: true,
        totalCost: 100,
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
      expect(state.highlightedPath?.edges).toEqual(['edge-1', 'edge-2']);
      expect(stateChangeSpy).toHaveBeenCalledWith(state);
    });

    it('should handle incomplete path data', () => {
      const pathTraceData: PathTraceData = {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [mockPathTraceHop1, { ...mockPathTraceHop2, isLastHop: true }],
        isComplete: false,
        totalCost: 100,
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
        path: [mockPathTraceHop1, { ...mockPathTraceHop2, edgeId: undefined }, mockPathTraceHop3],
        isComplete: true,
        totalCost: 100,
      };

      service.setExternalPathTraceData(pathTraceData);

      const state = service.getPathTraceState();
      expect(state.highlightedPath?.edges).toEqual(['edge-1']);
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
      const node: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      service.handlePathTraceAdd(node);

      const state1 = service.getPathTraceState();
      const state2 = service.getPathTraceState();

      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Should be different objects
    });
  });

  describe('Event Emission', () => {
    it('should emit state changes when nodes are added', () => {
      const stateChangeSpy = jest.fn();
      service.pathTraceStateChange.subscribe(stateChangeSpy);

      const node: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
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
      const node: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
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
        path: [mockPathTraceHop1, mockPathTraceHop3],
        isComplete: true,
        totalCost: 0,
      };

      service.setExternalPathTraceData(pathTraceData);

      expect(stateChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pathExists: true,
          pathTraceData,
        }),
      );
    });

    it('should emit loading state when API call starts', done => {
      service.setTenantId('test-tenant-123');

      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(mockPathResult));

      let hasSeenLoadingState = false;
      service.pathTraceStateChange.subscribe(state => {
        if (state.isCalculating === true && !hasSeenLoadingState) {
          hasSeenLoadingState = true;
          expect(state.calculationError).toBeUndefined();
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      service.setTenantId('test-tenant-123');
    });

    it('should call API with correct parameters', done => {
      const node1: PathTraceNode = { id: 'source-node', name: 'Source', type: 'VRF' };
      const node2: PathTraceNode = { id: 'dest-node', name: 'Destination', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(mockPathResult));

      service.pathTraceStateChange.subscribe(() => {
        // Check API was called with correct params
        if (mockGenerateNodeConnectivity.mock.calls.length > 0) {
          expect(mockGenerateNodeConnectivity).toHaveBeenCalledWith({
            endpointConnectivityNodeQuery: {
              sourceNodeId: 'source-node',
              destinationNodeId: 'dest-node',
              tenantId: 'test-tenant-123',
            },
          });
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });

    it('should extract path data from API response', done => {
      const node1: PathTraceNode = { id: 'vrf-1', name: 'VRF 1', type: 'VRF' };
      const node2: PathTraceNode = { id: 'vrf-2', name: 'VRF 2', type: 'VRF' };

      mockGenerateNodeConnectivity.mockReturnValue(of(mockPathResult));

      service.pathTraceStateChange.subscribe(state => {
        if (state.isCalculating === false && state.pathTraceData) {
          // Verify data extracted correctly
          expect(state.pathTraceData).toEqual(mockPathTraceData);
          expect(state.pathExists).toBe(mockControlPath.isComplete);
          expect(state.pathLength).toBe(mockControlPath.hopCount);
          expect(state.controlPath).toBeDefined();
          expect(state.dataPath).toBeDefined();
          // Verify highlighted path includes both control and data paths
          expect(state.highlightedPath?.nodes).toContain('vrf-1');
          expect(state.highlightedPath?.nodes).toContain('firewall-1');
          expect(state.highlightedPath?.nodes).toContain('vrf-2');
          done();
        }
      });

      service.handlePathTraceAdd(node1);
      service.handlePathTraceAdd(node2);
    });
  });
});
