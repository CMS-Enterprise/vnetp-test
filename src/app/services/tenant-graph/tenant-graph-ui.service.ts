import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { PathTraceState } from './tenant-graph-path-trace.service';

/**
 * # Tenant Graph UI Service
 *
 * ## Overview
 *
 * This service handles all user interface components and overlays for tenant graph visualization.
 * It manages tooltips, context menus, legends, lane guides, and the PathTrace status box.
 * All UI elements are rendered using D3.js and provide rich interactive experiences.
 *
 * ## Main UI Components
 *
 * ### 1. **Tooltip System**
 * - **Node Tooltips**: Rich information display for network components
 * - **Edge Tooltips**: Connection details and metadata
 * - **Hover Delay**: Configurable delay before tooltip appears
 * - **Dynamic Positioning**: Tooltips follow mouse cursor
 * - **Rich Content**: Supports metadata, configuration details, and tenant information
 *
 * ### 2. **Context Menus**
 * - **Right-click Activation**: Context-sensitive menus for different node types
 * - **Dynamic Menu Items**: Configurable menu items per node type
 * - **PathTrace Integration**: Built-in "Add to Path" option
 * - **Custom Actions**: Support for user-defined menu actions
 * - **Visual Feedback**: Hover effects and proper styling
 *
 * ### 3. **Legend Generation**
 * - **Dynamic Content**: Shows only node/edge types present in current graph
 * - **Color Coding**: Visual representation of node colors and edge styles
 * - **Responsive Sizing**: Adapts to available screen space
 * - **Organized Display**: Logical ordering of node and edge types
 *
 * ### 4. **PathTrace Status Box**
 * - **Real-time Updates**: Shows current PathTrace state and selected nodes
 * - **Interactive Buttons**: Toggle path-only view and clear selection
 * - **Cost Information**: Displays routing costs and path statistics
 * - **Visual Feedback**: Color-coded status indicators
 *
 * ### 5. **Lane Guides**
 * - **Horizontal Guidelines**: Visual separation between network layers
 * - **Layer Labels**: Text labels for each network hierarchy level
 * - **Customizable**: Support for custom level labels and styling
 *
 * ## Tooltip Content Structure
 *
 * ### Node Tooltips Include:
 * - Node name and type
 * - Metadata (if available)
 * - Configuration details (ID, alias, description, timestamps)
 * - Tenant ID information
 *
 * ### Edge Tooltips Include:
 * - Connection type and direction
 * - Source and target node names
 * - Bidirectional indicators
 * - Edge properties and metadata
 * - Edge ID information
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private uiService: TenantGraphUIService) {}
 *
 * // Render UI components
 * renderUIElements(svg: any, zoomGroup: any, config: any) {
 *   // Render lane guides
 *   this.uiService.renderLaneGuides(zoomGroup, width, height, margins, levelLabels);
 *
 *   // Create tooltip for nodes and edges
 *   const tooltip = this.uiService.createTooltip();
 *
 *   // Create context menu
 *   const contextMenu = this.uiService.createContextMenu();
 *
 *   // Render legend
 *   this.uiService.renderLegend(svg, width, nodeColors, edgeStyles, nodes, links);
 *
 *   // Render PathTrace status (if enabled)
 *   if (enablePathTrace) {
 *     this.uiService.renderPathTraceStatus(
 *       svg,
 *       pathTraceState,
 *       () => this.togglePathOnly(),
 *       () => this.clearPath()
 *     );
 *   }
 * }
 * ```
 *
 * ## Styling and Theming
 *
 * All UI components follow consistent styling:
 * - **Color Scheme**: Bootstrap-inspired colors with proper contrast
 * - **Typography**: Arial/sans-serif fonts with appropriate sizing
 * - **Spacing**: Consistent padding and margins
 * - **Accessibility**: High contrast and readable text
 * - **Responsive**: Adapts to different screen sizes
 *
 * ## Performance Considerations
 *
 * - **DOM Management**: Reuses tooltip and context menu elements
 * - **Event Handling**: Efficient event delegation and cleanup
 * - **Memory Usage**: Minimal DOM element creation
 * - **Responsive Updates**: Only updates UI when state changes
 */

