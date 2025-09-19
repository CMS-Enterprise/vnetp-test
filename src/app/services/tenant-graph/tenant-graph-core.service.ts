import { Injectable, EventEmitter } from '@angular/core';
import { TenantConnectivityGraph, TenantConnectivityGraphNodes, TenantConnectivityGraphEdges } from 'client';
import * as d3 from 'd3';

/**
 * # Tenant Graph Core Service (Orchestrator)
 *
 * ## Overview
 *
 * This is the main orchestrator service that coordinates all tenant graph rendering functionality.
 * It provides the same API as the original monolithic service while using specialized services internally.
 * This service maintains backward compatibility while providing the benefits of a refactored architecture.
 *
 * ## Main Purpose
 *
 * The service takes a backend graph data structure (`TenantConnectivityGraph`) and orchestrates
 * multiple specialized services to create an interactive, layered visualization that shows:
 * - **Network hierarchy** (tenants → VRFs → L3Outs/Service Graphs → Firewalls, etc.)
 * - **Relationships and connections** between network components
 * - **Visual organization** with nodes positioned in logical layers
 * - **Advanced PathTrace functionality** with Dijkstra's algorithm for optimal path finding
 *
 * ## High-Level Rendering Process
 *
 * ### 1. Data Transformation (TenantGraphDataService)
 * - Takes backend graph data (`nodes` and `edges`)
 * - Converts it to D3-compatible format
 * - Filters out unwanted edge types based on configuration
 * - Validates data integrity
 *
 * ### 2. Layout Calculation (TenantGraphLayoutService)
 * - **Hierarchical positioning**: Assigns nodes to vertical layers (levels 1-7) based on their type
 * - **Horizontal clustering**: Groups related nodes together horizontally
 * - **Relationship analysis**: Builds maps of parent-child and connection relationships
 * - **Position optimization**: Uses multiple algorithms to minimize edge crossings and improve readability
 *
 * ### 3. Visual Rendering (TenantGraphUIService + D3 Operations)
 * - **Lane guides**: Horizontal lines showing different network layers
 * - **Nodes**: Colored circles representing network components
 * - **Edges**: Curved lines showing relationships (solid, dashed, different colors)
 * - **Labels**: Text labels for each node
 * - **Legend**: Shows what colors and line styles mean
 * - **PathTrace Status Box**: Interactive UI for path tracing functionality
 *
 * ### 4. Interactive Features (TenantGraphInteractionService)
 * - **Zoom and pan**: Users can zoom in/out and pan around
 * - **Drag nodes**: Nodes can be dragged to different positions
 * - **Click handlers**: Nodes and edges can trigger custom actions
 * - **Force simulation**: D3 physics simulation keeps nodes properly spaced
 * - **Context menus**: Right-click menus with custom actions
 *
 * ### 5. PathTrace Features (TenantGraphPathTraceService)
 * - **Dijkstra's Algorithm**: Finds optimal paths between network nodes
 * - **Cost-based Routing**: Considers firewall routing costs
 * - **Interactive Selection**: Right-click to add nodes to path trace
 * - **Real-time Path Calculation**: Immediate path finding and highlighting
 *
 * ### 6. Visual Highlighting (TenantGraphHighlightService)
 * - **Dynamic Path Highlighting**: Visual feedback for traced paths
 * - **Multi-state Rendering**: Different colors for selected, path, and incomplete nodes
 * - **Path-only View**: Toggle to show only traced path elements
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the orchestrator service
 * constructor(private tenantGraphCore: TenantGraphCoreService) {}
 *
 * // Render a graph - same API as original service
 * renderTenantGraph(graphData: TenantConnectivityGraph) {
 *   const config: TenantGraphRenderConfig = {
 *     graph: graphData,
 *     containerSelector: '#graph-container',
 *     svgSelector: '#graph-svg',
 *     dimensions: { width: 1200, height: 800 },
 *     showLegend: true,
 *     enableOptimization: true,
 *     enablePathTrace: true,
 *     onNodeClick: (node) => this.handleNodeClick(node),
 *     nodeColors: {
 *       TENANT: '#007bff',
 *       VRF: '#28a745'
 *     }
 *   };
 *
 *   this.tenantGraphCore.renderGraph(config);
 * }
 *
 * // Subscribe to events - same as original service
 * ngOnInit() {
 *   this.tenantGraphCore.contextMenuClick.subscribe(event => {
 *     console.log('Context menu clicked:', event);
 *   });
 *
 *   this.tenantGraphCore.pathTraceStateChange.subscribe(state => {
 *     console.log('PathTrace state changed:', state);
 *   });
 * }
 * ```
 *
 * ## Benefits of Orchestrator Architecture
 *
 * - **Same API**: Drop-in replacement for original service
 * - **Specialized Services**: Each service handles one responsibility
 * - **Testability**: Individual algorithms can be unit tested
 * - **Maintainability**: Easy to modify specific functionality
 * - **Performance**: Can optimize individual services independently
 * - **Extensibility**: Easy to add new features to specific services
 */

