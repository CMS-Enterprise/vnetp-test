import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { PathTraceState } from './tenant-graph-path-trace.service';

/**
 * # Tenant Graph Highlight Service
 *
 * ## Overview
 *
 * This service manages all visual highlighting and dynamic visual state changes for tenant graph visualization.
 * It handles PathTrace highlighting, multi-state node rendering, edge highlighting, and path-only view mode.
 * The service provides real-time visual feedback based on user interactions and PathTrace state changes.
 *
 * ## Main Highlighting Features
 *
 * ### 1. **PathTrace Visual Highlighting**
 * - **Selected Node Highlighting**: Orange highlighting for user-selected nodes
 * - **Path Node Highlighting**: Blue highlighting for nodes in the traced path
 * - **Incomplete Path Indicators**: Red highlighting for incomplete path endpoints
 * - **Edge Path Highlighting**: Orange highlighting for edges in the traced path
 * - **Hop Index Labels**: Numerical hop count displayed on nodes (toggleable: control/data/none)
 *
 * ### 2. **Multi-state Visual Management**
 * - **Normal State**: All nodes and edges at full opacity
 * - **Highlighted State**: Path elements highlighted, others faded
 * - **Path-only State**: Only path elements visible, others hidden
 * - **Smooth Transitions**: Animated state changes for better UX
 *
 * ### 3. **Dynamic Opacity Control**
 * - **Fade Non-highlighted Elements**: Reduces opacity of non-path elements
 * - **Hide Elements**: Completely hides non-path elements in path-only mode
 * - **Preserve Visibility**: Maintains visibility of important elements
 * - **Context-aware Highlighting**: Different highlighting based on element role
 *
 * ### 4. **Edge Highlighting**
 * - **Path Edge Emphasis**: Increased width and opacity for path edges
 * - **Color Preservation**: Maintains original colors for non-path edges
 * - **Special Edge Types**: Preserves special styling for inter-VRF connections
 * - **Dynamic Width Adjustment**: Adjusts edge width based on highlighting state
 * - **Hop Index Display**: Shows numerical hop count on nodes (control/data path selectable)
 *
 * ## Visual State Types
 *
 * ### Node States:
 * - **Selected**: Orange stroke (user-selected nodes)
 * - **Path**: Blue stroke (nodes in traced path)
 * - **Incomplete**: Red stroke (last hop of incomplete path)
 * - **Normal**: White stroke (default state)
 * - **Faded**: Reduced opacity (non-highlighted in trace mode)
 * - **Hidden**: Display none (non-path in path-only mode)
 *
 * ### Edge States:
 * - **Path**: Orange color with increased width
 * - **Normal**: Original color and width
 * - **Faded**: Reduced opacity
 * - **Hidden**: Display none (path-only mode)
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private highlightService: TenantGraphHighlightService) {}
 *
 * // Setup highlighting
 * setupHighlighting(nodeSelection: any, linkSelection: any, graphData: any) {
 *   this.highlightService.setSelections(nodeSelection, linkSelection, graphData);
 * }
 *
 * // Update highlighting based on PathTrace state
 * onPathTraceStateChange(state: PathTraceState) {
 *   this.highlightService.updateVisualHighlighting(state);
 * }
 *
 * // Reset to normal state
 * resetHighlighting() {
 *   this.highlightService.resetHighlighting();
 * }
 * ```
 *
 * ## Integration with PathTrace
 *
 * The service works closely with TenantGraphPathTraceService:
 * 1. PathTrace service calculates paths and updates state
 * 2. Highlight service receives state changes
 * 3. Visual highlighting is applied based on new state
 * 4. User sees immediate visual feedback
 *
 * ## Performance Considerations
 *
 * - **DOM Updates**: Efficient batch updates to minimize reflows
 * - **State Caching**: Avoids unnecessary highlighting updates
 * - **Memory Usage**: Maintains references to D3 selections for fast updates
 * - **Animation Performance**: Smooth transitions without blocking UI
 */

