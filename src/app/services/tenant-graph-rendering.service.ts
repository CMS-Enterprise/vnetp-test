import { Injectable } from '@angular/core';
import { TenantConnectivityGraph, TenantConnectivityGraphNodes, TenantConnectivityGraphEdges } from 'client';
import * as d3 from 'd3';

// TODO: Make legend sizing dynamic
// TODO: Make graph level labels dynamic based on what levels various entities are pinned to.
// TODO: Add search function that filters nodes based on type and shows relations.
// TODO: Add context menu support with dynamic actions like "Edit Rule Group" which would navigate
// the user to rule group editor.

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

export interface TenantForceConfig {
  linkDistance: number;
  linkStrength: number;
  layerStrength: number;
  clusterStrength: number;
  centerStrength: number;
  chargeStrength: number;
  collisionRadius: number;
}

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
  nodeRadius?: number;
  fontSize?: number;
  enableZoom?: boolean;
  zoomExtent?: [number, number];
  enableDrag?: boolean;
  onNodeClick?: (node: TenantConnectivityGraphNodes) => void;
  onEdgeClick?: (edge: TenantConnectivityGraphEdges) => void;
  forceConfig?: Partial<TenantForceConfig>;
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphRenderingService {
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
    TENANT_CONTAINS_VRF: { color: '#adb5bd', width: 1.5, dashArray: '5,5', opacity: 0.8 },
    TENANT_CONTAINS_FIREWALL: { color: '#adb5bd', width: 1.5, dashArray: '5,5', opacity: 0.8 },
    VRF_TO_L3OUT: { color: '#adb5bd', width: 1.5, opacity: 0.8 },
    VRF_TO_SERVICE_GRAPH: { color: '#adb5bd', width: 1.5, opacity: 0.8 },
    L3OUT_TO_FIREWALL: { color: '#adb5bd', width: 1.5, opacity: 0.8 },
    INTERVRF_CONNECTION: { color: '#ff6b35', width: 1.5, dashArray: '3,3', opacity: 0.8 },
  };

  private readonly DEFAULT_FORCE_CONFIG: TenantForceConfig = {
    linkDistance: 80,
    linkStrength: 0.6,
    layerStrength: 2.5,
    clusterStrength: 0.3,
    centerStrength: 0.1,
    chargeStrength: -350,
    collisionRadius: 20,
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

  private readonly DEFAULT_LEVEL_LABELS = {
    1: 'Tenant',
    2: 'VRF',
    3: 'Service Graph / L3Out',
    4: 'SG Firewall / External Firewall',
    5: 'External VRF Connection',
    6: 'External VRF',
  };

  private readonly HIERARCHY_EDGE_TYPES = ['TENANT_CONTAINS_VRF', 'VRF_TO_L3OUT', 'VRF_TO_SERVICE_GRAPH'];

  renderGraph(config: TenantGraphRenderConfig): void {
    if (!config.graph) {
      return;
    }

    const container = document.querySelector(config.containerSelector) as HTMLElement;
    if (!container) {
      return;
    }

    const svg = d3.select(config.svgSelector);
    svg.selectAll('*').remove();

    // Apply defaults
    const margins = { top: 40, bottom: 30, ...config.margins };
    const clusterConfig = { widthPercent: 0.7, startPercent: 0.15, ...config.clusterConfig };
    const nodeColors = { ...this.DEFAULT_NODE_COLORS, ...config.nodeColors };
    const edgeStyles = { ...this.DEFAULT_EDGE_STYLES, ...config.edgeStyles };
    const levelLabels = { ...this.DEFAULT_LEVEL_LABELS, ...config.levelLabels };
    const forceConfig = { ...this.DEFAULT_FORCE_CONFIG, ...config.forceConfig };
    const hideEdgeTypes = config.hideEdgeTypes || ['TENANT_CONTAINS_FIREWALL'];
    const nodeRadius = config.nodeRadius || 8;
    const fontSize = config.fontSize || 11;
    const enableZoom = config.enableZoom !== false;
    const enableDrag = config.enableDrag !== false;
    const zoomExtent = config.zoomExtent || [0.25, 2];
    const showLaneGuides = config.showLaneGuides !== false;
    const showLegend = config.showLegend !== false;

    const width = config.dimensions?.width || container.clientWidth || 600;
    const height = config.dimensions?.height || container.clientHeight || 500;
    svg.attr('viewBox', [0, 0, width, height]);

    // Transform backend graph to D3 format
    const nodes = Object.values(config.graph.nodes).map(graphNode => ({
      id: graphNode.id,
      name: graphNode.name,
      type: graphNode.type,
      originalNode: graphNode,
    }));

    const links = Object.values(config.graph.edges)
      .filter(edge => {
        // Filter out specified edge types
        if (hideEdgeTypes.includes(edge.type || '')) {
          if (edge.type === 'TENANT_CONTAINS_FIREWALL' && edge.targetNodeId?.includes('external-firewall:')) {
            return false;
          }
        }
        return true;
      })
      .map(edge => ({
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: edge.type,
        metadata: edge.metadata,
        originalEdge: edge,
      }));

    // Calculate layout
    const { clusterCenters, yForType } = this.calculateLayout(nodes, links, width, height, margins, clusterConfig, levelLabels);

    // Create zoom group
    const zoomGroup = svg.append('g');
    if (enableZoom) {
      svg.call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent(zoomExtent)
          .on('zoom', event => {
            zoomGroup.attr('transform', event.transform);
          }),
      );
    }

    // Render lane guides
    if (showLaneGuides) {
      this.renderLaneGuides(zoomGroup, width, height, margins, levelLabels);
    }

    // Render links
    const linkSelection = this.renderLinks(zoomGroup, links, edgeStyles);

    // Render nodes
    const nodeSelection = this.renderNodes(
      zoomGroup,
      nodes,
      nodeColors,
      nodeRadius,
      fontSize,
      enableDrag,
      yForType,
      width,
      config.onNodeClick,
    );

    // Setup force simulation
    this.setupForceSimulation(nodes, links, linkSelection, nodeSelection, yForType, width, height, clusterCenters, forceConfig);

    // Render legend
    if (showLegend) {
      this.renderLegend(svg, width, nodeColors, edgeStyles);
    }
  }

  private calculateLayout(
    nodes: any[],
    links: any[],
    width: number,
    height: number,
    margins: { top: number; bottom: number },
    clusterConfig: { widthPercent: number; startPercent: number },
    levelLabels: Record<number, string>,
  ) {
    const maxLevel = Math.max(...Object.keys(levelLabels).map(k => parseInt(k, 10)));
    const laneCount = Math.max(maxLevel, 6);
    const innerH = Math.max(0, height - margins.top - margins.bottom);
    const laneH = innerH / laneCount;
    const yForLevel = (lvl: number) => margins.top + (lvl - 0.5) * laneH;
    const yForType = (type: string) => yForLevel(this.NODE_LEVELS[type as keyof typeof this.NODE_LEVELS] || 3);

    // Build parent-child relationships
    const parentMap = new Map<string, string>();
    const childrenMap = new Map<string, string[]>();

    links.forEach(edge => {
      if (this.HIERARCHY_EDGE_TYPES.includes(edge.type)) {
        parentMap.set(edge.target, edge.source);
        if (!childrenMap.has(edge.source)) {
          childrenMap.set(edge.source, []);
        }
        childrenMap.get(edge.source)?.push(edge.target);
      }
    });

    // Group nodes by level
    const nodesByLevel = new Map<number, any[]>();
    nodes.forEach(node => {
      const level = this.NODE_LEVELS[node.type as keyof typeof this.NODE_LEVELS] || 3;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)?.push(node);
    });

    // Calculate cluster centers
    const clusterCenters = new Map<string, number>();
    const clusterWidth = width * clusterConfig.widthPercent;
    const clusterStart = width * clusterConfig.startPercent;

    nodesByLevel.forEach((levelNodes, level) => {
      if (level === 1) {
        // Tenant: center
        levelNodes.forEach(node => clusterCenters.set(node.id, width / 2));
      } else {
        // Group by parent
        const groups = new Map<string, any[]>();
        levelNodes.forEach(node => {
          const parent = parentMap.get(node.id) || 'orphan';
          if (!groups.has(parent)) {
            groups.set(parent, []);
          }
          groups.get(parent)?.push(node);
        });

        const groupKeys = Array.from(groups.keys());
        if (groupKeys.length === 1) {
          // Single group: center it
          const groupNodes = groups.get(groupKeys[0]);
          if (groupNodes) {
            const parentX = clusterCenters.get(groupKeys[0]) || width / 2;
            groupNodes.forEach((node, nodeIdx) => {
              const offset = groupNodes.length > 1 ? (nodeIdx - (groupNodes.length - 1) / 2) * 40 : 0;
              clusterCenters.set(node.id, parentX + offset);
            });
          }
        } else {
          // Multiple groups: distribute evenly
          groupKeys.forEach((parentId, groupIdx) => {
            const groupNodes = groups.get(parentId);
            if (groupNodes) {
              const baseX = clusterStart + (groupIdx / Math.max(1, groupKeys.length - 1)) * clusterWidth;
              groupNodes.forEach((node, nodeIdx) => {
                const offset = groupNodes.length > 1 ? (nodeIdx - (groupNodes.length - 1) / 2) * 35 : 0;
                clusterCenters.set(node.id, baseX + offset);
              });
            }
          });
        }
      }
    });

    // Apply cluster positions to nodes
    nodes.forEach(node => {
      (node as any).clusterX = clusterCenters.get(node.id) || width / 2;
    });

    return { clusterCenters, yForType };
  }

  private renderLaneGuides(
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

  private renderLinks(zoomGroup: any, links: any[], edgeStyles: TenantEdgeStyleMap): any {
    return zoomGroup
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('stroke-width', (d: any) => {
        const style = edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT;
        return style.width;
      })
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
      .attr('stroke-opacity', (d: any) => {
        const style = edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT;
        return style.opacity;
      })
      .attr('stroke-dasharray', (d: any) => {
        if (d.type === 'INTERVRF_CONNECTION') {
          return '3,3';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '3,3';
        }
        const style = edgeStyles[d.type] || edgeStyles.VRF_TO_L3OUT;
        return style.dashArray || 'none';
      });
  }

  private renderNodes(
    zoomGroup: any,
    nodes: any[],
    nodeColors: TenantNodeColorMap,
    nodeRadius: number,
    fontSize: number,
    enableDrag: boolean,
    yForType: (type: string) => number,
    width: number,
    onNodeClick?: (node: TenantConnectivityGraphNodes) => void,
  ): any {
    const node = zoomGroup.append('g').selectAll('g').data(nodes).enter().append('g');

    if (enableDrag) {
      node.call(
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

    // Node circles
    node
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', (d: any) => nodeColors[d.type as keyof TenantNodeColorMap] || '#6c757d')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Click handler
    if (onNodeClick) {
      node.on('click', (event, d: any) => {
        onNodeClick(d.originalNode);
      });
    }

    // Label halo
    node
      .append('text')
      .text((d: any) => d.name)
      .attr('x', 10)
      .attr('y', 3)
      .attr('font-size', fontSize)
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
      .attr('font-size', fontSize)
      .attr('fill', '#212529');

    return node;
  }

  private setupForceSimulation(
    nodes: any[],
    links: any[],
    linkSelection: any,
    nodeSelection: any,
    yForType: (type: string) => number,
    width: number,
    height: number,
    clusterCenters: Map<string, number>,
    forceConfig: TenantForceConfig,
  ): void {
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance(forceConfig.linkDistance)
          .strength(forceConfig.linkStrength),
      )
      .force('layerY', d3.forceY((d: any) => yForType(d.type)).strength(forceConfig.layerStrength))
      .force('clusterX', d3.forceX((d: any) => d.clusterX).strength(forceConfig.clusterStrength))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(forceConfig.centerStrength))
      .force('charge', d3.forceManyBody().strength(forceConfig.chargeStrength))
      .force('collide', d3.forceCollide((d: any) => forceConfig.collisionRadius + Math.min(80, (d.name?.length || 6) * 2.5)).iterations(3));

    // Store simulation reference for drag handlers
    nodes.forEach((n: any) => (n.simulation = simulation));

    simulation.on('tick', () => {
      // Clamp to lanes
      nodes.forEach((n: any) => {
        n.y = yForType(n.type);
        n.x = Math.max(20, Math.min(width - 20, n.x));
      });

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

      nodeSelection.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private renderLegend(svg: any, width: number, nodeColors: TenantNodeColorMap, edgeStyles: TenantEdgeStyleMap): void {
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 160}, 20)`)
      .attr('pointer-events', 'none');

    legend
      .append('rect')
      .attr('width', 150)
      .attr('height', 200)
      .attr('fill', 'rgba(255,255,255,0.95)')
      .attr('stroke', '#dee2e6')
      .attr('rx', 4);

    legend
      .append('text')
      .attr('x', 75)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .attr('fill', '#212529')
      .text('Legend');

    const legendItems = [
      { type: 'TENANT', color: nodeColors.TENANT, label: 'Tenant' },
      { type: 'VRF', color: nodeColors.VRF, label: 'VRF' },
      { type: 'L3OUT', color: nodeColors.L3OUT, label: 'L3Out' },
      { type: 'EXTERNAL_FIREWALL', color: nodeColors.EXTERNAL_FIREWALL, label: 'External Firewall' },
      { type: 'SERVICE_GRAPH', color: nodeColors.SERVICE_GRAPH, label: 'Service Graph' },
      { type: 'SERVICE_GRAPH_FIREWALL', color: nodeColors.SERVICE_GRAPH_FIREWALL, label: 'Service Graph Firewall' },
    ];

    legendItems.forEach((item, i) => {
      const y = 30 + i * 18;
      legend.append('circle').attr('cx', 15).attr('cy', y).attr('r', 6).attr('fill', item.color);
      legend
        .append('text')
        .attr('x', 25)
        .attr('y', y + 3)
        .attr('font-size', 10)
        .attr('fill', '#212529')
        .text(item.label);
    });

    // Edge legend
    legend
      .append('text')
      .attr('x', 10)
      .attr('y', 30 + legendItems.length * 18 + 15)
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('fill', '#212529')
      .text('Edges:');

    const edgeLegendItems = [
      { label: 'Connection', style: edgeStyles.VRF_TO_L3OUT },
      { label: 'Contains', style: edgeStyles.TENANT_CONTAINS_VRF },
      { label: 'Inter-VRF', style: edgeStyles.INTERVRF_CONNECTION },
    ];

    edgeLegendItems.forEach((item, i) => {
      const y = 30 + legendItems.length * 18 + 25 + i * 15;
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
        .attr('font-size', 10)
        .attr('fill', '#212529')
        .text(item.label);
    });
  }
}