// Import all the refactored services
import { TenantGraphDataService } from './tenant-graph-data.service';
import { TenantGraphLayoutService, LayoutConfig } from './tenant-graph-layout.service';
import { TenantGraphUIService, TenantNodeColorMap, ContextMenuItem } from './tenant-graph-ui.service';
import { TenantGraphInteractionService, TenantForceConfig, ContextMenuClickEvent } from './tenant-graph-interaction.service';
import { TenantGraphPathTraceService, PathTraceState, PathTraceNode } from './tenant-graph-path-trace.service';
import { TenantGraphHighlightService, TenantEdgeStyleMap } from './tenant-graph-highlight.service';

export interface TenantGraphRenderConfig {
  graph: TenantConnectivityGraph;
  containerSelector: string;
  svgSelector: string;
  dimensions?: { width?: number; height?: number };
  margins?: { top: number; bottom: number };
  showLaneGuides?: boolean;
  showLegend?: boolean;
  hideEdgeTypes?: string[];
  clusterConfig?: { widthPercent: number; startPercent: number };
  nodeColors?: Partial<TenantNodeColorMap>;
  edgeStyles?: Partial<TenantEdgeStyleMap>;
  levelLabels?: Record<number, string>;
  customNodeLevels?: Record<string, number>;
  nodeRadius?: number;
  fontSize?: number;
  enableZoom?: boolean;
  zoomExtent?: [number, number];
  enableDrag?: boolean;
  enableOptimization?: boolean;
  enableContextMenu?: boolean;
  contextMenuConfig?: Record<string, ContextMenuItem[]>;
  defaultEdgeWidth?: number;
  enablePathTrace?: boolean;
  onNodeClick?: (node: TenantConnectivityGraphNodes) => void;
  onEdgeClick?: (edge: TenantConnectivityGraphEdges) => void;
  forceConfig?: Partial<TenantForceConfig>;
  layoutMode?: 'hierarchical' | 'circular';
  circularConfig?: {
    centerLevel?: number;
    radiusMultiplier?: number;
    startAngle?: number;
    ringSpacing?: number;
    minRadius?: number;
  };
  showLayoutToggle?: boolean;
  enableLayoutTransitions?: boolean;
  onLayoutModeChange?: (mode: 'hierarchical' | 'circular') => void;
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphCoreService {
  // Public event emitters - same API as original service
  public contextMenuClick = new EventEmitter<ContextMenuClickEvent>();
  public pathTraceStateChange = new EventEmitter<PathTraceState>();

  // Default configurations
  private readonly DEFAULT_NODE_COLORS: TenantNodeColorMap = {
    TENANT: '#007bff',
    VRF: '#28a745',
    SERVICE_GRAPH: '#ffc107',
    SERVICE_GRAPH_FIREWALL: '#dc3545',
    L3OUT: '#6f42c1',
    EXTERNAL_FIREWALL: '#e83e8c',
    EXTERNAL_VRF_CONNECTION: '#17a2b8',
    EXTERNAL_VRF: '#6c757d',
    CONTRACT: '#fd7e14',
    SUBJECT: '#e83e8c',
    FILTER: '#20c997',
    FILTER_ENTRY: '#17a2b8',
    ENDPOINT_GROUP: '#6610f2',
    ENDPOINT_SECURITY_GROUP: '#d63384',
    BRIDGE_DOMAIN: '#0dcaf0',
    SUBNET: '#198754',
    APPLICATION_PROFILE: '#495057',
  };

  private readonly DEFAULT_EDGE_STYLES: TenantEdgeStyleMap = {
    TENANT_CONTAINS_VRF: { color: '#adb5bd', width: 2.5, dashArray: '5,5', opacity: 0.8 },
    TENANT_CONTAINS_FIREWALL: { color: '#adb5bd', width: 2.5, dashArray: '5,5', opacity: 0.8 },
    VRF_TO_L3OUT: { color: '#adb5bd', width: 2.5, opacity: 0.8 },
    VRF_TO_SERVICE_GRAPH: { color: '#adb5bd', width: 2.5, opacity: 0.8 },
    L3OUT_TO_FIREWALL: { color: '#adb5bd', width: 2.5, opacity: 0.8 },
    INTERVRF_CONNECTION: { color: '#ff6b35', width: 2.5, dashArray: '3,3', opacity: 0.8 },
  };

  private readonly DEFAULT_CONTEXT_MENU_CONFIG: Record<string, ContextMenuItem[]> = {
    TENANT: [{ type: 'item', name: 'View Details', identifier: 'tenant-details', enabled: true }],
    VRF: [{ type: 'item', name: 'View VRF Details', identifier: 'vrf-details', enabled: true }],
    EXTERNAL_FIREWALL: [{ type: 'item', name: 'Edit Firewall Config', identifier: 'edit-firewall', enabled: true }],
    SERVICE_GRAPH_FIREWALL: [{ type: 'item', name: 'Edit Firewall Config', identifier: 'edit-firewall', enabled: true }],
  };

  private readonly DEFAULT_LEVEL_LABELS = {
    1: 'Tenant',
    2: 'VRF',
    3: 'Service Graph / L3Out',
    4: 'SG Firewall / External Firewall',
    5: 'External VRF Connection',
    6: 'External VRF',
  };

  private readonly NODE_LEVELS = {
    TENANT: 1,
    VRF: 2,
    SERVICE_GRAPH: 3,
    L3OUT: 3,
    SERVICE_GRAPH_FIREWALL: 4,
    EXTERNAL_FIREWALL: 4,
    EXTERNAL_VRF_CONNECTION: 5,
    EXTERNAL_VRF: 6,
    APPLICATION_PROFILE: 2,
    ENDPOINT_GROUP: 3,
    ENDPOINT_SECURITY_GROUP: 3,
    BRIDGE_DOMAIN: 4,
    SUBNET: 5,
    CONTRACT: 4,
    SUBJECT: 5,
    FILTER: 6,
    FILTER_ENTRY: 7,
  };

  private readonly PATHTRACE_MENU_ITEM: ContextMenuItem = {
    type: 'item',
    name: 'Add to Path',
    identifier: 'pathtrace-add',
    enabled: true,
  };

  constructor(
    private dataService: TenantGraphDataService,
    private layoutService: TenantGraphLayoutService,
    private uiService: TenantGraphUIService,
    private interactionService: TenantGraphInteractionService,
    private pathTraceService: TenantGraphPathTraceService,
    private highlightService: TenantGraphHighlightService,
  ) {
    // Forward PathTrace events from the PathTrace service
    this.pathTraceService.pathTraceStateChange.subscribe(state => {
      this.pathTraceStateChange.emit(state);
    });

    // Forward context menu events from the Interaction service
    this.interactionService.contextMenuClick.subscribe(event => {
      this.contextMenuClick.emit(event);
    });
  }

  /**
   * Main entry point - same API as original service
   */
  public renderGraph(config: TenantGraphRenderConfig): void {
    if (!config.graph) {
      return;
    }

    const container = document.querySelector(config.containerSelector) as HTMLElement;
    if (!container) {
      return;
    }

    // Apply configuration defaults
    const mergedConfig = this.mergeConfigDefaults(config);
    const { nodeColors, edgeStyles, levelLabels, nodeLevels, forceConfig } = mergedConfig;

    // Get SVG and clear it
    const svg = d3.select(config.svgSelector);
    svg.selectAll('*').remove();

    // Calculate dimensions
    const width = config.dimensions?.width || container.clientWidth || 600;
    const height = config.dimensions?.height || container.clientHeight || 500;
    svg.attr('viewBox', [0, 0, width, height]);

    // Step 1: Transform data using DataService
    const transformedData = this.dataService.transformGraphData(config.graph, {
      hideEdgeTypes: mergedConfig.hideEdgeTypes,
      validateConnections: true,
      includeMetadata: true,
    });

    // Step 2: Calculate layout using LayoutService
    const layoutConfig: LayoutConfig = {
      width,
      height,
      margins: mergedConfig.margins,
      clusterConfig: mergedConfig.clusterConfig,
      levelLabels,
      nodeLevels,
      layoutMode: mergedConfig.layoutMode,
      circularConfig: mergedConfig.circularConfig,
    };

    const layoutResult = this.layoutService.calculateLayout(transformedData.nodes, transformedData.links, layoutConfig);

    // Apply cluster positions to nodes
    transformedData.nodes.forEach(node => {
      (node as any).clusterX = layoutResult.clusterCenters.get(node.id) || width / 2;

      // For circular layout, also apply Y coordinate and set initial positions
      if (mergedConfig.layoutMode === 'circular') {
        (node as any).clusterY = layoutResult.clusterCenters.get(`${node.id}_y`) || height / 2;

        // Set initial x,y positions for D3 force simulation
        (node as any).x = (node as any).clusterX;
        (node as any).y = (node as any).clusterY;
      }
    });

    // Step 3: Setup SVG structure
    const zoomGroup = svg.append('g');

    // Step 4: Setup zoom if enabled
    if (mergedConfig.enableZoom) {
      this.interactionService.setupZoom(svg, zoomGroup, mergedConfig.zoomExtent);
    }

    // Step 5: Render UI components using UIService
    if (mergedConfig.layoutMode === 'circular') {
      // For circular layout, render guide circles instead of lane guides
      if (layoutResult.ringRadii && layoutResult.ringRadii.length > 0) {
        this.uiService.renderGuideCircles(zoomGroup, width, height, layoutResult.ringRadii);
      }
    } else {
      // Only show lane guides for hierarchical layout
      if (mergedConfig.showLaneGuides) {
        this.uiService.renderLaneGuides(zoomGroup, width, height, mergedConfig.margins, levelLabels);
      }
    }

    // Step 6: Render links
    const linkSelection = this.renderLinks(zoomGroup, transformedData.links, edgeStyles, mergedConfig.defaultEdgeWidth);

    // Step 7: Render nodes
    const nodeSelection = this.renderNodes(zoomGroup, transformedData.nodes, nodeColors, mergedConfig);

    // Step 8: Setup interactions using InteractionService
    if (mergedConfig.enableDrag) {
      this.interactionService.setupDrag(nodeSelection, layoutResult.yForType, width);
    }

    // Step 9: Setup force simulation
    this.interactionService.setupForceSimulation(
      transformedData.nodes,
      transformedData.links,
      linkSelection,
      nodeSelection,
      layoutResult.yForType,
      width,
      height,
      layoutResult.clusterCenters,
      forceConfig,
      mergedConfig.layoutMode || 'hierarchical',
    );

    // Step 10: Setup PathTrace if enabled
    if (mergedConfig.enablePathTrace) {
      this.pathTraceService.setGraphData({
        nodes: transformedData.nodes,
        links: transformedData.links,
      });

      // Render PathTrace status box
      this.uiService.renderPathTraceStatus(
        svg,
        this.pathTraceService.getPathTraceState(),
        () => this.pathTraceService.togglePathOnlyView(),
        () => this.pathTraceService.clearPathTrace(),
      );
    }

    // Step 11: Setup highlighting service
    this.highlightService.setSelections(nodeSelection, linkSelection, {
      nodes: transformedData.nodes,
      links: transformedData.links,
    });

    // Step 12: Subscribe to PathTrace state changes for visual highlighting
    this.pathTraceService.pathTraceStateChange.subscribe(state => {
      this.highlightService.updateVisualHighlighting(state);

      // Update PathTrace status box
      if (mergedConfig.enablePathTrace) {
        this.uiService.renderPathTraceStatus(
          svg,
          state,
          () => this.pathTraceService.togglePathOnlyView(),
          () => this.pathTraceService.clearPathTrace(),
        );
      }
    });

    // Step 13: Render legend
    if (mergedConfig.showLegend) {
      this.uiService.renderLegend(svg, width, nodeColors, edgeStyles, transformedData.nodes, transformedData.links);
    }

    // Step 14: Render layout toggle buttons
    if (mergedConfig.showLayoutToggle) {
      this.uiService.renderLayoutToggle(
        svg,
        width,
        height,
        mergedConfig.layoutMode || 'hierarchical',
        (newMode: 'hierarchical' | 'circular') => this.switchLayoutMode(newMode, config),
      );
    }
  }

  /**
   * Public API methods - same as original service
   */
  public clearPathTrace(): void {
    this.pathTraceService.clearPathTrace();
  }

  public getPathTraceState(): PathTraceState {
    return this.pathTraceService.getPathTraceState();
  }

  public setExternalPathTraceData(pathTraceData: any): void {
    this.pathTraceService.setExternalPathTraceData(pathTraceData);
  }

  public togglePathOnlyView(): void {
    this.pathTraceService.togglePathOnlyView();
  }

  /**
   * Switch between layout modes with smooth transitions
   */
  public switchLayoutMode(newMode: 'hierarchical' | 'circular', originalConfig: TenantGraphRenderConfig): void {
    // Update the config with new layout mode
    const updatedConfig = {
      ...originalConfig,
      layoutMode: newMode,
    };

    // Notify external handler if provided
    if (originalConfig.onLayoutModeChange) {
      originalConfig.onLayoutModeChange(newMode);
    }

    // Re-render the graph with new layout mode
    this.renderGraph(updatedConfig);
  }

  private mergeConfigDefaults(config: TenantGraphRenderConfig) {
    return {
      margins: { top: 40, bottom: 30, ...config.margins },
      clusterConfig: { widthPercent: 0.7, startPercent: 0.15, ...config.clusterConfig },
      nodeColors: { ...this.DEFAULT_NODE_COLORS, ...config.nodeColors },
      edgeStyles: { ...this.DEFAULT_EDGE_STYLES, ...config.edgeStyles },
      levelLabels: { ...this.DEFAULT_LEVEL_LABELS, ...config.levelLabels },
      nodeLevels: { ...this.NODE_LEVELS, ...config.customNodeLevels },
      forceConfig: { ...this.interactionService.getDefaultForceConfig(), ...config.forceConfig },
      hideEdgeTypes: config.hideEdgeTypes || ['TENANT_CONTAINS_FIREWALL'],
      nodeRadius: config.nodeRadius || 10,
      fontSize: config.fontSize || 11,
      enableZoom: config.enableZoom !== false,
      enableDrag: config.enableDrag !== false,
      zoomExtent: config.zoomExtent || ([0.25, 2] as [number, number]),
      showLaneGuides: config.showLaneGuides !== false,
      showLegend: config.showLegend !== false,
      enableContextMenu: config.enableContextMenu !== false,
      contextMenuConfig: { ...this.DEFAULT_CONTEXT_MENU_CONFIG, ...config.contextMenuConfig },
      defaultEdgeWidth: config.defaultEdgeWidth || 1,
      enablePathTrace: config.enablePathTrace !== false,
      layoutMode: config.layoutMode || 'hierarchical',
      circularConfig: config.circularConfig,
      showLayoutToggle: config.showLayoutToggle !== false,
      enableLayoutTransitions: config.enableLayoutTransitions !== false,
      enableOptimization: config.enableOptimization,
    };
  }

  private renderLinks(zoomGroup: any, links: any[], edgeStyles: TenantEdgeStyleMap, defaultEdgeWidth: number): any {
    const tooltip = this.uiService.createTooltip();

    const linkSelection = zoomGroup
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('stroke-width', (d: any) => (edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT).width * defaultEdgeWidth)
      .attr('stroke', (d: any) => {
        if (d.type === 'INTERVRF_CONNECTION') {
          return '#ff6b35';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '#ff6b35';
        }
        const style = edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT;
        return style.color;
      })
      .attr('stroke-opacity', (d: any) => (edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT).opacity)
      .attr('stroke-dasharray', (d: any) => {
        if (d.type === 'INTERVRF_CONNECTION') {
          return '3,3';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '3,3';
        }
        const style = edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT;
        return style.dashArray || 'none';
      })
      .style('cursor', 'pointer');

    // Setup edge interactions
    this.interactionService.setupEdgeHoverInteractions(
      linkSelection,
      tooltip,
      (edge: any) => this.uiService.formatEdgeTooltip(edge),
      edgeStyles,
      defaultEdgeWidth,
    );

    return linkSelection;
  }

  private renderNodes(zoomGroup: any, nodes: any[], nodeColors: TenantNodeColorMap, config: any): any {
    const node = zoomGroup.append('g').selectAll('g').data(nodes).enter().append('g');
    const tooltip = this.uiService.createTooltip();
    const contextMenu = this.uiService.createContextMenu();

    // Node circles
    node
      .append('circle')
      .attr('r', config.nodeRadius)
      .attr('fill', (d: any) => nodeColors[d.type as keyof TenantNodeColorMap] || '#6c757d')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Label halo
    node
      .append('text')
      .text((d: any) => d.name)
      .attr('x', 10)
      .attr('y', 3)
      .attr('font-size', config.fontSize)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('paint-order', 'stroke')
      .attr('fill', 'none');

    // Label text
    node
      .append('text')
      .text((d: any) => d.name)
      .attr('x', 10)
      .attr('y', 3)
      .attr('font-size', config.fontSize)
      .attr('fill', '#212529');

    // Setup node interactions
    this.interactionService.setupTooltipInteractions(
      node,
      tooltip,
      (nodeData: any) => this.uiService.formatNodeTooltip(nodeData),
      this.uiService.getHoverTooltipDelay(),
    );

    if (config.enableContextMenu) {
      this.interactionService.setupContextMenuInteractions(
        node,
        tooltip,
        contextMenu,
        (nodeType: string) => this.getContextMenuItems(nodeType, config),
        (identifier: string, nodeData: any) => this.handleContextMenuClick(identifier, nodeData),
      );

      this.interactionService.setupGlobalClickHandler(contextMenu);
    }

    if (config.onNodeClick) {
      this.interactionService.setupClickInteractions(node, (nodeData: any) => config.onNodeClick(nodeData.originalNode));
    }

    return node;
  }

  private getContextMenuItems(nodeType: string, config: any): ContextMenuItem[] {
    const userMenuItems = config.contextMenuConfig[nodeType] || [];
    const menuItems: ContextMenuItem[] = [];

    // Add PathTrace option if enabled
    if (config.enablePathTrace) {
      menuItems.push(this.PATHTRACE_MENU_ITEM);
      if (userMenuItems.length > 0) {
        menuItems.push({ type: 'divider' });
      }
    }

    // Add user-defined menu items
    if (userMenuItems.length > 0) {
      menuItems.push(...userMenuItems);
    }

    return menuItems;
  }

  private handleContextMenuClick(identifier: string, nodeData: any): void {
    if (identifier === 'pathtrace-add') {
      const pathTraceNode: PathTraceNode = {
        id: nodeData.id,
        name: nodeData.name,
        type: nodeData.type,
      };
      this.pathTraceService.handlePathTraceAdd(pathTraceNode);
    } else {
      // Emit context menu click event for user-defined actions
      this.contextMenuClick.emit({
        nodeType: nodeData.type,
        nodeId: nodeData.id,
        databaseId: nodeData.originalNode?.databaseId,
        menuItemIdentifier: identifier,
        node: nodeData.originalNode,
      });
    }
  }
}
