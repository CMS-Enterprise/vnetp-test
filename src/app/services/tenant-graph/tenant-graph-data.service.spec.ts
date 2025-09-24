/* eslint-disable */
import { TenantGraphDataService, D3Node, D3Link, TransformedGraphData, DataTransformConfig } from './tenant-graph-data.service';
import { TenantConnectivityGraph } from 'client';

describe('TenantGraphDataService', () => {
  let service: TenantGraphDataService;

  beforeEach(() => {
    service = new TenantGraphDataService();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('transformGraphData', () => {
    let mockGraph: TenantConnectivityGraph;

    beforeEach(() => {
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
            metadata: { cost: 10 },
          },
          'edge-2': {
            id: 'edge-2',
            sourceNodeId: 'vrf-1',
            targetNodeId: 'firewall-1',
            type: 'VRF_CONTAINS_FIREWALL',
            metadata: { cost: 20 },
          },
        },
      } as any;
    });

    it('should transform basic graph data correctly', () => {
      const result = service.transformGraphData(mockGraph);

      expect(result.nodes).toHaveLength(3);
      expect(result.links).toHaveLength(2);

      // Check node transformation
      const tenantNode = result.nodes.find(n => n.id === 'tenant-1');
      expect(tenantNode).toEqual({
        id: 'tenant-1',
        name: 'Tenant 1',
        type: 'TENANT',
        originalNode: mockGraph.nodes['tenant-1'],
      });

      // Check edge transformation
      const edge = result.links.find(l => l.source === 'tenant-1');
      expect(edge).toEqual({
        source: 'tenant-1',
        target: 'vrf-1',
        type: 'TENANT_CONTAINS_VRF',
        metadata: { cost: 10 },
        originalEdge: mockGraph.edges['edge-1'],
      });
    });

    it('should filter out hidden edge types', () => {
      const config: DataTransformConfig = {
        hideEdgeTypes: ['VRF_CONTAINS_FIREWALL'],
      };

      const result = service.transformGraphData(mockGraph, config);

      expect(result.nodes).toHaveLength(3);
      expect(result.links).toHaveLength(1);
      expect(result.links[0].type).toBe('TENANT_CONTAINS_VRF');
    });

    it('should validate connections when enabled', () => {
      // Add edge with invalid target
      mockGraph.edges['invalid-edge'] = {
        id: 'invalid-edge',
        sourceNodeId: 'tenant-1',
        targetNodeId: 'non-existent-node',
        type: 'INVALID_EDGE',
        metadata: {},
      } as any;

      const config: DataTransformConfig = {
        validateConnections: true,
      };

      const result = service.transformGraphData(mockGraph, config);

      // Should filter out the invalid edge
      expect(result.links).toHaveLength(2);
      expect(result.links.find(l => l.type === 'INVALID_EDGE')).toBeUndefined();
    });

    it('should apply node filtering correctly', () => {
      const config: DataTransformConfig = {
        filterMode: {
          includedNodeTypes: ['TENANT', 'VRF'],
        },
      };

      const result = service.transformGraphData(mockGraph, config);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes.map(n => n.type)).toEqual(['TENANT', 'VRF']);
      // Edges to filtered-out nodes should be removed
      expect(result.links).toHaveLength(1);
    });

    it('should apply node exclusion filtering', () => {
      const config: DataTransformConfig = {
        filterMode: {
          excludedNodeTypes: ['FIREWALL'],
        },
      };

      const result = service.transformGraphData(mockGraph, config);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes.map(n => n.type)).toEqual(['TENANT', 'VRF']);
    });

    it('should apply edge type filtering', () => {
      const config: DataTransformConfig = {
        filterMode: {
          includedEdgeTypes: ['TENANT_CONTAINS_VRF'],
        },
      };

      const result = service.transformGraphData(mockGraph, config);

      expect(result.links).toHaveLength(1);
      expect(result.links[0].type).toBe('TENANT_CONTAINS_VRF');
    });

    it('should exclude specific edge types', () => {
      const config: DataTransformConfig = {
        filterMode: {
          excludedEdgeTypes: ['VRF_CONTAINS_FIREWALL'],
        },
      };

      const result = service.transformGraphData(mockGraph, config);

      expect(result.links).toHaveLength(1);
      expect(result.links[0].type).toBe('TENANT_CONTAINS_VRF');
    });

    it('should handle empty graph', () => {
      const emptyGraph = { nodes: {}, edges: {} } as TenantConnectivityGraph;
      const result = service.transformGraphData(emptyGraph);

      expect(result.nodes).toHaveLength(0);
      expect(result.links).toHaveLength(0);
    });

    it('should preserve metadata when includeMetadata is true', () => {
      const config: DataTransformConfig = {
        includeMetadata: true,
      };

      const result = service.transformGraphData(mockGraph, config);

      expect(result.links[0].metadata).toEqual({ cost: 10 });
    });
  });

  describe('buildRelationshipMaps', () => {
    let nodes: D3Node[];
    let links: D3Link[];

    beforeEach(() => {
      nodes = [
        { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
        { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
        { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL', originalNode: {} },
      ];

      links = [
        { source: 'tenant-1', target: 'vrf-1', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
        { source: 'vrf-1', target: 'firewall-1', type: 'VRF_CONTAINS_FIREWALL', metadata: {}, originalEdge: {} },
      ];
    });

    it('should build parent-child relationships correctly', () => {
      const hierarchyEdgeTypes = ['TENANT_CONTAINS_VRF', 'VRF_CONTAINS_FIREWALL'];
      const result = service.buildRelationshipMaps(nodes, links, hierarchyEdgeTypes);

      expect(result.parentMap.get('vrf-1')).toBe('tenant-1');
      expect(result.parentMap.get('firewall-1')).toBe('vrf-1');
      expect(result.childrenMap.get('tenant-1')).toEqual(['vrf-1']);
      expect(result.childrenMap.get('vrf-1')).toEqual(['firewall-1']);
    });

    it('should build connection maps for all relationships', () => {
      const hierarchyEdgeTypes = ['TENANT_CONTAINS_VRF'];
      const result = service.buildRelationshipMaps(nodes, links, hierarchyEdgeTypes);

      expect(result.connectionsMap.get('tenant-1')).toEqual(['vrf-1']);
      expect(result.connectionsMap.get('vrf-1')).toEqual(['tenant-1', 'firewall-1']);
      expect(result.connectionsMap.get('firewall-1')).toEqual(['vrf-1']);
    });

    it('should build node lookup map', () => {
      const hierarchyEdgeTypes: string[] = [];
      const result = service.buildRelationshipMaps(nodes, links, hierarchyEdgeTypes);

      expect(result.nodeMap.get('tenant-1')).toBe(nodes[0]);
      expect(result.nodeMap.get('vrf-1')).toBe(nodes[1]);
      expect(result.nodeMap.get('firewall-1')).toBe(nodes[2]);
    });

    it('should handle object-based source/target references', () => {
      const linksWithObjects = [
        { source: { id: 'tenant-1' } as any, target: 'vrf-1', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
        { source: 'vrf-1', target: { id: 'firewall-1' } as any, type: 'VRF_CONTAINS_FIREWALL', metadata: {}, originalEdge: {} },
      ];

      const hierarchyEdgeTypes = ['TENANT_CONTAINS_VRF', 'VRF_CONTAINS_FIREWALL'];
      const result = service.buildRelationshipMaps(nodes, linksWithObjects, hierarchyEdgeTypes);

      expect(result.parentMap.get('vrf-1')).toBe('tenant-1');
      expect(result.parentMap.get('firewall-1')).toBe('vrf-1');
    });

    it('should handle empty relationships gracefully', () => {
      const result = service.buildRelationshipMaps([], [], []);

      expect(result.parentMap.size).toBe(0);
      expect(result.childrenMap.size).toBe(0);
      expect(result.connectionsMap.size).toBe(0);
      expect(result.nodeMap.size).toBe(0);
    });
  });

  describe('groupNodesByLevel', () => {
    let nodes: D3Node[];

    beforeEach(() => {
      nodes = [
        { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
        { id: 'tenant-2', name: 'Tenant 2', type: 'TENANT', originalNode: {} },
        { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
        { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL', originalNode: {} },
      ];
    });

    it('should group nodes by their levels correctly', () => {
      const nodeLevels = { TENANT: 1, VRF: 2, FIREWALL: 4 };
      const result = service.groupNodesByLevel(nodes, nodeLevels);

      expect(result.get(1)).toHaveLength(2);
      expect(result.get(2)).toHaveLength(1);
      expect(result.get(4)).toHaveLength(1);
      expect(result.get(1)?.map(n => n.type)).toEqual(['TENANT', 'TENANT']);
    });

    it('should use default level for unknown node types', () => {
      const nodeLevels = { TENANT: 1 }; // VRF and FIREWALL not defined
      const result = service.groupNodesByLevel(nodes, nodeLevels);

      expect(result.get(1)).toHaveLength(2); // TENANT nodes
      expect(result.get(3)).toHaveLength(2); // VRF and FIREWALL (default level)
    });

    it('should handle empty nodes array', () => {
      const result = service.groupNodesByLevel([], {});
      expect(result.size).toBe(0);
    });
  });

  describe('validateGraphData', () => {
    it('should validate correct graph data', () => {
      const data: TransformedGraphData = {
        nodes: [
          { id: 'node-1', name: 'Node 1', type: 'TYPE1', originalNode: {} },
          { id: 'node-2', name: 'Node 2', type: 'TYPE2', originalNode: {} },
        ],
        links: [{ source: 'node-1', target: 'node-2', type: 'EDGE_TYPE', metadata: {}, originalEdge: {} }],
      };

      const result = service.validateGraphData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate node IDs', () => {
      const data: TransformedGraphData = {
        nodes: [
          { id: 'node-1', name: 'Node 1', type: 'TYPE1', originalNode: {} },
          { id: 'node-1', name: 'Node 1 Duplicate', type: 'TYPE2', originalNode: {} },
        ],
        links: [],
      };

      const result = service.validateGraphData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate node IDs detected');
    });

    it('should detect orphaned edges', () => {
      const data: TransformedGraphData = {
        nodes: [{ id: 'node-1', name: 'Node 1', type: 'TYPE1', originalNode: {} }],
        links: [
          { source: 'node-1', target: 'non-existent', type: 'EDGE_TYPE', metadata: {}, originalEdge: {} },
          { source: 'also-missing', target: 'node-1', type: 'EDGE_TYPE2', metadata: {}, originalEdge: {} },
        ],
      };

      const result = service.validateGraphData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Edge 0: Target node 'non-existent' not found");
      expect(result.errors).toContain("Edge 1: Source node 'also-missing' not found");
    });

    it('should detect missing node properties', () => {
      const data: TransformedGraphData = {
        nodes: [
          { id: '', name: 'Node 1', type: 'TYPE1', originalNode: {} }, // Missing ID
          { id: 'node-2', name: '', type: 'TYPE2', originalNode: {} }, // Missing name
          { id: 'node-3', name: 'Node 3', type: '', originalNode: {} }, // Missing type
        ],
        links: [],
      };

      const result = service.validateGraphData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Node 0: Missing ID');
      expect(result.errors).toContain('Node 1: Missing name');
      expect(result.errors).toContain('Node 2: Missing type');
    });
  });

  describe('getDataStatistics', () => {
    it('should calculate statistics correctly', () => {
      const data: TransformedGraphData = {
        nodes: [
          { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
          { id: 'tenant-2', name: 'Tenant 2', type: 'TENANT', originalNode: {} },
          { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
        ],
        links: [
          { source: 'tenant-1', target: 'vrf-1', type: 'CONTAINS', metadata: {}, originalEdge: {} },
          { source: 'tenant-2', target: 'vrf-1', type: 'CONTAINS', metadata: {}, originalEdge: {} },
          { source: 'tenant-1', target: 'tenant-2', type: 'CONNECTS', metadata: {}, originalEdge: {} },
        ],
      };

      const result = service.getDataStatistics(data);

      expect(result.totalNodes).toBe(3);
      expect(result.totalEdges).toBe(3);
      expect(result.nodeTypes).toEqual({ TENANT: 2, VRF: 1 });
      expect(result.edgeTypes).toEqual({ CONTAINS: 2, CONNECTS: 1 });
      expect(result.averageConnections).toBe(2); // (3 edges * 2) / 3 nodes
    });

    it('should handle empty data', () => {
      const data: TransformedGraphData = { nodes: [], links: [] };
      const result = service.getDataStatistics(data);

      expect(result.totalNodes).toBe(0);
      expect(result.totalEdges).toBe(0);
      expect(result.nodeTypes).toEqual({});
      expect(result.edgeTypes).toEqual({});
      expect(result.averageConnections).toBe(0);
    });

    it('should handle nodes with no edges', () => {
      const data: TransformedGraphData = {
        nodes: [
          { id: 'node-1', name: 'Node 1', type: 'TYPE1', originalNode: {} },
          { id: 'node-2', name: 'Node 2', type: 'TYPE1', originalNode: {} },
        ],
        links: [],
      };

      const result = service.getDataStatistics(data);

      expect(result.totalNodes).toBe(2);
      expect(result.totalEdges).toBe(0);
      expect(result.averageConnections).toBe(0);
    });
  });
});
