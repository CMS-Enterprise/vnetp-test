import { Injectable } from '@angular/core';
import { TenantConnectivityGraph } from 'client';

/**
 * # Tenant Graph Data Service
 *
 * ## Overview
 *
 * This service handles all data transformation operations for tenant graph visualization.
 * It converts backend graph data structures into D3-compatible formats and provides
 * data validation, relationship mapping, and statistical analysis capabilities.
 *
 * ## Main Responsibilities
 *
 * ### 1. **Data Transformation**
 * - Converts `TenantConnectivityGraph` (backend format) to D3-compatible format
 * - Filters edges based on configuration (e.g., hide specific edge types)
 * - Preserves original node/edge data for detailed information display
 * - Handles data validation and integrity checking
 *
 * ### 2. **Relationship Mapping**
 * - Builds parent-child relationship maps for hierarchical layout
 * - Creates connection maps for all node relationships
 * - Identifies hierarchical vs. non-hierarchical connections
 * - Supports complex network topology analysis
 *
 * ### 3. **Data Organization**
 * - Groups nodes by hierarchy levels (1-7) based on node types
 * - Organizes data structures for efficient layout calculations
 * - Provides node lookup maps for quick access
 * - Maintains bidirectional connection tracking
 *
 * ### 4. **Data Validation & Statistics**
 * - Validates graph data integrity (orphaned edges, missing nodes)
 * - Provides statistical analysis of graph structure
 * - Detects data inconsistencies and reports errors
 * - Calculates graph metrics (node counts, connection density)
 *
 * ## Network Hierarchy Support
 *
 * The service understands the default network hierarchy:
 * 1. **Tenant** (top level)
 * 2. **VRF** (Virtual Routing and Forwarding)
 * 3. **Service Graph / L3Out** (routing/services layer)
 * 4. **Firewalls** (security layer)
 * 5. **External VRF Connections**
 * 6. **External VRFs**
 * 7. **Detailed components** (filters, entries, etc.)
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private dataService: TenantGraphDataService) {}
 *
 * // Transform backend data
 * transformData(backendGraph: TenantConnectivityGraph) {
 *   const config: DataTransformConfig = {
 *     hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL'],
 *     validateConnections: true,
 *     includeMetadata: true
 *   };
 *
 *   const transformedData = this.dataService.transformGraphData(backendGraph, config);
 *
 *   // Validate the data
 *   const validation = this.dataService.validateGraphData(transformedData);
 *   if (!validation.isValid) {
 *     console.error('Data validation errors:', validation.errors);
 *   }
 *
 *   // Get statistics
 *   const stats = this.dataService.getDataStatistics(transformedData);
 *   console.log('Graph stats:', stats);
 *
 *   return transformedData;
 * }
 * ```
 *
 * ## Data Flow
 *
 * ```
 * Backend Graph → Data Service → D3 Format → Layout Service → Rendering
 *     ↓              ↓              ↓            ↓             ↓
 * TenantConnectivity → Transform → D3Node/D3Link → Positions → Visual
 * Graph (API format)   & Validate   (D3 format)   (x,y coords) (SVG)
 * ```
 */

export interface D3Node {
  id: string;
  name: string;
  type: string;
  originalNode: any;
}

export interface D3Link {
  source: string;
  target: string;
  type: string;
  metadata: any;
  originalEdge: any;
}

export interface TransformedGraphData {
  nodes: D3Node[];
  links: D3Link[];
}

