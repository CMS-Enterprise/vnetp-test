import { Injectable, EventEmitter } from '@angular/core';
import * as d3 from 'd3';

/**
 * # Tenant Graph Interaction Service
 *
 * ## Overview
 *
 * This service handles all user interactions and D3 force simulation for tenant graph visualization.
 * It manages zoom/pan behavior, node dragging, click handling, force physics simulation,
 * and provides a clean interface for setting up interactive behaviors on graph elements.
 *
 * ## Main Interaction Features
 *
 * ### 1. **Zoom and Pan**
 * - **Mouse Wheel Zoom**: Zoom in/out with configurable scale limits
 * - **Pan Behavior**: Click and drag to pan around large graphs
 * - **Touch Support**: Works on touch devices with pinch-to-zoom
 * - **Smooth Transitions**: Animated zoom and pan with proper easing
 *
 * ### 2. **Node Dragging**
 * - **Constrained Dragging**: Nodes stay within their hierarchy layers
 * - **Physics Integration**: Dragging interacts with force simulation
 * - **Boundary Constraints**: Prevents nodes from being dragged outside graph area
 * - **Real-time Updates**: Immediate visual feedback during drag operations
 *
 * ### 3. **Force Simulation**
 * - **D3 Physics Engine**: Realistic node positioning with configurable forces
 * - **Multiple Force Types**: Link distance, charge, collision, layer constraints
 * - **Layer Constraints**: Nodes stay within their designated hierarchy levels
 * - **Cluster Positioning**: Nodes gravitate toward their calculated cluster positions
 * - **Collision Detection**: Prevents node overlap with dynamic collision radius
 *
 * ### 4. **Event Handling**
 * - **Click Events**: Node and edge click handling with custom callbacks
 * - **Hover Events**: Tooltip display with configurable delays
 * - **Context Menu Events**: Right-click menu activation and handling
 * - **Global Event Management**: Proper event cleanup and delegation
 *
 * ### 5. **Edge Interactions**
 * - **Hover Highlighting**: Visual feedback when hovering over edges
 * - **Click Handling**: Edge click events for detailed information
 * - **Tooltip Integration**: Rich tooltip content for edge information
 * - **Visual State Management**: Temporary highlighting during interactions
 *
 * ## Force Configuration
 *
 * The service provides configurable physics parameters:
 * ```typescript
 * interface TenantForceConfig {
 *   linkDistance: number;     // Distance between connected nodes
 *   linkStrength: number;     // Strength of link forces
 *   layerStrength: number;    // Strength keeping nodes in layers
 *   clusterStrength: number;  // Strength pulling nodes to cluster centers
 *   centerStrength: number;   // Strength pulling toward graph center
 *   chargeStrength: number;   // Repulsion force between nodes
 *   collisionRadius: number;  // Collision detection radius
 * }
 * ```
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private interactionService: TenantGraphInteractionService) {}
 *
 * // Setup interactions
 * setupGraphInteractions(svg: any, nodeSelection: any, linkSelection: any) {
 *   // Setup zoom and pan
 *   const zoomGroup = svg.append('g');
 *   this.interactionService.setupZoom(svg, zoomGroup, [0.25, 2]);
 *
 *   // Setup node dragging
 *   this.interactionService.setupDrag(nodeSelection, yForType, width);
 *
 *   // Setup tooltips
 *   this.interactionService.setupTooltipInteractions(
 *     nodeSelection,
 *     tooltip,
 *     (node) => this.formatTooltip(node),
 *     250 // hover delay
 *   );
 *
 *   // Setup force simulation
 *   this.interactionService.setupForceSimulation(
 *     nodes, links, linkSelection, nodeSelection,
 *     yForType, width, height, clusterCenters, forceConfig
 *   );
 * }
 * ```
 *
 * ## Event Flow
 *
 * ```
 * User Interaction → Event Handler → Service Method → Visual Update
 *       ↓               ↓              ↓              ↓
 *   Mouse/Touch → D3 Event Listener → Interaction → DOM Changes
 * ```
 *
 * ## Performance Considerations
 *
 * - **Force Simulation**: Can be CPU intensive for large graphs (100+ nodes)
 * - **Event Throttling**: Hover events use timeouts to prevent excessive updates
 * - **Memory Management**: Proper cleanup of event listeners and timeouts
 * - **Mobile Optimization**: Touch-friendly interactions for mobile devices
 */

export interface TenantForceConfig {
  linkDistance: number;
  linkStrength: number;
  layerStrength: number;
  clusterStrength: number;
  centerStrength: number;
  chargeStrength: number;
  collisionRadius: number;
}

