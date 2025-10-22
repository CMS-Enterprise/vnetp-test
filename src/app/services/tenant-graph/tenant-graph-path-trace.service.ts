import { Injectable, EventEmitter } from '@angular/core';
import { UtilitiesService, EndpointConnectivityNodeQuery, PathResult, PathTraceData, PathTraceNode, PathInfo } from 'client';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * # Tenant Graph PathTrace Service
 *
 * ## Overview
 *
 * This service handles all PathTrace functionality for tenant graph visualization.
 * It uses the backend API to calculate optimal paths between network nodes with
 * full control plane validation including firewall rules and routing policies.
 *
 * ## Main Features
 *
 * ### 1. **Server-Side Path Calculation**
 * - Finds shortest paths using backend Dijkstra implementation
 * - Validates firewall rules and routing policies
 * - Considers firewall routing costs for optimal path calculation
 * - Handles incomplete paths when no route exists
 *
 * ### 2. **Interactive Node Selection**
 * - Users can right-click nodes to add them to path trace
 * - Supports up to 2 nodes (source and target) with FIFO replacement
 * - Automatic API-based path calculation as nodes are selected
 * - Visual feedback for selected nodes and loading states
 *
 * ### 3. **Path State Management**
 * - Tracks selected nodes, path existence, and routing costs
 * - Emits state changes for external components to react
 * - Manages highlighted path data for visual rendering
 * - Supports path-only view mode
 * - Handles loading and error states
 *
 * ### 4. **Cost-based Routing**
 * - Backend considers firewall routing costs in path calculations
 * - Provides total cost information for found paths
 * - Handles incomplete paths with cost analysis
 * - Validates control plane configurations
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private pathTraceService: TenantGraphPathTraceService) {}
 *
 * // Set tenant ID for API path calculations
 * ngOnInit() {
 *   this.pathTraceService.setTenantId(this.tenantId);
 *
 *   // Subscribe to state changes
 *   this.pathTraceService.pathTraceStateChange.subscribe(state => {
 *     console.log('Path state:', state);
 *     if (state.isCalculating) {
 *       console.log('Calculating path...');
 *     }
 *     if (state.calculationError) {
 *       console.error('Error:', state.calculationError);
 *     }
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
 *
 * // Toggle hop index display (cycles through: control -> data -> none -> control)
 * toggleHopIndex() {
 *   this.pathTraceService.toggleHopIndex();
 * }
 *
 * // Check current hop index display mode
 * const mode = this.pathTraceService.getPathTraceState().hopIndexDisplayMode;
 * // mode can be: 'control', 'data', or 'none'
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
 *   hopIndexDisplayMode?: HopIndexDisplayMode; // 'control', 'data', or 'none'
 *   isCalculating?: boolean;            // API calculation in progress
 *   calculationError?: string;          // Error message if calculation failed
 * }
 * ```
 *
 * ## Performance Considerations
 *
 * - **Server-side calculation**: All path calculations happen on the backend
 * - **Database-intensive validation**: Firewall rules and configs validated server-side
 * - **No client-side graph processing**: Minimal memory footprint
 * - **Async operations**: UI remains responsive during path calculation
 */

// Re-export types from client for convenience
export type { PathTraceNode, PathTraceData, PathInfo } from 'client';

export type HopIndexDisplayMode = 'none' | 'control' | 'data';

export interface PathTraceState {
  selectedNodes: PathTraceNode[];
  pathExists: boolean;
  pathLength?: number;
  highlightedPath?: { nodes: string[]; edges: string[] };
  pathTraceData?: PathTraceData;
  controlPath?: PathInfo;
  dataPath?: PathInfo;
  controlPlaneAllowed?: boolean;
  showPathOnly?: boolean;
  showControlPath?: boolean;
  showDataPath?: boolean;
  hopIndexDisplayMode?: HopIndexDisplayMode;
  isCalculating?: boolean;
  calculationError?: string;
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
    controlPath: undefined,
    dataPath: undefined,
    showPathOnly: false,
    showControlPath: true,
    showDataPath: true,
    hopIndexDisplayMode: 'control',
    isCalculating: false,
    calculationError: undefined,
  };

  private tenantId?: string;
  private tenantVersion?: number;

  constructor(private utilitiesService: UtilitiesService) {}

  public setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  public setTenantVersion(tenantVersion: number): void {
    this.tenantVersion = tenantVersion;
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
    const showControlPath = this.pathTraceState.showControlPath;
    const showDataPath = this.pathTraceState.showDataPath;
    const hopIndexDisplayMode = this.pathTraceState.hopIndexDisplayMode;

    this.pathTraceState = {
      selectedNodes: [],
      pathExists: false,
      highlightedPath: undefined,
      pathTraceData: undefined,
      controlPath: undefined,
      dataPath: undefined,
      showPathOnly: false,
      showControlPath: showControlPath ?? true,
      showDataPath: showDataPath ?? true,
      hopIndexDisplayMode: hopIndexDisplayMode ?? 'control',
      isCalculating: false,
      calculationError: undefined,
    };
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public setExternalPathTraceData(pathTraceData: PathTraceData): void {
    this.pathTraceState.selectedNodes = [pathTraceData.source, pathTraceData.target];
    this.pathTraceState.pathExists = pathTraceData.isComplete;
    this.pathTraceState.pathLength = pathTraceData.path.length;
    this.pathTraceState.pathTraceData = pathTraceData;

    // Convert to highlightedPath format
    // Collect all edges from incomingEdges and outgoingEdges of all hops
    const allEdges = new Set<string>();
    pathTraceData.path.forEach(hop => {
      hop.incomingEdges.forEach(edge => allEdges.add(edge));
      hop.outgoingEdges.forEach(edge => allEdges.add(edge));
    });

    this.pathTraceState.highlightedPath = {
      nodes: pathTraceData.path.map(hop => hop.nodeId),
      edges: Array.from(allEdges),
    };

    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public togglePathOnlyView(): void {
    this.pathTraceState.showPathOnly = !this.pathTraceState.showPathOnly;
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public toggleControlPath(): void {
    this.pathTraceState.showControlPath = !this.pathTraceState.showControlPath;
    this.updateCombinedHighlightedPath();
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public toggleDataPath(): void {
    this.pathTraceState.showDataPath = !this.pathTraceState.showDataPath;
    this.updateCombinedHighlightedPath();
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public toggleHopIndex(): void {
    // Cycle through: control -> data -> none -> control
    const currentMode = this.pathTraceState.hopIndexDisplayMode ?? 'control';
    if (currentMode === 'control') {
      this.pathTraceState.hopIndexDisplayMode = 'data';
    } else if (currentMode === 'data') {
      this.pathTraceState.hopIndexDisplayMode = 'none';
    } else {
      this.pathTraceState.hopIndexDisplayMode = 'control';
    }
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  public getPathTraceState(): PathTraceState {
    return { ...this.pathTraceState };
  }

  private updatePathTraceState(): void {
    if (this.pathTraceState.selectedNodes.length === 1) {
      // Single node selected - just highlight it
      this.pathTraceState.pathExists = false;
      this.pathTraceState.calculationError = undefined;
      this.pathTraceState.highlightedPath = {
        nodes: [this.pathTraceState.selectedNodes[0].id],
        edges: [],
      };
      this.pathTraceStateChange.emit(this.pathTraceState);
    } else if (this.pathTraceState.selectedNodes.length === 2) {
      // Two nodes selected - calculate path via API
      this.calculatePathViaAPI(this.pathTraceState.selectedNodes[0], this.pathTraceState.selectedNodes[1]);
    } else {
      this.pathTraceState.pathExists = false;
      this.pathTraceState.highlightedPath = undefined;
      this.pathTraceState.calculationError = undefined;
      this.pathTraceStateChange.emit(this.pathTraceState);
    }
  }

  private calculatePathViaAPI(source: PathTraceNode, target: PathTraceNode): void {
    if (!this.tenantId) {
      this.handleCalculationError('Tenant ID not configured for path calculation');
      return;
    }

    // Set calculating state
    this.pathTraceState.isCalculating = true;
    this.pathTraceState.calculationError = undefined;
    this.pathTraceState.pathExists = false;
    this.pathTraceState.highlightedPath = {
      nodes: [source.id, target.id],
      edges: [],
    };
    this.pathTraceStateChange.emit(this.pathTraceState);

    // Build API query
    const query: EndpointConnectivityNodeQuery = {
      sourceNodeId: source.id,
      destinationNodeId: target.id,
      tenantId: this.tenantId,
      tenantVersion: this.tenantVersion,
    };

    // Call API
    this.utilitiesService
      .checkNodeConnectivityUtilities({ endpointConnectivityNodeQuery: query })
      .pipe(
        catchError(err => {
          console.error('Path trace API error:', err);
          this.handleCalculationError(err.message || 'Failed to calculate path');
          return of(null);
        }),
      )
      .subscribe((result: PathResult | null) => {
        this.pathTraceState.isCalculating = false;

        // Check if query is outdated (tenant version changed)
        if (result && result.queryOutdated) {
          this.handleCalculationError('Graph is outdated and needs to be refreshed. Please reload the tenant graph.');
          return;
        }

        if (result && (result.controlPath || result.dataPath)) {
          // Store both paths
          this.pathTraceState.controlPath = result.controlPath;
          this.pathTraceState.dataPath = result.dataPath;
          this.pathTraceState.controlPlaneAllowed = result.controlPlaneAllowed;

          // Use control path as primary for backward compatibility
          const primaryPath = result.controlPath || result.dataPath;
          this.pathTraceState.pathExists = primaryPath.isComplete;
          this.pathTraceState.pathLength = primaryPath.hopCount;
          this.pathTraceState.pathTraceData = primaryPath.pathTraceData;

          // Combine both paths for highlighting
          this.updateCombinedHighlightedPath();

          this.pathTraceState.calculationError = undefined;
        } else if (result) {
          // API returned result but no path data
          this.pathTraceState.pathExists = false;
          this.pathTraceState.highlightedPath = {
            nodes: [source.id, target.id],
            edges: [],
          };
          this.pathTraceState.pathTraceData = undefined;
          this.pathTraceState.controlPath = undefined;
          this.pathTraceState.dataPath = undefined;
          this.pathTraceState.calculationError = 'No path found between selected nodes';
        }

        this.pathTraceStateChange.emit(this.pathTraceState);
      });
  }

  private handleCalculationError(message: string): void {
    this.pathTraceState.isCalculating = false;
    this.pathTraceState.calculationError = message;
    this.pathTraceState.pathExists = false;
    this.pathTraceState.pathTraceData = undefined;
    this.pathTraceState.controlPath = undefined;
    this.pathTraceState.dataPath = undefined;
    this.pathTraceStateChange.emit(this.pathTraceState);
  }

  private updateCombinedHighlightedPath(): void {
    const allNodes = new Set<string>();
    const allEdges = new Set<string>();

    // Add control path nodes/edges if visible
    if (this.pathTraceState.showControlPath && this.pathTraceState.controlPath) {
      this.pathTraceState.controlPath.nodes.forEach(node => allNodes.add(node));
      this.pathTraceState.controlPath.edges.forEach(edge => allEdges.add(edge));

      // Also collect all edges from pathTraceData to handle multiple parallel paths
      if (this.pathTraceState.controlPath.pathTraceData) {
        this.pathTraceState.controlPath.pathTraceData.path.forEach(hop => {
          hop.incomingEdges.forEach(edge => allEdges.add(edge));
          hop.outgoingEdges.forEach(edge => allEdges.add(edge));
        });
      }
    }

    // Add data path nodes/edges if visible
    if (this.pathTraceState.showDataPath && this.pathTraceState.dataPath) {
      this.pathTraceState.dataPath.nodes.forEach(node => allNodes.add(node));
      this.pathTraceState.dataPath.edges.forEach(edge => allEdges.add(edge));

      // Also collect all edges from pathTraceData to handle multiple parallel paths
      if (this.pathTraceState.dataPath.pathTraceData) {
        this.pathTraceState.dataPath.pathTraceData.path.forEach(hop => {
          hop.incomingEdges.forEach(edge => allEdges.add(edge));
          hop.outgoingEdges.forEach(edge => allEdges.add(edge));
        });
      }
    }

    this.pathTraceState.highlightedPath = {
      nodes: Array.from(allNodes),
      edges: Array.from(allEdges),
    };
  }
}