export interface DataTransformConfig {
  hideEdgeTypes?: string[];
  includeMetadata?: boolean;
  validateConnections?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphDataService {
  /**
   * Transform backend graph data to D3-compatible format
   */
  public transformGraphData(graph: TenantConnectivityGraph, config: DataTransformConfig = {}): TransformedGraphData {
    const hideEdgeTypes = config.hideEdgeTypes || [];

    // Transform nodes
    const nodes: D3Node[] = Object.values(graph.nodes).map(graphNode => ({
      id: graphNode.id,
      name: graphNode.name,
      type: graphNode.type,
      originalNode: graphNode,
    }));

    // Transform and filter edges
    const links: D3Link[] = Object.values(graph.edges)
      .filter(edge => {
        // Filter out specified edge types
        if (hideEdgeTypes.includes(edge.type)) {
          return false;
        }

        // Optional: Validate connections exist
        if (config.validateConnections) {
          const sourceExists = nodes.some(n => n.id === edge.sourceNodeId);
          const targetExists = nodes.some(n => n.id === edge.targetNodeId);
          return sourceExists && targetExists;
        }

        return true;
      })
      .map(edge => ({
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: edge.type,
        metadata: config.includeMetadata ? edge.metadata : edge.metadata,
        originalEdge: edge,
      }));

    return { nodes, links };
  }

  /**
   * Build relationship maps for layout calculations
   */
  public buildRelationshipMaps(nodes: D3Node[], links: D3Link[], hierarchyEdgeTypes: string[]) {
    const parentMap = new Map<string, string>();
    const childrenMap = new Map<string, string[]>();
    const connectionsMap = new Map<string, string[]>(); // All connections, not just hierarchical
    const nodeMap = new Map<string, any>();

    // Build node lookup
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      connectionsMap.set(node.id, []);
    });

    // Build relationship maps
    links.forEach(edge => {
      const sourceId = typeof edge.source === 'object' ? (edge.source as any)?.id || '' : edge.source;
      const targetId = typeof edge.target === 'object' ? (edge.target as any)?.id || '' : edge.target;

      // Track all connections
      if (!connectionsMap.has(sourceId)) {
        connectionsMap.set(sourceId, []);
      }
      if (!connectionsMap.has(targetId)) {
        connectionsMap.set(targetId, []);
      }
      connectionsMap.get(sourceId)?.push(targetId);
      connectionsMap.get(targetId)?.push(sourceId);

      // Track hierarchical relationships
      if (hierarchyEdgeTypes.includes(edge.type)) {
        parentMap.set(targetId, sourceId);
        if (!childrenMap.has(sourceId)) {
          childrenMap.set(sourceId, []);
        }
        childrenMap.get(sourceId)?.push(targetId);
      }
    });

    return { parentMap, childrenMap, connectionsMap, nodeMap };
  }

  /**
   * Group nodes by their level/type
   */
  public groupNodesByLevel(nodes: D3Node[], nodeLevels: Record<string, number>): Map<number, D3Node[]> {
    const nodesByLevel = new Map<number, D3Node[]>();

    nodes.forEach(node => {
      const level = nodeLevels[node.type] || 3;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)?.push(node);
    });

    return nodesByLevel;
  }

  /**
   * Validate graph data integrity
   */
  public validateGraphData(data: TransformedGraphData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodeIds = new Set(data.nodes.map(n => n.id));

    // Check for duplicate node IDs
    if (nodeIds.size !== data.nodes.length) {
      errors.push('Duplicate node IDs detected');
    }

    // Check for orphaned edges
    data.links.forEach((link, index) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source;
      const targetId = typeof link.target === 'string' ? link.target : link.target;

      if (!nodeIds.has(sourceId)) {
        errors.push(`Edge ${index}: Source node '${sourceId}' not found`);
      }
      if (!nodeIds.has(targetId)) {
        errors.push(`Edge ${index}: Target node '${targetId}' not found`);
      }
    });

    // Check for required node properties
    data.nodes.forEach((node, index) => {
      if (!node.id) {
        errors.push(`Node ${index}: Missing ID`);
      }
      if (!node.name) {
        errors.push(`Node ${index}: Missing name`);
      }
      if (!node.type) {
        errors.push(`Node ${index}: Missing type`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get statistics about the transformed data
   */
  public getDataStatistics(data: TransformedGraphData) {
    const nodeTypeCount = new Map<string, number>();
    const edgeTypeCount = new Map<string, number>();

    data.nodes.forEach(node => {
      const count = nodeTypeCount.get(node.type) || 0;
      nodeTypeCount.set(node.type, count + 1);
    });

    data.links.forEach(link => {
      const count = edgeTypeCount.get(link.type) || 0;
      edgeTypeCount.set(link.type, count + 1);
    });

    return {
      totalNodes: data.nodes.length,
      totalEdges: data.links.length,
      nodeTypes: Object.fromEntries(nodeTypeCount),
      edgeTypes: Object.fromEntries(edgeTypeCount),
      averageConnections: data.links.length > 0 ? (data.links.length * 2) / data.nodes.length : 0,
    };
  }
}