export interface EdgeStyle {
  color: string;
  width: number;
  dashArray?: string;
  opacity: number;
}

export interface TenantEdgeStyleMap {
  TENANT_CONTAINS_VRF: EdgeStyle;
  TENANT_CONTAINS_FIREWALL: EdgeStyle;
  VRF_TO_L3OUT: EdgeStyle;
  VRF_TO_SERVICE_GRAPH: EdgeStyle;
  L3OUT_TO_FIREWALL: EdgeStyle;
  INTERVRF_CONNECTION: EdgeStyle;
  [key: string]: EdgeStyle;
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphHighlightService {
  private readonly DEFAULT_EDGE_STYLES: TenantEdgeStyleMap = {
    TENANT_CONTAINS_VRF: { color: '#adb5bd', width: 2.5, dashArray: '5,5', opacity: 0.8 },
    TENANT_CONTAINS_FIREWALL: { color: '#adb5bd', width: 2.5, dashArray: '5,5', opacity: 0.8 },
    VRF_TO_L3OUT: { color: '#adb5bd', width: 2.5, opacity: 0.8 },
    VRF_TO_SERVICE_GRAPH: { color: '#adb5bd', width: 2.5, opacity: 0.8 },
    L3OUT_TO_FIREWALL: { color: '#adb5bd', width: 2.5, opacity: 0.8 },
    INTERVRF_CONNECTION: { color: '#ff6b35', width: 2.5, dashArray: '3,3', opacity: 0.8 },
  };

  private nodeSelection: any = null;
  private linkSelection: any = null;
  private currentGraphData: { nodes: any[]; links: any[] } = { nodes: [], links: [] };

  public setSelections(nodeSelection: any, linkSelection: any, graphData: { nodes: any[]; links: any[] }): void {
    this.nodeSelection = nodeSelection;
    this.linkSelection = linkSelection;
    this.currentGraphData = graphData;
  }

  public updateVisualHighlighting(pathTraceState: PathTraceState): void {
    if (!this.nodeSelection || !this.linkSelection) {
      return;
    }

    const highlightedPath = pathTraceState.highlightedPath;

    if (!highlightedPath) {
      // No highlighting - reset all to normal
      this.resetHighlighting();
      return;
    }

    const highlightedNodeIds = new Set(highlightedPath.nodes);
    const highlightedEdgeIds = new Set(highlightedPath.edges);

    // Create sets for control and data plane edges
    // Include both the flat edges array AND edges from pathTraceData hops
    const controlPathEdges = new Set(pathTraceState.controlPath?.edges || []);
    if (pathTraceState.controlPath?.pathTraceData) {
      pathTraceState.controlPath.pathTraceData.path.forEach(hop => {
        hop.incomingEdges.forEach(edge => controlPathEdges.add(edge));
        hop.outgoingEdges.forEach(edge => controlPathEdges.add(edge));
      });
    }

    const dataPathEdges = new Set(pathTraceState.dataPath?.edges || []);
    if (pathTraceState.dataPath?.pathTraceData) {
      pathTraceState.dataPath.pathTraceData.path.forEach(hop => {
        hop.incomingEdges.forEach(edge => dataPathEdges.add(edge));
        hop.outgoingEdges.forEach(edge => dataPathEdges.add(edge));
      });
    }

    // Build control plane metadata map from pathTraceData
    const controlPlaneMetadataMap = new Map<string, { allowed: boolean; allowedReason: string }>();
    if (pathTraceState.controlPath?.pathTraceData) {
      pathTraceState.controlPath.pathTraceData.path.forEach(hop => {
        if (hop.controlPlaneMetadata) {
          controlPlaneMetadataMap.set(hop.nodeId, {
            allowed: hop.controlPlaneMetadata.allowed,
            allowedReason: hop.controlPlaneMetadata.allowedReason,
          });
        }
      });
    }

    // Update node highlighting (circles)
    this.nodeSelection
      .selectAll('circle')
      .attr('stroke', (d: any) => {
        if (highlightedNodeIds.has(d.id)) {
          // Check if this is the last hop of an incomplete path
          if (pathTraceState.pathTraceData && !pathTraceState.pathTraceData.isComplete) {
            return '#dc3545'; // Red for incomplete path last hop
          }
          // Highlight selected/path nodes
          if (pathTraceState.selectedNodes.some(n => n.id === d.id)) {
            return '#ff6b35'; // Orange for selected nodes
          }
          return '#007bff'; // Blue for path nodes
        }
        return '#fff'; // Default white stroke
      })
      .attr('stroke-width', (d: any) => (highlightedNodeIds.has(d.id) ? 3 : 1.5))
      .attr('opacity', (d: any) => {
        if (pathTraceState.showPathOnly) {
          return highlightedNodeIds.has(d.id) ? 1 : 0; // Hide non-path nodes completely in path-only mode
        }
        return highlightedNodeIds.has(d.id) ? 1 : 0.3; // Fade non-highlighted nodes
      })
      .style('display', (d: any) => {
        if (pathTraceState.showPathOnly) {
          return highlightedNodeIds.has(d.id) ? 'block' : 'none'; // Hide non-path nodes in path-only mode
        }
        return 'block';
      });

    // Update node labels (text elements)
    this.nodeSelection
      .selectAll('text')
      .attr('opacity', (d: any) => {
        if (pathTraceState.showPathOnly) {
          return highlightedNodeIds.has(d.id) ? 1 : 0; // Hide non-path node labels completely in path-only mode
        }
        return highlightedNodeIds.has(d.id) ? 1 : 0.3; // Fade non-highlighted node labels
      })
      .style('display', (d: any) => {
        if (pathTraceState.showPathOnly) {
          return highlightedNodeIds.has(d.id) ? 'block' : 'none'; // Hide non-path node labels in path-only mode
        }
        return 'block';
      });

    // Render control plane metadata indicators
    this.renderControlPlaneIndicators(controlPlaneMetadataMap, pathTraceState.showPathOnly);

    // Render hop index labels on edges
    this.renderHopIndexLabels(pathTraceState);

    // Update edge highlighting
    this.linkSelection
      .attr('stroke', (d: any) => {
        const edgeId = d.originalEdge?.id || `${d.source.id || d.source}-${d.target.id || d.target}`;
        if (highlightedEdgeIds.has(edgeId)) {
          // Determine edge color based on which path it belongs to
          const isInControlPath = controlPathEdges.has(edgeId);
          const isInDataPath = dataPathEdges.has(edgeId);

          // If showing both paths, prefer control plane color
          if (isInControlPath && (pathTraceState.showControlPath ?? true)) {
            // Control plane: green for allowed, red for denied
            if (pathTraceState.controlPlaneAllowed === true) {
              return '#28a745'; // Green for allowed
            } else if (pathTraceState.controlPlaneAllowed === false) {
              return '#dc3545'; // Red for denied
            }
            return '#007bff'; // Blue if status unknown
          } else if (isInDataPath && (pathTraceState.showDataPath ?? true)) {
            return '#ff6b35'; // Orange for data plane
          }
          return '#ff6b35'; // Default orange for backward compatibility
        }
        // Keep original color for non-path edges
        if (d.type === 'INTERVRF_CONNECTION') {
          return '#ff6b35';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '#ff6b35';
        }
        const style = this.DEFAULT_EDGE_STYLES[d.type] || this.DEFAULT_EDGE_STYLES.VRF_TO_L3OUT;
        return style.color;
      })
      .attr('stroke-width', (d: any) => {
        const edgeId = d.originalEdge?.id || `${d.source.id || d.source}-${d.target.id || d.target}`;
        const style = this.DEFAULT_EDGE_STYLES[d.type] || this.DEFAULT_EDGE_STYLES.VRF_TO_L3OUT;
        const baseWidth = style.width * (this.currentGraphData.links.length > 0 ? 1.2 : 1); // Use configured width
        return highlightedEdgeIds.has(edgeId) ? baseWidth + 2 : baseWidth;
      })
      .attr('stroke-dasharray', (d: any) => {
        const edgeId = d.originalEdge?.id || `${d.source.id || d.source}-${d.target.id || d.target}`;
        if (highlightedEdgeIds.has(edgeId)) {
          const isInControlPath = controlPathEdges.has(edgeId);
          const isInDataPath = dataPathEdges.has(edgeId);
          const showControl = pathTraceState.showControlPath ?? true;
          const showData = pathTraceState.showDataPath ?? true;

          // Control plane: solid line, Data plane: dashed line
          // When both visible and edge is in both, prefer control plane (solid)
          if (isInControlPath && showControl) {
            return null; // Solid line for control plane
          } else if (isInDataPath && showData) {
            return '5,5'; // Dashed line for data plane
          }
          return null; // Default solid
        }
        // Keep original dash array for non-path edges
        const style = this.DEFAULT_EDGE_STYLES[d.type] || this.DEFAULT_EDGE_STYLES.VRF_TO_L3OUT;
        return style.dashArray || null;
      })
      .attr('stroke-opacity', (d: any) => {
        const edgeId = d.originalEdge?.id || `${d.source.id || d.source}-${d.target.id || d.target}`;
        if (pathTraceState.showPathOnly) {
          return highlightedEdgeIds.has(edgeId) ? 1 : 0; // Hide non-path edges completely in path-only mode
        }
        return highlightedEdgeIds.has(edgeId) ? 1 : 0.2; // Fade non-highlighted edges
      })
      .style('display', (d: any) => {
        if (pathTraceState.showPathOnly) {
          const edgeId = d.originalEdge?.id || `${d.source.id || d.source}-${d.target.id || d.target}`;
          return highlightedEdgeIds.has(edgeId) ? 'block' : 'none'; // Hide non-path edges in path-only mode
        }
        return 'block';
      });
  }

  /**
   * Render hop index labels on nodes
   */
  private renderHopIndexLabels(pathTraceState: PathTraceState): void {
    if (!this.nodeSelection) {
      return;
    }

    // Remove any existing hop index labels
    this.nodeSelection.selectAll('.hop-index-label').remove();

    // Check display mode
    const displayMode = pathTraceState.hopIndexDisplayMode ?? 'control';
    if (displayMode === 'none' || !pathTraceState.pathExists) {
      return;
    }

    // Build a map of node IDs to hop indices based on display mode
    const nodeHopIndexMap = new Map<string, number>();
    let pathLabel = '';
    let badgeColor = '#007bff';

    if (displayMode === 'control' && pathTraceState.controlPath?.pathTraceData) {
      pathTraceState.controlPath.pathTraceData.path.forEach(hop => {
        nodeHopIndexMap.set(hop.nodeId, hop.hopIndex);
      });
      pathLabel = 'Control Path';
      badgeColor = '#28a745'; // Green for control path
    } else if (displayMode === 'data' && pathTraceState.dataPath?.pathTraceData) {
      pathTraceState.dataPath.pathTraceData.path.forEach(hop => {
        nodeHopIndexMap.set(hop.nodeId, hop.hopIndex);
      });
      pathLabel = 'Data Path';
      badgeColor = '#007bff'; // Blue for data path
    }

    if (nodeHopIndexMap.size === 0) {
      return;
    }

    // Render hop index labels on each node in the path
    this.nodeSelection.each((d: any, i: number, nodes: any[]) => {
      const hopIndex = nodeHopIndexMap.get(d.id);

      if (hopIndex !== undefined) {
        const nodeGroup = nodes[i];
        const selection = d3.select(nodeGroup);

        // Only show indicator if node is visible
        const isVisible = pathTraceState.showPathOnly ? nodeHopIndexMap.has(d.id) : true;
        if (!isVisible) {
          return;
        }

        // Create hop index label group positioned at bottom right of node
        const labelGroup = selection
          .append('g')
          .attr('class', 'hop-index-label')
          .attr('transform', 'translate(15, 15)');

        // Background circle for better visibility
        labelGroup.append('circle').attr('r', 12).attr('fill', badgeColor).attr('stroke', '#fff').attr('stroke-width', 2);

        // Hop index text (display 1-indexed)
        labelGroup
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 11)
          .attr('font-weight', 'bold')
          .attr('fill', '#fff')
          .attr('pointer-events', 'none')
          .text(hopIndex + 1);

        // Add title for tooltip
        labelGroup.append('title').text(`${pathLabel} Hop: ${hopIndex + 1}`);
      }
    });
  }