export interface TenantNodeColorMap {
  TENANT: string;
  VRF: string;
  SERVICE_GRAPH: string;
  SERVICE_GRAPH_FIREWALL: string;
  L3OUT: string;
  EXTERNAL_FIREWALL: string;
  EXTERNAL_VRF_CONNECTION: string;
  EXTERNAL_VRF: string;
  CONTRACT: string;
  SUBJECT: string;
  FILTER: string;
  FILTER_ENTRY: string;
  ENDPOINT_GROUP: string;
  ENDPOINT_SECURITY_GROUP: string;
  BRIDGE_DOMAIN: string;
  SUBNET: string;
  APPLICATION_PROFILE: string;
}

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

export interface ContextMenuItem {
  type: 'item' | 'divider';
  name?: string;
  identifier?: string;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphUIService {
  private readonly HOVER_TOOLTIP_DELAY = 250;

  /**
   * Render lane guides (horizontal lines showing network layers)
   */
  public renderLaneGuides(
    zoomGroup: any,
    width: number,
    height: number,
    margins: { top: number; bottom: number },
    levelLabels: Record<number, string>,
  ): void {
    const maxLevel = Math.max(...Object.keys(levelLabels).map(k => parseInt(k, 10)));
    const laneCount = Math.max(maxLevel, 6);
    const innerH = Math.max(0, height - margins.top - margins.bottom);
    const laneH = innerH / laneCount;
    const yForLevel = (lvl: number) => margins.top + (lvl - 0.5) * laneH;

    const guides = zoomGroup.append('g').attr('pointer-events', 'none');

    for (let i = 1; i <= laneCount; i++) {
      const y = yForLevel(i);
      guides
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#dee2e6')
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 0.8);

      // Level labels
      const labelText = levelLabels[i] || '';
      if (labelText) {
        guides
          .append('text')
          .attr('x', 10)
          .attr('y', y - 6)
          .attr('font-size', 10)
          .attr('fill', '#6c757d')
          .text(labelText);
      }
    }
  }

  /**
   * Create and manage tooltip element
   */
  public createTooltip(): any {
    let tooltip = d3.select('body').select('.graph-tooltip');
    if (tooltip.empty()) {
      tooltip = d3
        .select('body')
        .append('div')
        .attr('class', 'graph-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '12px')
        .style('border-radius', '6px')
        .style('font-size', '12px')
        .style('font-family', 'Arial, sans-serif')
        .style('max-width', '300px')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.3)')
        .style('z-index', '1000')
        .style('pointer-events', 'none')
        .style('line-height', '1.4');
    }
    return tooltip;
  }

