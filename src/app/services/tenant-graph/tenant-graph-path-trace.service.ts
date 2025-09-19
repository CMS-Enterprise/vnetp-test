import { Injectable, EventEmitter } from '@angular/core';

/**
 * # Tenant Graph PathTrace Service
 *
 * ## Overview
 *
 * This service handles all PathTrace functionality for tenant graph visualization.
 * It implements Dijkstra's algorithm for finding optimal paths between network nodes
 * and manages PathTrace state for visual highlighting and user interaction.
 *
 * ## Main Features
 *
 * ### 1. **Dijkstra's Algorithm Implementation**
 * - Finds shortest paths between any two nodes in the network graph
 * - Considers firewall routing costs for optimal path calculation
 * - Handles incomplete paths when no route exists
 * - Supports both client-side and server-side path calculations
 *
 * ### 2. **Interactive Node Selection**
 * - Users can right-click nodes to add them to path trace
 * - Supports up to 2 nodes (source and target) with FIFO replacement
 * - Real-time path calculation as nodes are selected
 * - Visual feedback for selected nodes
 *
 * ### 3. **Path State Management**
 * - Tracks selected nodes, path existence, and routing costs
 * - Emits state changes for external components to react
 * - Manages highlighted path data for visual rendering
 * - Supports path-only view mode
 *
 * ### 4. **Cost-based Routing**
 * - Considers firewall routing costs in path calculations
 * - Provides total cost information for found paths
 * - Handles incomplete paths with cost analysis
 * - Supports custom edge cost configurations
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private pathTraceService: TenantGraphPathTraceService) {}
 *
 * // Set graph data for path calculations
 * ngOnInit() {
 *   this.pathTraceService.setGraphData(transformedGraphData);
 *
 *   // Subscribe to state changes
 *   this.pathTraceService.pathTraceStateChange.subscribe(state => {
 *     console.log('Path state:', state);
 *     this.updateVisualHighlighting(state);
 *   });
 * }
 *
 * // Add node to path trace (typically called from context menu)
 * addNodeToPath(node: PathTraceNode) {
 *   this.pathTraceService.handlePathTraceAdd(node);
 * }
 *
 * // Clear current path trace
 * clearPath() {
 *   this.pathTraceService.clearPathTrace();
 * }
 * ```
 *
 * ## PathTrace State Interface
 *
 * ```typescript
 * interface PathTraceState {
 *   selectedNodes: PathTraceNode[];     // Currently selected nodes (max 2)
 *   pathExists: boolean;                // Whether a path was found
 *   pathLength?: number;                // Number of hops in the path
 *   highlightedPath?: {                 // Visual highlighting data
 *     nodes: string[];
 *     edges: string[];
 *   };
 *   pathTraceData?: PathTraceData;      // Complete path information
 *   showPathOnly?: boolean;             // Path-only view mode
 * }
 * ```
 *
 * ## Performance Considerations
 *
 * - **Large graphs**: Dijkstra's algorithm is O(V²) - consider server-side calculation for 100+ nodes
 * - **Real-time updates**: Path calculation happens immediately when nodes are selected
 * - **Memory usage**: Maintains adjacency lists and distance maps during calculation
 */

export interface PathTraceNode {
  id: string;
  name: string;
  type: string;
}

export interface PathTraceHop {
  nodeId: string;
  edgeId?: string;
  cost?: number;
  isLastHop?: boolean;
}

export interface PathTraceData {
  source: PathTraceNode;
  target: PathTraceNode;
  path: PathTraceHop[];
  isComplete: boolean;
  totalCost?: number;
  calculationSource: 'client' | 'server';
  lastHopNodeId?: string; // For incomplete paths
}

export interface PathTraceState {
  selectedNodes: PathTraceNode[];
  pathExists: boolean;
  pathLength?: number;
  highlightedPath?: { nodes: string[]; edges: string[] };
  pathTraceData?: PathTraceData;
  showPathOnly?: boolean;
}