  /**
   * Render control plane metadata indicators on nodes
   */
  private renderControlPlaneIndicators(
    controlPlaneMetadataMap: Map<string, { allowed: boolean; allowedReason: string }>,
    showPathOnly: boolean = false,
  ): void {
    if (!this.nodeSelection) {
      return;
    }

    // Remove any existing indicators
    this.nodeSelection.selectAll('.control-plane-indicator').remove();

    // Add indicators for nodes with control plane metadata
    this.nodeSelection.each((d: any, i: number, nodes: any[]) => {
      const metadata = controlPlaneMetadataMap.get(d.id);
      if (!metadata) {
        return;
      }

      const nodeGroup = nodes[i];
      const selection = d3.select(nodeGroup);

      // Only show indicator if node is visible
      const isVisible = showPathOnly ? controlPlaneMetadataMap.has(d.id) : true;
      if (!isVisible) {
        return;
      }

      // Create indicator group
      const indicator = selection
        .append('g')
        .attr('class', 'control-plane-indicator')
        .attr('transform', 'translate(0, -25)'); // Position above the node

      // Background circle for better visibility
      indicator
        .append('circle')
        .attr('r', 10)
        .attr('fill', metadata.allowed ? '#28a745' : '#dc3545')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      // Icon (checkmark or X)
      indicator
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .text(metadata.allowed ? '✓' : '✗');

      // Add title for tooltip
      indicator.append('title').text(`Control Plane: ${metadata.allowed ? 'Allowed' : 'Denied'}\n${metadata.allowedReason}`);
    });
  }