  /**
   * Create and manage context menu element
   */
  public createContextMenu(): any {
    let contextMenu = d3.select('body').select('.graph-context-menu');
    if (contextMenu.empty()) {
      contextMenu = d3
        .select('body')
        .append('div')
        .attr('class', 'graph-context-menu')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'white')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.15)')
        .style('z-index', '1001')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '13px')
        .style('min-width', '120px');
    }
    return contextMenu;
  }

  /**
   * Show context menu at specified position
   */
  public showContextMenu(
    contextMenu: any,
    x: number,
    y: number,
    node: any,
    menuItems: ContextMenuItem[],
    onMenuItemClick: (identifier: string, node: any) => void,
  ): void {
    // Clear existing menu items
    contextMenu.selectAll('*').remove();

    menuItems.forEach((item, index) => {
      if (item.type === 'divider') {
        contextMenu.append('div').style('height', '1px').style('background', '#e0e0e0').style('margin', '4px 0');
      } else if (item.type === 'item' && item.name && item.identifier) {
        const menuItem = contextMenu
          .append('div')
          .style('padding', '8px 12px')
          .style('cursor', item.enabled !== false ? 'pointer' : 'not-allowed')
          .style('color', item.enabled !== false ? '#333' : '#999')
          .style('border-bottom', index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none')
          .text(item.name)
          .on('mouseover', function () {
            if (item.enabled !== false) {
              d3.select(this).style('background', '#f5f5f5');
            }
          })
          .on('mouseout', function () {
            d3.select(this).style('background', 'white');
          });

        if (item.enabled !== false) {
          menuItem.on('click', (event: any) => {
            event.stopPropagation();
            contextMenu.style('visibility', 'hidden');
            onMenuItemClick(item.identifier, node);
          });
        }
      }
    });

    // Position and show menu
    contextMenu
      .style('left', x + 'px')
      .style('top', y + 'px')
      .style('visibility', 'visible');
  }

  /**
   * Format node tooltip content
   */
  public formatNodeTooltip(node: any): string {
    const originalNode = node.originalNode;
    let html = `<div style="font-weight: bold; margin-bottom: 8px; color: #ffffff;">${node.name}</div>`;
    html += `<div style="margin-bottom: 6px;"><strong>Type:</strong> ${node.type}</div>`;

    // Add metadata if available
    if (originalNode?.metadata && Object.keys(originalNode.metadata).length > 0) {
      html += '<div style="margin-bottom: 6px;"><strong>Metadata:</strong></div>';
      html += '<div style="margin-left: 8px; font-size: 11px;">';

      Object.entries(originalNode.metadata).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
          if (displayValue.length > 50) {
            html += `<div style="margin-bottom: 2px;"><strong>${key}:</strong><br/><span style="font-family: monospace;
             font-size: 10px;">${displayValue.substring(0, 50)}...</span></div>`;
          } else {
            html += `<div style="margin-bottom: 2px;"><strong>${key}:</strong> ${displayValue}</div>`;
          }
        }
      });
      html += '</div>';
    }

    // Add key config properties if available
    if (originalNode?.config) {
      const keyConfigProps = ['id', 'alias', 'description', 'version', 'createdAt', 'updatedAt'];
      const configInfo = keyConfigProps
        .filter(prop => originalNode.config[prop] !== null && originalNode.config[prop] !== undefined && originalNode.config[prop] !== '')
        .map(prop => {
          let value = originalNode.config[prop];
          if (prop === 'createdAt' || prop === 'updatedAt') {
            value = new Date(value).toLocaleString();
          }
          return { key: prop, value: String(value) };
        });

      if (configInfo.length > 0) {
        html += '<div style="margin-top: 8px; margin-bottom: 6px;"><strong>Configuration:</strong></div>';
        html += '<div style="margin-left: 8px; font-size: 11px;">';
        configInfo.forEach(({ key, value }) => {
          const displayValue = value.length > 40 ? value.substring(0, 40) + '...' : value;
          html += `<div style="margin-bottom: 2px;"><strong>${key}:</strong> ${displayValue}</div>`;
        });
        html += '</div>';
      }
    }

    // Add tenant ID if available
    if (originalNode?.tenantId) {
      html += `<div style="margin-top: 8px; font-size: 11px; color: #cccccc;"><strong>Tenant ID:</strong>
       ${originalNode.tenantId.substring(0, 8)}...</div>`;
    }

    return html;
  }

  /**
   * Format edge tooltip content
   */
  public formatEdgeTooltip(edge: any): string {
    const originalEdge = edge.originalEdge;
    const sourceNode = typeof edge.source === 'object' ? edge.source : { id: edge.source };
    const targetNode = typeof edge.target === 'object' ? edge.target : { id: edge.target };

    let html = '<div style="font-weight: bold; margin-bottom: 8px; color: #ffffff;">Connection</div>';
    html += `<div style="margin-bottom: 6px;"><strong>Type:</strong> ${edge.type}</div>`;

    // Show source and target
    html += `<div style="margin-bottom: 6px;"><strong>From:</strong> ${this.getNodeDisplayName(sourceNode)}</div>`;
    html += `<div style="margin-bottom: 6px;"><strong>To:</strong> ${this.getNodeDisplayName(targetNode)}</div>`;

    // Show if bidirectional
    if (originalEdge?.bidirectional) {
      html += '<div style="margin-bottom: 6px;"><strong>Bidirectional:</strong> Yes</div>';
    }

    // Add properties if available
    if (originalEdge?.properties && Object.keys(originalEdge.properties).length > 0) {
      html += '<div style="margin-bottom: 6px;"><strong>Properties:</strong></div>';
      html += '<div style="margin-left: 8px; font-size: 11px;">';

      Object.entries(originalEdge.properties).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          html += `<div style="margin-bottom: 2px;"><strong>${key}:</strong> ${displayValue}</div>`;
        }
      });
      html += '</div>';
    }

    // Add edge ID if available
    if (originalEdge?.id) {
      html += `<div style="margin-top: 8px; font-size: 11px; color: #cccccc;">
      <strong>Edge ID:</strong> ${originalEdge.id.length > 20 ? originalEdge.id.substring(0, 20) + '...' : originalEdge.id}</div>`;
    }

    return html;
  }

  /**
   * Render PathTrace status box
   */
  public renderPathTraceStatus(svg: any, pathTraceState: PathTraceState, onTogglePathOnly: () => void, onClear: () => void): void {
    // Remove existing PathTrace status box
    svg.select('.pathtrace-status').remove();

    if (pathTraceState.selectedNodes.length === 0) {
      return; // No selection, don't show box
    }

    const pathTraceBox = svg.append('g').attr('class', 'pathtrace-status').attr('transform', 'translate(20, 20)');

    // Calculate box dimensions
    const boxWidth = 200;
    const headerHeight = 25;
    const lineHeight = 18;
    const padding = 12;
    const buttonHeight = 24;

    let contentLines = 1; // Title
    if (pathTraceState.selectedNodes.length >= 1) {
      contentLines++;
    }
    if (pathTraceState.selectedNodes.length >= 2) {
      contentLines += 2;
    } // Target + Status

    const boxHeight = headerHeight + contentLines * lineHeight + buttonHeight + padding * 2;

    // Background
    pathTraceBox
      .append('rect')
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .attr('fill', 'rgba(255,255,255,0.95)')
      .attr('stroke', '#007bff')
      .attr('stroke-width', 2)
      .attr('rx', 6);

    // Title
    pathTraceBox
      .append('text')
      .attr('x', boxWidth / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .attr('fill', '#007bff')
      .text('Path Trace');

    let currentY = headerHeight + padding;

    // Source node
    if (pathTraceState.selectedNodes.length >= 1) {
      pathTraceBox
        .append('text')
        .attr('x', padding)
        .attr('y', currentY)
        .attr('font-size', 12)
        .attr('fill', '#333')
        .text(`Source: ${pathTraceState.selectedNodes[0].name}`);
      currentY += lineHeight;
    }

    // Target node
    if (pathTraceState.selectedNodes.length >= 2) {
      pathTraceBox
        .append('text')
        .attr('x', padding)
        .attr('y', currentY)
        .attr('font-size', 12)
        .attr('fill', '#333')
        .text(`Target: ${pathTraceState.selectedNodes[1].name}`);
      currentY += lineHeight;

      // Status
      let statusText = pathTraceState.pathExists ? `Path found (${pathTraceState.pathLength} hops)` : 'No path available';

      // Add routing cost if available
      if (pathTraceState.pathTraceData?.totalCost !== undefined) {
        statusText += ` - Cost: ${pathTraceState.pathTraceData.totalCost}`;
      }

      // Add incomplete indicator
      if (pathTraceState.pathTraceData && !pathTraceState.pathTraceData.isComplete) {
        statusText = 'Incomplete path';
      }

      const statusColor = pathTraceState.pathExists ? '#28a745' : '#ffc107';

      pathTraceBox
        .append('text')
        .attr('x', padding)
        .attr('y', currentY)
        .attr('font-size', 11)
        .attr('fill', statusColor)
        .attr('font-weight', 'bold')
        .text(`Status: ${statusText}`);
    }

    // Buttons
    const buttonY = boxHeight - buttonHeight - padding / 2;
    const buttonHeight2 = 20;

    // Show Path Only button (only if path exists)
    if (pathTraceState.pathExists && pathTraceState.selectedNodes.length === 2) {
      const pathOnlyButton = pathTraceBox.append('g').attr('class', 'path-only-button').style('cursor', 'pointer');

      const pathOnlyButtonWidth = 80;
      const pathOnlyButtonX = padding;

      pathOnlyButton
        .append('rect')
        .attr('x', pathOnlyButtonX)
        .attr('y', buttonY)
        .attr('width', pathOnlyButtonWidth)
        .attr('height', buttonHeight2)
        .attr('fill', pathTraceState.showPathOnly ? '#28a745' : '#007bff')
        .attr('rx', 3)
        .on('mouseover', function () {
          const currentFill = d3.select(this).attr('fill');
          d3.select(this).attr('fill', currentFill === '#28a745' ? '#218838' : '#0056b3');
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', pathTraceState.showPathOnly ? '#28a745' : '#007bff');
        });

      pathOnlyButton
        .append('text')
        .attr('x', pathOnlyButtonX + pathOnlyButtonWidth / 2)
        .attr('y', buttonY + 14)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .text(pathTraceState.showPathOnly ? 'Show All' : 'Path Only')
        .style('pointer-events', 'none');

      pathOnlyButton.on('click', onTogglePathOnly);
    }

    // Clear button
    const clearButton = pathTraceBox.append('g').attr('class', 'clear-button').style('cursor', 'pointer');

    const buttonWidth = 50;
    const buttonX = boxWidth - buttonWidth - padding;

    clearButton
      .append('rect')
      .attr('x', buttonX)
      .attr('y', buttonY)
      .attr('width', buttonWidth)
      .attr('height', buttonHeight2)
      .attr('fill', '#dc3545')
      .attr('rx', 3)
      .on('mouseover', function () {
        d3.select(this).attr('fill', '#c82333');
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', '#dc3545');
      });

    clearButton
      .append('text')
      .attr('x', buttonX + buttonWidth / 2)
      .attr('y', buttonY + 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .text('Clear')
      .style('pointer-events', 'none');

    clearButton.on('click', onClear);
  }

  /**
   * Render legend showing node and edge types
   */
  public renderLegend(
    svg: any,
    width: number,
    nodeColors: TenantNodeColorMap,
    edgeStyles: TenantEdgeStyleMap,
    nodes: any[],
    links: any[],
  ): void {
    // Extract unique node types and edge types from actual data
    const presentNodeTypes = new Set(nodes.map(node => node.type));
    const presentEdgeTypes = new Set(links.map(link => link.type));

    // Define node type labels
    const nodeTypeLabels: Record<string, string> = {
      TENANT: 'Tenant',
      VRF: 'VRF',
      L3OUT: 'L3Out',
      EXTERNAL_FIREWALL: 'External Firewall',
      SERVICE_GRAPH: 'Service Graph',
      SERVICE_GRAPH_FIREWALL: 'Service Graph Firewall',
      EXTERNAL_VRF_CONNECTION: 'External VRF Connection',
      EXTERNAL_VRF: 'External VRF',
      APPLICATION_PROFILE: 'Application Profile',
      BRIDGE_DOMAIN: 'Bridge Domain',
      ENDPOINT_GROUP: 'Endpoint Group',
      ENDPOINT_SECURITY_GROUP: 'Endpoint Security Group',
      CONTRACT: 'Contract',
      SUBJECT: 'Subject',
      FILTER: 'Filter',
      FILTER_ENTRY: 'Filter Entry',
      SUBNET: 'Subnet',
      SELECTOR: 'Selector',
    };

    // Define edge type labels
    const edgeTypeLabels: Record<string, string> = {
      TENANT_CONTAINS_VRF: 'Contains VRF',
      VRF_TO_L3OUT: 'VRF to L3Out',
      VRF_TO_SERVICE_GRAPH: 'VRF to Service Graph',
      L3OUT_TO_FIREWALL: 'L3Out to Firewall',
      INTERVRF_CONNECTION: 'Inter-VRF Connection',
    };

    // Filter to only present node types
    const presentNodeItems = Array.from(presentNodeTypes).map(type => ({
      type,
      color: nodeColors[type as keyof TenantNodeColorMap] || '#6c757d',
      label: nodeTypeLabels[type] || type,
    }));

    // Filter to only present edge types
    const presentEdgeItems = Array.from(presentEdgeTypes)
      .map(type => ({
        type,
        label: edgeTypeLabels[type] || type,
        style: edgeStyles[type] || edgeStyles.VRF_TO_L3OUT,
      }))
      .slice(0, 6);

    // Calculate legend dimensions
    const headerHeight = 30;
    const nodeHeaderHeight = presentNodeItems.length > 0 ? 25 : 0;
    const nodeItemsHeight = presentNodeItems.length * 18;
    const edgeHeaderHeight = presentEdgeItems.length > 0 ? 25 : 0;
    const edgeItemsHeight = presentEdgeItems.length * 15;
    const bottomPadding = 15;
    const legendHeight = headerHeight + nodeHeaderHeight + nodeItemsHeight + edgeHeaderHeight + edgeItemsHeight + bottomPadding;

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 180}, 20)`)
      .attr('pointer-events', 'none');

    legend
      .append('rect')
      .attr('width', 170)
      .attr('height', legendHeight)
      .attr('fill', 'rgba(255,255,255,0.95)')
      .attr('stroke', '#dee2e6')
      .attr('rx', 4);

    legend
      .append('text')
      .attr('x', 85)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#212529')
      .text('Legend');

    // Render node legend items
    if (presentNodeItems.length > 0) {
      legend
        .append('text')
        .attr('x', 10)
        .attr('y', 35)
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .attr('fill', '#212529')
        .text('Node Types:');

      presentNodeItems.forEach((item, i) => {
        const y = 50 + i * 18;
        legend.append('circle').attr('cx', 15).attr('cy', y).attr('r', 6).attr('fill', item.color);
        legend
          .append('text')
          .attr('x', 25)
          .attr('y', y + 3)
          .attr('font-size', 10)
          .attr('fill', '#212529')
          .text(item.label);
      });
    }

    // Render edge legend items
    if (presentEdgeItems.length > 0) {
      const edgeStartY = 50 + nodeItemsHeight + (presentNodeItems.length > 0 ? 15 : 0);
      legend
        .append('text')
        .attr('x', 10)
        .attr('y', edgeStartY)
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .attr('fill', '#212529')
        .text('Edge Types:');

      presentEdgeItems.forEach((item, i) => {
        const y = edgeStartY + 15 + i * 15;
        legend
          .append('line')
          .attr('x1', 15)
          .attr('x2', 35)
          .attr('y1', y)
          .attr('y2', y)
          .attr('stroke', item.style.color)
          .attr('stroke-width', item.style.width)
          .attr('stroke-dasharray', item.style.dashArray || 'none');

        legend
          .append('text')
          .attr('x', 40)
          .attr('y', y + 3)
          .attr('font-size', 9)
          .attr('fill', '#212529')
          .text(item.label);
      });
    }
  }

  private getNodeDisplayName(node: any): string {
    if (node.name) {
      return node.name;
    }
    if (node.id) {
      // Extract name from ID patterns like "vrf:default_vrf" -> "default_vrf"
      const parts = node.id.split(':');
      return parts.length > 1 ? parts[parts.length - 1] : node.id;
    }
    return 'Unknown';
  }

  public getHoverTooltipDelay(): number {
    return this.HOVER_TOOLTIP_DELAY;
  }

  /**
   * Render layout toggle buttons for switching between hierarchical and circular layouts
   */
  public renderLayoutToggle(
    svg: any,
    width: number,
    height: number,
    currentLayoutMode: 'hierarchical' | 'circular',
    onLayoutModeChange: (mode: 'hierarchical' | 'circular') => void,
  ): void {
    // Remove existing layout toggle
    svg.select('.layout-toggle').remove();

    const toggleGroup = svg
      .append('g')
      .attr('class', 'layout-toggle')
      .attr('transform', `translate(${width - 120}, ${height - 50})`);

    // Button dimensions
    const buttonWidth = 50;
    const buttonHeight = 30;
    const buttonSpacing = 5;

    // Create hierarchical layout button
    this.createLayoutButton(
      toggleGroup,
      0,
      0,
      buttonWidth,
      buttonHeight,
      'hierarchical',
      currentLayoutMode === 'hierarchical',
      '≡', // Horizontal lines icon
      () => onLayoutModeChange('hierarchical'),
    );

    // Create circular layout button
    this.createLayoutButton(
      toggleGroup,
      buttonWidth + buttonSpacing,
      0,
      buttonWidth,
      buttonHeight,
      'circular',
      currentLayoutMode === 'circular',
      '○', // Circle icon
      () => onLayoutModeChange('circular'),
    );
  }

  private createLayoutButton(
    parent: any,
    x: number,
    y: number,
    width: number,
    height: number,
    mode: 'hierarchical' | 'circular',
    isActive: boolean,
    icon: string,
    onClick: () => void,
  ): void {
    const buttonGroup = parent
      .append('g')
      .attr('class', `layout-button layout-button-${mode}`)
      .attr('transform', `translate(${x}, ${y})`)
      .style('cursor', 'pointer');

    // Button background
    const bgColor = isActive ? '#007bff' : '#f8f9fa';
    const borderColor = isActive ? '#007bff' : '#dee2e6';
    const textColor = isActive ? 'white' : '#495057';

    buttonGroup
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', bgColor)
      .attr('stroke', borderColor)
      .attr('stroke-width', 1.5)
      .attr('rx', 4)
      .on('mouseover', function () {
        if (!isActive) {
          d3.select(this).attr('fill', '#e9ecef').attr('stroke', '#adb5bd');
        }
      })
      .on('mouseout', function () {
        if (!isActive) {
          d3.select(this).attr('fill', bgColor).attr('stroke', borderColor);
        }
      });

    // Button icon/text
    buttonGroup
      .append('text')
      .attr('x', width / 2)
      .attr('y', height / 2 + 1)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', mode === 'hierarchical' ? 16 : 14)
      .attr('font-weight', 'bold')
      .attr('fill', textColor)
      .text(icon)
      .style('pointer-events', 'none');

    // Click handler
    buttonGroup.on('click', onClick);
  }

  /**
   * Render guide circles for circular layout to show ring structure
   */
  public renderGuideCircles(zoomGroup: any, width: number, height: number, ringRadii: number[]): void {
    // Remove existing guide circles
    zoomGroup.select('.guide-circles').remove();

    const guideGroup = zoomGroup.append('g').attr('class', 'guide-circles');

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw concentric circles for each ring
    ringRadii.forEach((radius, index) => {
      guideGroup
        .append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', 'none')
        .attr('stroke', '#444')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.3)
        .attr('class', `guide-circle-${index}`)
        .style('pointer-events', 'none'); // Don't interfere with node interactions
    });

    // Add center dot
    guideGroup
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 2)
      .attr('fill', '#666')
      .attr('opacity', 0.5)
      .style('pointer-events', 'none'); // Don't interfere with node interactions
  }

  /**
   * Render filter mode selector dropdown
   */
  public renderFilterModeSelector(
    svg: any,
    width: number,
    height: number,
    availableFilterModes: any[],
    currentFilterMode: string,
    onFilterModeChange: (mode: string) => void,
  ): void {
    // Remove existing filter selector
    svg.select('.filter-mode-selector').remove();

    const selectorGroup = svg
      .append('g')
      .attr('class', 'filter-mode-selector')
      .attr('transform', `translate(20, ${height - 50})`);

    // Dropdown dimensions
    const dropdownWidth = 180;
    const dropdownHeight = 30;

    // Create dropdown container
    const dropdown = selectorGroup.append('g').attr('class', 'filter-dropdown').style('cursor', 'pointer');

    // Dropdown background
    dropdown
      .append('rect')
      .attr('width', dropdownWidth)
      .attr('height', dropdownHeight)
      .attr('fill', '#f8f9fa')
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    // Current mode text
    const currentMode = availableFilterModes.find(mode => mode.id === currentFilterMode);
    const displayText = currentMode ? currentMode.name : 'Select Mode';

    dropdown
      .append('text')
      .attr('x', 10)
      .attr('y', dropdownHeight / 2 + 1)
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#495057')
      .text(displayText)
      .style('pointer-events', 'none');

    // Dropdown arrow (points up since menu opens upward)
    dropdown
      .append('text')
      .attr('x', dropdownWidth - 15)
      .attr('y', dropdownHeight / 2 + 1)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#6c757d')
      .text('▲')
      .style('pointer-events', 'none');

    // Create dropdown menu (initially hidden) - position upward since we're at bottom
    const menuHeight = availableFilterModes.length * 25;
    const menu = selectorGroup
      .append('g')
      .attr('class', 'filter-dropdown-menu')
      .attr('transform', `translate(0, ${-menuHeight - 2})`) // Render upward
      .style('display', 'none');

    menu
      .append('rect')
      .attr('width', dropdownWidth)
      .attr('height', availableFilterModes.length * 25)
      .attr('fill', 'white')
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)');

    // Menu items
    availableFilterModes.forEach((mode, index) => {
      const menuItem = menu
        .append('g')
        .attr('class', 'filter-menu-item')
        .attr('transform', `translate(0, ${index * 25})`)
        .style('cursor', 'pointer');

      menuItem
        .append('rect')
        .attr('width', dropdownWidth)
        .attr('height', 25)
        .attr('fill', mode.id === currentFilterMode ? '#e3f2fd' : 'transparent')
        .on('mouseover', function () {
          if (mode.id !== currentFilterMode) {
            d3.select(this).attr('fill', '#f5f5f5');
          }
        })
        .on('mouseout', function () {
          if (mode.id !== currentFilterMode) {
            d3.select(this).attr('fill', 'transparent');
          }
        });

      menuItem
        .append('text')
        .attr('x', 10)
        .attr('y', 16)
        .attr('font-size', 11)
        .attr('fill', '#495057')
        .text(mode.name)
        .style('pointer-events', 'none');

      menuItem.on('click', (event: any) => {
        event.stopPropagation(); // Prevent zoom behavior
        menu.style('display', 'none');
        onFilterModeChange(mode.id);
      });
    });

    // Toggle dropdown on click
    let isOpen = false;
    dropdown.on('click', (event: any) => {
      event.stopPropagation(); // Prevent zoom behavior
      isOpen = !isOpen;
      menu.style('display', isOpen ? 'block' : 'none');
    });

    // Close dropdown when clicking elsewhere
    svg.on('click.filter-dropdown', () => {
      if (isOpen) {
        menu.style('display', 'none');
        isOpen = false;
      }
    });
  }
}