export interface GraphData {
  nodes: any[];
  links: any[];
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphPathTraceService {
  public pathTraceStateChange = new EventEmitter<PathTraceState>();

  private pathTraceState: PathTraceState = {
    selectedNodes: [],
    pathExists: false,
    highlightedPath: undefined,
    pathTraceData: undefined,
    showPathOnly: false,
  };

  private currentGraphData: GraphData = { nodes: [], links: [] };

  public setGraphData(graphData: GraphData): void {
    this.currentGraphData = graphData;
  }

  public handlePathTraceAdd(node: PathTraceNode): void {
    // Add node to selection (max 2, FIFO)
    this.pathTraceState.selectedNodes.push(node);
    if (this.pathTraceState.selectedNodes.length > 2) {
      this.pathTraceState.selectedNodes.shift(); // Remove oldest
    }

    // Update path trace state
    this.updatePathTraceState();
  }

  public clearPathTrace(): void {
    this.pathTraceState = {
      selectedNodes: [],
      pathExists: false,
      highlightedPath: undefined,
      pathTraceData: undefined,
      showPathOnly: false,
    };
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public setExternalPathTraceData(pathTraceData: PathTraceData): void {
    this.pathTraceState.selectedNodes = [pathTraceData.source, pathTraceData.target];
    this.pathTraceState.pathExists = pathTraceData.isComplete;
    this.pathTraceState.pathLength = pathTraceData.path.length;
    this.pathTraceState.pathTraceData = pathTraceData;

    // Convert to highlightedPath format
    this.pathTraceState.highlightedPath = {
      nodes: pathTraceData.path.map(hop => hop.nodeId),
      edges: pathTraceData.path.map(hop => hop.edgeId).filter(id => id) as string[],
    };

    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public togglePathOnlyView(): void {
    this.pathTraceState.showPathOnly = !this.pathTraceState.showPathOnly;
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public getPathTraceState(): PathTraceState {
    return { ...this.pathTraceState };
  }

  private updatePathTraceState(): void {
    if (this.pathTraceState.selectedNodes.length === 1) {
      // Single node selected - just highlight it
      this.pathTraceState.pathExists = false;
      this.pathTraceState.highlightedPath = {
        nodes: [this.pathTraceState.selectedNodes[0].id],
        edges: [],
      };
    } else if (this.pathTraceState.selectedNodes.length === 2) {
      // Two nodes selected - find path (client-side calculation)
      const pathResult = this.findPathWithCosts(this.pathTraceState.selectedNodes[0].id, this.pathTraceState.selectedNodes[1].id);

      if (pathResult && pathResult.nodes.length > 0) {
        this.pathTraceState.pathExists = pathResult.isComplete;
        this.pathTraceState.pathLength = pathResult.nodes.length;
        this.pathTraceState.highlightedPath = {
          nodes: pathResult.nodes,
          edges: pathResult.edges,
        };

        // Create PathTraceData for client-side calculation
        this.pathTraceState.pathTraceData = {
          source: this.pathTraceState.selectedNodes[0],
          target: this.pathTraceState.selectedNodes[1],
          path: pathResult.nodes.map((nodeId, index) => ({
            nodeId,
            edgeId: pathResult.edges[index],
            cost: pathResult.costs[index],
            isLastHop: !pathResult.isComplete && index === pathResult.nodes.length - 1,
          })),
          isComplete: pathResult.isComplete,
          totalCost: pathResult.totalCost,
          calculationSource: 'client',
          lastHopNodeId: !pathResult.isComplete ? pathResult.nodes[pathResult.nodes.length - 1] : undefined,
        };
      } else {
        this.pathTraceState.pathExists = false;
        this.pathTraceState.highlightedPath = {
          nodes: this.pathTraceState.selectedNodes.map(n => n.id),
          edges: [],
        };
        this.pathTraceState.pathTraceData = undefined;
      }
    } else {
      this.pathTraceState.pathExists = false;
      this.pathTraceState.highlightedPath = undefined;
    }

    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  private findPathWithCosts(
    sourceId: string,
    targetId: string,
  ): { nodes: string[]; edges: string[]; costs: number[]; isComplete: boolean; totalCost: number } | null {
    // Build adjacency list with routing costs
    const adjacencyList = new Map<string, Array<{ nodeId: string; edgeId: string; cost: number }>>();
    const nodeMap = new Map<string, any>();

    this.currentGraphData.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
      nodeMap.set(node.id, node);
    });

    this.currentGraphData.links.forEach(link => {
      const sourceNodeId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetNodeId = typeof link.target === 'object' ? link.target.id : link.target;

      // Skip tenant containment edges
      if (link.type.startsWith('TENANT_CONTAINS_')) {
        return;
      }

      // Calculate edge cost based on target node (firewall routing cost)
      let edgeCost = 0;
      const targetNode = nodeMap.get(targetNodeId);
      if (targetNode && targetNode.type === 'EXTERNAL_FIREWALL') {
        edgeCost = targetNode.originalNode?.config?.routingCost ?? 999;
      }

      const edgeId = link.originalEdge?.id || `${sourceNodeId}-${targetNodeId}`;

      // Add bidirectional connections
      adjacencyList.get(sourceNodeId)?.push({ nodeId: targetNodeId, edgeId, cost: edgeCost });
      adjacencyList.get(targetNodeId)?.push({ nodeId: sourceNodeId, edgeId, cost: edgeCost });
    });

    // Dijkstra's algorithm for lowest cost path
    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; edgeId: string; cost: number } | null>();
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; cost: number }> = [];

    // Initialize distances
    this.currentGraphData.nodes.forEach(node => {
      distances.set(node.id, node.id === sourceId ? 0 : Infinity);
    });
    queue.push({ nodeId: sourceId, cost: 0 });

    while (queue.length > 0) {
      // Find node with minimum cost
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift();

      if (visited.has(current.nodeId)) {
        continue;
      }
      visited.add(current.nodeId);

      if (current.nodeId === targetId) {
        break; // Found target
      }

      const neighbors = adjacencyList.get(current.nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.nodeId)) {
          const newCost = current.cost + neighbor.cost;
          if (newCost < (distances.get(neighbor.nodeId) || Infinity)) {
            distances.set(neighbor.nodeId, newCost);
            previous.set(neighbor.nodeId, { nodeId: current.nodeId, edgeId: neighbor.edgeId, cost: neighbor.cost });
            queue.push({ nodeId: neighbor.nodeId, cost: newCost });
          }
        }
      }
    }

    // Reconstruct path
    if (!previous.has(targetId) && targetId !== sourceId) {
      return null; // No path found
    }

    const path: string[] = [];
    const edges: string[] = [];
    const costs: number[] = [];
    let currentNode = targetId;
    let isComplete = true;

    while (currentNode !== sourceId) {
      path.unshift(currentNode);
      const prev = previous.get(currentNode);
      if (!prev) {
        isComplete = false;
        break;
      }
      if (prev.edgeId) {
        edges.unshift(prev.edgeId);
      }
      costs.unshift(prev.cost);
      currentNode = prev.nodeId;
    }
    path.unshift(sourceId);

    const totalCost = costs.reduce((sum, cost) => sum + cost, 0);

    return {
      nodes: path,
      edges,
      costs,
      isComplete,
      totalCost,
    };
  }
}
