/* eslint-disable */
import { TenantGraphLayoutService, LayoutResult, LayoutConfig } from './tenant-graph-layout.service';
import { D3Node, D3Link } from './tenant-graph-data.service';

describe('TenantGraphLayoutService', () => {
  let service: TenantGraphLayoutService;
  let mockNodes: D3Node[];
  let mockLinks: D3Link[];
  let baseConfig: LayoutConfig;

  beforeEach(() => {
    service = new TenantGraphLayoutService();

    // Setup mock nodes representing a typical network hierarchy
    mockNodes = [
      { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
      { id: 'tenant-2', name: 'Tenant 2', type: 'TENANT', originalNode: {} },
      { id: 'vrf-1', name: 'VRF 1', type: 'VRF', originalNode: {} },
      { id: 'vrf-2', name: 'VRF 2', type: 'VRF', originalNode: {} },
      { id: 'l3out-1', name: 'L3Out 1', type: 'L3OUT', originalNode: {} },
      { id: 'firewall-1', name: 'Firewall 1', type: 'FIREWALL', originalNode: {} },
    ];

    // Setup mock links representing hierarchical relationships
    mockLinks = [
      { source: 'tenant-1', target: 'vrf-1', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
      { source: 'tenant-2', target: 'vrf-2', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
      { source: 'vrf-1', target: 'l3out-1', type: 'VRF_TO_L3OUT', metadata: {}, originalEdge: {} },
      { source: 'l3out-1', target: 'firewall-1', type: 'L3OUT_TO_FIREWALL', metadata: {}, originalEdge: {} },
    ];

    // Base configuration for testing
    baseConfig = {
      width: 1200,
      height: 800,
      margins: { top: 40, bottom: 30 },
      clusterConfig: { widthPercent: 0.7, startPercent: 0.15 },
      levelLabels: { 1: 'Tenant', 2: 'VRF', 3: 'L3Out', 4: 'Firewall' },
      nodeLevels: { TENANT: 1, VRF: 2, L3OUT: 3, FIREWALL: 4 },
      layoutMode: 'hierarchical',
    };
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have HIERARCHY_EDGE_TYPES defined', () => {
      // Test indirectly by checking hierarchical layout behavior
      const result = service.calculateLayout(mockNodes, mockLinks, baseConfig);
      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
    });
  });

  describe('calculateLayout - Layout Mode Routing', () => {
    it('should route to hierarchical layout by default', () => {
      const config = { ...baseConfig };
      delete config.layoutMode; // Remove layoutMode to test default

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
      expect(result.ringRadii).toBeUndefined(); // Hierarchical doesn't have rings
    });

    it('should route to hierarchical layout when specified', () => {
      const config = { ...baseConfig, layoutMode: 'hierarchical' as const };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
      expect(result.ringRadii).toBeUndefined();
    });

    it('should route to circular layout when specified', () => {
      const config = {
        ...baseConfig,
        layoutMode: 'circular' as const,
        circularConfig: {
          centerLevel: 1,
          radiusMultiplier: 1.2,
          startAngle: -Math.PI / 2,
          ringSpacing: 80,
          minRadius: 60,
        },
      };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
      expect(result.ringRadii).toBeDefined(); // Circular has rings
    });

    it('should route to force-directed layout when specified', () => {
      const config = {
        ...baseConfig,
        layoutMode: 'force-directed' as const,
        forceConfig: {
          linkStrength: 0.7,
          chargeStrength: -300,
          centerStrength: 0.1,
          collisionRadius: 25,
          tenantAnchorStrength: 0.3,
          iterations: 300,
          alphaDecay: 0.02,
        },
      };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
    });
  });

  describe('Hierarchical Layout', () => {
    it('should calculate hierarchical positions correctly', () => {
      const result = service.calculateLayout(mockNodes, mockLinks, baseConfig);

      // Verify all nodes have positions
      mockNodes.forEach(node => {
        expect(result.clusterCenters.has(node.id)).toBe(true);
        const x = result.clusterCenters.get(node.id);
        expect(typeof x).toBe('number');
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(baseConfig.width);
      });

      // Verify yForType function works
      expect(typeof result.yForType('TENANT')).toBe('number');
      expect(typeof result.yForType('VRF')).toBe('number');
      expect(typeof result.yForType('L3OUT')).toBe('number');
      expect(typeof result.yForType('FIREWALL')).toBe('number');
    });

    it('should position tenant nodes at center for level 1', () => {
      const result = service.calculateLayout(mockNodes, mockLinks, baseConfig);

      const tenant1X = result.clusterCenters.get('tenant-1');
      const tenant2X = result.clusterCenters.get('tenant-2');

      expect(tenant1X).toBe(baseConfig.width / 2);
      expect(tenant2X).toBe(baseConfig.width / 2);
    });

    it('should calculate correct Y positions for different node types', () => {
      const result = service.calculateLayout(mockNodes, mockLinks, baseConfig);

      const tenantY = result.yForType('TENANT');
      const vrfY = result.yForType('VRF');
      const l3outY = result.yForType('L3OUT');
      const firewallY = result.yForType('FIREWALL');

      // Y positions should increase with level (top to bottom)
      expect(tenantY).toBeLessThan(vrfY);
      expect(vrfY).toBeLessThan(l3outY);
      expect(l3outY).toBeLessThan(firewallY);
    });

    it('should use default level 3 for unknown node types', () => {
      const unknownNode: D3Node = { id: 'unknown', name: 'Unknown', type: 'UNKNOWN_TYPE', originalNode: {} };
      const nodesWithUnknown = [...mockNodes, unknownNode];

      const result = service.calculateLayout(nodesWithUnknown, mockLinks, baseConfig);

      const unknownY = result.yForType('UNKNOWN_TYPE');
      const l3outY = result.yForType('L3OUT'); // Level 3

      expect(unknownY).toBe(l3outY); // Should default to level 3
    });

    it('should handle display order positioning when nodes have displayOrder', () => {
      const nodesWithDisplayOrder: D3Node[] = [
        {
          id: 'vrf-1',
          name: 'VRF 1',
          type: 'VRF',
          originalNode: { config: { displayOrder: 2 } },
        },
        {
          id: 'vrf-2',
          name: 'VRF 2',
          type: 'VRF',
          originalNode: { config: { displayOrder: 1 } },
        },
        {
          id: 'vrf-3',
          name: 'VRF 3',
          type: 'VRF',
          originalNode: { config: { displayOrder: 3 } },
        },
      ];

      const result = service.calculateLayout(nodesWithDisplayOrder, [], baseConfig);

      const vrf1X = result.clusterCenters.get('vrf-1')!;
      const vrf2X = result.clusterCenters.get('vrf-2')!;
      const vrf3X = result.clusterCenters.get('vrf-3')!;

      // Nodes should be positioned in displayOrder (vrf-2, vrf-1, vrf-3)
      expect(vrf2X).toBeLessThan(vrf1X); // displayOrder 1 < 2
      expect(vrf1X).toBeLessThan(vrf3X); // displayOrder 2 < 3
    });

    it('should handle metadata displayOrder as fallback', () => {
      const nodesWithMetadataOrder: D3Node[] = [
        {
          id: 'vrf-1',
          name: 'VRF 1',
          type: 'VRF',
          originalNode: { metadata: { displayOrder: 2 } },
        },
        {
          id: 'vrf-2',
          name: 'VRF 2',
          type: 'VRF',
          originalNode: { metadata: { displayOrder: 1 } },
        },
      ];

      const result = service.calculateLayout(nodesWithMetadataOrder, [], baseConfig);

      const vrf1X = result.clusterCenters.get('vrf-1')!;
      const vrf2X = result.clusterCenters.get('vrf-2')!;

      expect(vrf2X).toBeLessThan(vrf1X); // metadata displayOrder 1 < 2
    });

    it('should handle empty nodes gracefully', () => {
      const result = service.calculateLayout([], [], baseConfig);

      expect(result.clusterCenters.size).toBe(0);
      expect(typeof result.yForType).toBe('function');
    });

    it('should handle nodes without links', () => {
      const isolatedNodes: D3Node[] = [
        { id: 'isolated-1', name: 'Isolated 1', type: 'VRF', originalNode: {} },
        { id: 'isolated-2', name: 'Isolated 2', type: 'VRF', originalNode: {} },
      ];

      const result = service.calculateLayout(isolatedNodes, [], baseConfig);

      expect(result.clusterCenters.has('isolated-1')).toBe(true);
      expect(result.clusterCenters.has('isolated-2')).toBe(true);
    });
  });

  describe('Circular Layout', () => {
    it('should calculate circular layout with rings', () => {
      const config = {
        ...baseConfig,
        layoutMode: 'circular' as const,
        circularConfig: {
          centerLevel: 1,
          radiusMultiplier: 1.2,
          startAngle: -Math.PI / 2,
          ringSpacing: 80,
          minRadius: 60,
        },
      };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
      expect(result.ringRadii).toBeDefined();
      expect(result.ringRadii!.length).toBeGreaterThan(0);

      // All nodes should have positions
      mockNodes.forEach(node => {
        expect(result.clusterCenters.has(node.id)).toBe(true);
      });
    });

    it('should use default circular config when not provided', () => {
      const config = { ...baseConfig, layoutMode: 'circular' as const };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
      expect(result.ringRadii).toBeDefined();
    });

    it('should position nodes in concentric rings based on hierarchy', () => {
      const config = {
        ...baseConfig,
        layoutMode: 'circular' as const,
        circularConfig: { centerLevel: 1 },
      };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      // Center level (TENANT) nodes should be closer to center
      const centerX = baseConfig.width / 2;
      const centerY = baseConfig.height / 2;

      const tenant1X = result.clusterCenters.get('tenant-1')!;
      const tenant1Y = result.yForType('TENANT');
      const tenantDistanceFromCenter = Math.sqrt(Math.pow(tenant1X - centerX, 2) + Math.pow(tenant1Y - centerY, 2));

      const vrf1X = result.clusterCenters.get('vrf-1')!;
      const vrf1Y = result.yForType('VRF');
      const vrfDistanceFromCenter = Math.sqrt(Math.pow(vrf1X - centerX, 2) + Math.pow(vrf1Y - centerY, 2));

      // Tenant (center level) should be closer to center than VRF
      expect(tenantDistanceFromCenter).toBeLessThanOrEqual(vrfDistanceFromCenter);
    });
  });

  describe('Force-Directed Layout', () => {
    it('should calculate force-directed layout', () => {
      const config = {
        ...baseConfig,
        layoutMode: 'force-directed' as const,
        forceConfig: {
          linkStrength: 0.7,
          chargeStrength: -300,
          iterations: 50, // Reduce iterations for faster testing
        },
      };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();

      // All nodes should have positions
      mockNodes.forEach(node => {
        expect(result.clusterCenters.has(node.id)).toBe(true);
        const x = result.clusterCenters.get(node.id)!;
        expect(typeof x).toBe('number');
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(baseConfig.width);
      });
    });

    it('should use default force config when not provided', () => {
      const config = { ...baseConfig, layoutMode: 'force-directed' as const };

      const result = service.calculateLayout(mockNodes, mockLinks, config);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
    });

    it('should handle tenant anchor strength for TENANT nodes', () => {
      const tenantOnlyNodes: D3Node[] = [
        { id: 'tenant-1', name: 'Tenant 1', type: 'TENANT', originalNode: {} },
        { id: 'tenant-2', name: 'Tenant 2', type: 'TENANT', originalNode: {} },
      ];

      const config = {
        ...baseConfig,
        layoutMode: 'force-directed' as const,
        forceConfig: {
          tenantAnchorStrength: 0.8, // Strong anchor
          iterations: 50,
        },
      };

      const result = service.calculateLayout(tenantOnlyNodes, [], config);

      // TENANT nodes should be positioned (anchoring is handled in simulation)
      expect(result.clusterCenters.has('tenant-1')).toBe(true);
      expect(result.clusterCenters.has('tenant-2')).toBe(true);
    });
  });

  describe('Relationship Analysis', () => {
    it('should build relationship maps correctly', () => {
      // Test indirectly by checking that hierarchical positioning works
      const result = service.calculateLayout(mockNodes, mockLinks, baseConfig);

      // VRF nodes should be positioned relative to their tenant parents
      const tenant1X = result.clusterCenters.get('tenant-1')!;
      const vrf1X = result.clusterCenters.get('vrf-1')!;

      // Child should be positioned (not necessarily exactly at parent, but positioned)
      expect(typeof vrf1X).toBe('number');
      expect(vrf1X).toBeGreaterThanOrEqual(0);
    });

    it('should handle object-based source/target in links', () => {
      const linksWithObjects: D3Link[] = [
        {
          source: { id: 'tenant-1' } as any,
          target: { id: 'vrf-1' } as any,
          type: 'TENANT_CONTAINS_VRF',
          metadata: {},
          originalEdge: {},
        },
      ];

      const result = service.calculateLayout(mockNodes, linksWithObjects, baseConfig);

      expect(result.clusterCenters.has('tenant-1')).toBe(true);
      expect(result.clusterCenters.has('vrf-1')).toBe(true);
    });

    it('should handle missing source/target IDs gracefully', () => {
      const linksWithMissingIds: D3Link[] = [
        {
          source: {} as any, // No id property
          target: {} as any, // No id property
          type: 'TENANT_CONTAINS_VRF',
          metadata: {},
          originalEdge: {},
        },
      ];

      expect(() => {
        service.calculateLayout(mockNodes, linksWithMissingIds, baseConfig);
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle configuration with missing levelLabels', () => {
      const configWithMissingLabels = {
        ...baseConfig,
        levelLabels: {}, // Empty level labels
      };

      const result = service.calculateLayout(mockNodes, mockLinks, configWithMissingLabels);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
    });

    it('should handle configuration with missing nodeLevels', () => {
      const configWithMissingLevels = {
        ...baseConfig,
        nodeLevels: {}, // Empty node levels
      };

      const result = service.calculateLayout(mockNodes, mockLinks, configWithMissingLevels);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();

      // Should default all nodes to level 3
      const tenantY = result.yForType('TENANT');
      const vrfY = result.yForType('VRF');
      expect(tenantY).toBe(vrfY); // Both should use default level 3
    });

    it('should handle very small dimensions', () => {
      const smallConfig = {
        ...baseConfig,
        width: 10,
        height: 10,
      };

      const result = service.calculateLayout(mockNodes, mockLinks, smallConfig);

      expect(result.clusterCenters).toBeDefined();
      mockNodes.forEach(node => {
        const x = result.clusterCenters.get(node.id)!;
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(10);
      });
    });

    it('should handle large margins that exceed height', () => {
      const largeMarginConfig = {
        ...baseConfig,
        height: 100,
        margins: { top: 60, bottom: 60 }, // Total 120 > height 100
      };

      const result = service.calculateLayout(mockNodes, mockLinks, largeMarginConfig);

      expect(result.clusterCenters).toBeDefined();
      expect(result.yForType).toBeDefined();
      expect(typeof result.yForType('TENANT')).toBe('number');
    });

    it('should handle duplicate node IDs gracefully', () => {
      const duplicateNodes: D3Node[] = [
        { id: 'duplicate', name: 'Node 1', type: 'TENANT', originalNode: {} },
        { id: 'duplicate', name: 'Node 2', type: 'VRF', originalNode: {} },
      ];

      const result = service.calculateLayout(duplicateNodes, [], baseConfig);

      expect(result.clusterCenters.has('duplicate')).toBe(true);
    });

    it('should handle circular references in hierarchy', () => {
      const circularLinks: D3Link[] = [
        { source: 'node-1', target: 'node-2', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
        { source: 'node-2', target: 'node-1', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
      ];

      const circularNodes: D3Node[] = [
        { id: 'node-1', name: 'Node 1', type: 'TENANT', originalNode: {} },
        { id: 'node-2', name: 'Node 2', type: 'VRF', originalNode: {} },
      ];

      expect(() => {
        service.calculateLayout(circularNodes, circularLinks, baseConfig);
      }).not.toThrow();
    });

    it('should handle nodes with invalid displayOrder values', () => {
      const invalidOrderNodes: D3Node[] = [
        {
          id: 'vrf-1',
          name: 'VRF 1',
          type: 'VRF',
          originalNode: { config: { displayOrder: 'invalid' } },
        },
        {
          id: 'vrf-2',
          name: 'VRF 2',
          type: 'VRF',
          originalNode: { config: { displayOrder: null } },
        },
      ];

      const result = service.calculateLayout(invalidOrderNodes, [], baseConfig);

      expect(result.clusterCenters.has('vrf-1')).toBe(true);
      expect(result.clusterCenters.has('vrf-2')).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large numbers of nodes efficiently', () => {
      const largeNodeSet: D3Node[] = [];
      const largeLinksSet: D3Link[] = [];

      // Create 50 nodes
      for (let i = 0; i < 50; i++) {
        largeNodeSet.push({
          id: `node-${i}`,
          name: `Node ${i}`,
          type: i < 10 ? 'TENANT' : i < 30 ? 'VRF' : 'FIREWALL',
          originalNode: {},
        });

        if (i > 0) {
          largeLinksSet.push({
            source: `node-${Math.floor(i / 2)}`,
            target: `node-${i}`,
            type: 'TENANT_CONTAINS_VRF',
            metadata: {},
            originalEdge: {},
          });
        }
      }

      const startTime = Date.now();
      const result = service.calculateLayout(largeNodeSet, largeLinksSet, baseConfig);
      const endTime = Date.now();

      expect(result.clusterCenters.size).toBe(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle disconnected components', () => {
      const disconnectedNodes: D3Node[] = [
        { id: 'component1-node1', name: 'C1 N1', type: 'TENANT', originalNode: {} },
        { id: 'component1-node2', name: 'C1 N2', type: 'VRF', originalNode: {} },
        { id: 'component2-node1', name: 'C2 N1', type: 'TENANT', originalNode: {} },
        { id: 'component2-node2', name: 'C2 N2', type: 'VRF', originalNode: {} },
      ];

      const disconnectedLinks: D3Link[] = [
        { source: 'component1-node1', target: 'component1-node2', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
        { source: 'component2-node1', target: 'component2-node2', type: 'TENANT_CONTAINS_VRF', metadata: {}, originalEdge: {} },
        // No connection between component1 and component2
      ];

      const result = service.calculateLayout(disconnectedNodes, disconnectedLinks, baseConfig);

      // All nodes should still get positions
      disconnectedNodes.forEach(node => {
        expect(result.clusterCenters.has(node.id)).toBe(true);
      });
    });
  });
});