  public resetHighlighting(): void {
    if (!this.nodeSelection || !this.linkSelection) {
      return;
    }

    // Reset nodes to normal appearance
    this.nodeSelection.selectAll('circle').attr('stroke', '#fff').attr('stroke-width', 1.5).attr('opacity', 1).style('display', 'block');

    // Reset node labels to normal appearance
    this.nodeSelection.selectAll('text').attr('opacity', 1).style('display', 'block');

    // Remove control plane indicators
    this.nodeSelection.selectAll('.control-plane-indicator').remove();

    // Remove hop index labels
    this.nodeSelection.selectAll('.hop-index-label').remove();

    // Reset edges to normal appearance
    this.linkSelection
      .attr('stroke', (d: any) => {
        if (d.type === 'INTERVRF_CONNECTION') {
          return '#ff6b35';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '#ff6b35';
        }
        const style = this.DEFAULT_EDGE_STYLES[d.type] || this.DEFAULT_EDGE_STYLES.VRF_TO_L3OUT;
        return style.color;
      })
      .attr('stroke-width', (d: any) => {
        const style = this.DEFAULT_EDGE_STYLES[d.type] || this.DEFAULT_EDGE_STYLES.VRF_TO_L3OUT;
        return style.width * 1.2; // Use configured width
      })
      .attr('stroke-opacity', (d: any) => {
        const style = this.DEFAULT_EDGE_STYLES[d.type] || this.DEFAULT_EDGE_STYLES.VRF_TO_L3OUT;
        return style.opacity;
      })
      .style('display', 'block');
  }
}