export interface ContextMenuClickEvent {
  nodeType: string;
  nodeId: string;
  databaseId: string;
  menuItemIdentifier: string;
  node: any;
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphInteractionService {
  public contextMenuClick = new EventEmitter<ContextMenuClickEvent>();

  private readonly DEFAULT_FORCE_CONFIG: TenantForceConfig = {
    linkDistance: 80,
    linkStrength: 0.6,
    layerStrength: 2.5,
    clusterStrength: 0.3,
    centerStrength: 0.1,
    chargeStrength: -350,
    collisionRadius: 20,
  };

  /**
   * Setup zoom behavior on SVG
   */
  public setupZoom(svg: any, zoomGroup: any, zoomExtent: [number, number]): void {
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent(zoomExtent)
        .on('zoom', event => zoomGroup.attr('transform', event.transform)),
    );
  }

  /**
   * Setup drag behavior on nodes
   */
  public setupDrag(nodeSelection: any, yForType: (type: string) => number, width: number): void {
    nodeSelection.call(
      d3
        .drag<SVGGElement, any>()
        .on('start', (event, d: any) => {
          if (!event.active) {
            d.simulation?.alphaTarget(0.3).restart();
          }
          d.fx = Math.max(20, Math.min(width - 20, event.x));
          d.fy = yForType(d.type);
        })
        .on('drag', (event, d: any) => {
          d.fx = Math.max(20, Math.min(width - 20, event.x));
          d.fy = yForType(d.type);
        })
        .on('end', (event, d: any) => {
          if (!event.active) {
            d.simulation?.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
        }),
    );
  }

  /**
   * Setup force simulation for node positioning
   */
  public setupForceSimulation(
    nodes: any[],
    links: any[],
    linkSelection: any,
    nodeSelection: any,
    yForType: (type: string) => number,
    width: number,
    height: number,
    clusterCenters: Map<string, number>,
    forceConfig: Partial<TenantForceConfig> = {},
    layoutMode: 'hierarchical' | 'circular' = 'hierarchical',
  ): void {
    // Adjust force config for circular layout
    let config = { ...this.DEFAULT_FORCE_CONFIG, ...forceConfig };
    if (layoutMode === 'circular') {
      // Use strong forces to maintain circular layout positions
      config = {
        ...config,
        layerStrength: 1.5, // Strong Y positioning to maintain circular positions
        clusterStrength: 1.2, // Strong X positioning to maintain circular positions
        centerStrength: 0.01, // Minimal center pull
        chargeStrength: -150, // Moderate repulsion
        linkDistance: 80, // Normal link distance
        linkStrength: 0.4, // Moderate link forces
      };
    }

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance(config.linkDistance)
          .strength(config.linkStrength),
      )
      .force(
        'layerY',
        d3
          .forceY((d: any) => {
            // For circular layout, use individual node Y coordinate if available
            if (layoutMode === 'circular' && d.clusterY !== undefined) {
              return d.clusterY;
            }
            // For hierarchical layout, use type-based Y positioning
            return yForType(d.type);
          })
          .strength(config.layerStrength),
      )
      .force('clusterX', d3.forceX((d: any) => d.clusterX).strength(config.clusterStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(config.centerStrength))
      .force('charge', d3.forceManyBody().strength(config.chargeStrength))
      .force('collide', d3.forceCollide((d: any) => config.collisionRadius + Math.min(80, (d.name?.length || 6) * 2.5)).iterations(3));

    // Store simulation reference for drag handlers
    nodes.forEach((n: any) => (n.simulation = simulation));

    simulation.on('tick', () => {
      // For circular layout, don't clamp to lanes - let nodes use their circular positions
      if (layoutMode !== 'circular') {
        // Clamp to lanes only for hierarchical layout
        nodes.forEach((n: any) => {
          n.y = yForType(n.type);
          n.x = Math.max(20, Math.min(width - 20, n.x));
        });
      } else {
        // For circular layout, just clamp to canvas bounds
        nodes.forEach((n: any) => {
          n.x = Math.max(20, Math.min(width - 20, n.x));
          n.y = Math.max(20, Math.min(height - 20, n.y));
        });
      }

      // Update link positions with curved paths
      linkSelection.attr('d', (d: any) => {
        const x1 = d.source.x;
        const y1 = d.source.y;
        const x2 = d.target.x;
        const y2 = d.target.y;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;

        // Vary curve offset based on edge index to reduce overlap
        const edgeIndex = links.findIndex(l => l.source === d.source && l.target === d.target);
        const baseOffset = (Math.abs(dx) + Math.abs(dy)) * 0.08;
        const indexOffset = ((edgeIndex % 3) - 1) * 15; // -15, 0, +15 pattern
        const totalOffset = baseOffset * (x1 < x2 ? 1 : -1) * (y2 > y1 ? 1 : -1) + indexOffset;

        return `M ${x1},${y1} Q ${mx},${my + totalOffset} ${x2},${y2}`;
      });

      // Update node positions
      nodeSelection.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  /**
   * Setup tooltip interactions
   */
  public setupTooltipInteractions(selection: any, tooltip: any, formatTooltip: (data: any) => string, hoverDelay: number = 250): void {
    let hoverTimeout: any = null;

    selection
      .on('mouseover', (event: any, d: any) => {
        // Clear any existing timeout
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }

        // Set timeout for hover delay
        hoverTimeout = setTimeout(() => {
          const tooltipContent = formatTooltip(d);
          tooltip
            .html(tooltipContent)
            .style('visibility', 'visible')
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        }, hoverDelay);
      })
      .on('mouseout', () => {
        // Clear timeout and hide tooltip
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', (event: any) => {
        // Update tooltip position if visible
        if (tooltip.style('visibility') === 'visible') {
          tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px');
        }
      });
  }

  /**
   * Setup context menu interactions
   */
  public setupContextMenuInteractions(
    selection: any,
    tooltip: any,
    contextMenu: any,
    getMenuItems: (nodeType: string) => any[],
    onMenuItemClick: (identifier: string, node: any) => void,
  ): void {
    selection.on('contextmenu', (event: any, d: any) => {
      event.preventDefault();

      // Hide tooltip if visible
      tooltip.style('visibility', 'hidden');

      // Get menu items for this node type
      const menuItems = getMenuItems(d.type);
      if (!menuItems || menuItems.length === 0) {
        return;
      }

      // Show context menu
      this.showContextMenu(contextMenu, event.pageX, event.pageY, d, menuItems, onMenuItemClick);
    });
  }

  /**
   * Setup click interactions
   */
  public setupClickInteractions(selection: any, onClick?: (data: any) => void): void {
    if (onClick) {
      selection.on('click', (event: any, d: any) => {
        onClick(d);
      });
    }
  }

  /**
   * Setup global click handler to hide context menu
   */
  public setupGlobalClickHandler(contextMenu: any): void {
    d3.select('body').on('click.context-menu', () => {
      contextMenu.style('visibility', 'hidden');
    });
  }

  /**
   * Setup edge hover interactions with highlighting
   */
  public setupEdgeHoverInteractions(
    linkSelection: any,
    tooltip: any,
    formatTooltip: (data: any) => string,
    edgeStyles: any,
    defaultEdgeWidth: number = 1,
  ): void {
    let edgeHoverTimeout: any = null;

    linkSelection
      .on('mouseover', (event: any, d: any) => {
        // Clear any existing timeout
        if (edgeHoverTimeout) {
          clearTimeout(edgeHoverTimeout);
        }

        // Highlight edge on hover
        d3.select(event.target)
          .attr('stroke-width', (originalD: any) => {
            const style = edgeStyles[originalD.type] || edgeStyles.VRF_TO_L3OUT;
            return style.width * defaultEdgeWidth + 1;
          })
          .attr('stroke-opacity', 1);

        // Set timeout for tooltip
        edgeHoverTimeout = setTimeout(() => {
          const tooltipContent = formatTooltip(d);
          tooltip
            .html(tooltipContent)
            .style('visibility', 'visible')
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px');
        }, 500);
      })
      .on('mouseout', (event: any) => {
        // Clear timeout and hide tooltip
        if (edgeHoverTimeout) {
          clearTimeout(edgeHoverTimeout);
          edgeHoverTimeout = null;
        }
        tooltip.style('visibility', 'hidden');

        // Reset edge appearance
        d3.select(event.target)
          .attr('stroke-width', (originalD: any) => {
            const style = edgeStyles[originalD.type] || edgeStyles.VRF_TO_L3OUT;
            return style.width * defaultEdgeWidth;
          })
          .attr('stroke-opacity', (originalD: any) => {
            const style = edgeStyles[originalD.type] || edgeStyles.VRF_TO_L3OUT;
            return style.opacity;
          });
      })
      .on('mousemove', (event: any) => {
        // Update tooltip position if visible
        if (tooltip.style('visibility') === 'visible') {
          tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px');
        }
      });
  }

  private showContextMenu(
    contextMenu: any,
    x: number,
    y: number,
    node: any,
    menuItems: any[],
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

  public getDefaultForceConfig(): TenantForceConfig {
    return { ...this.DEFAULT_FORCE_CONFIG };
  }
}
