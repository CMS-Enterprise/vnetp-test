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
    console.log('hideEdgeTypes', config.hideEdgeTypes);
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
        if (hideEdgeTypes.includes(edge.type)) {
          return false;
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

    console.log('links', links);

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

    // Build comprehensive relationship maps
    const relationshipData = this.buildRelationshipMaps(nodes, links);

    // Group nodes by level
    const nodesByLevel = new Map<number, any[]>();
    nodes.forEach(node => {
      const level = this.NODE_LEVELS[node.type as keyof typeof this.NODE_LEVELS] || 3;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)?.push(node);
    });

    // Calculate optimized positions level by level
    const clusterCenters = this.calculateHierarchicalPositions(nodesByLevel, relationshipData, width, clusterConfig);

    // Apply cross-layer optimization to minimize edge crossings
    this.optimizeCrossLayerConnections(nodesByLevel, clusterCenters, relationshipData, width);

    // Apply back-propagation optimization to adjust parent positions based on children
    this.applyBackPropagationOptimization(nodesByLevel, clusterCenters, relationshipData, width);

    // Apply enhanced lower-level optimization for bottom levels
    this.optimizeLowerLevels(nodesByLevel, clusterCenters, relationshipData, width);

    // Apply cluster positions to nodes
    nodes.forEach(node => {
      (node as any).clusterX = clusterCenters.get(node.id) || width / 2;
    });

    return { clusterCenters, yForType };
  }

  private buildRelationshipMaps(nodes: any[], links: any[]) {
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
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

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
      if (this.HIERARCHY_EDGE_TYPES.includes(edge.type)) {
        parentMap.set(targetId, sourceId);
        if (!childrenMap.has(sourceId)) {
          childrenMap.set(sourceId, []);
        }
        childrenMap.get(sourceId)?.push(targetId);
      }
    });

    return { parentMap, childrenMap, connectionsMap, nodeMap };
  }

  private calculateHierarchicalPositions(
    nodesByLevel: Map<number, any[]>,
    relationshipData: any,
    width: number,
    clusterConfig: { widthPercent: number; startPercent: number },
  ): Map<string, number> {
    const { parentMap, connectionsMap } = relationshipData;
    const clusterCenters = new Map<string, number>();
    const clusterWidth = width * clusterConfig.widthPercent;
    const clusterStart = width * clusterConfig.startPercent;

    // Process levels in order (top to bottom)
    const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);

    for (const level of levels) {
      const levelNodes = nodesByLevel.get(level) || [];

      if (level === 1) {
        // Top level (Tenant): center it
        levelNodes.forEach(node => {
          clusterCenters.set(node.id, width / 2);
        });
      } else {
        // Lower levels: position based on relationships
        this.positionNodesInLevel(levelNodes, clusterCenters, parentMap, connectionsMap, clusterStart, clusterWidth, width);
      }
    }

    return clusterCenters;
  }

  private positionNodesInLevel(
    levelNodes: any[],
    clusterCenters: Map<string, number>,
    parentMap: Map<string, string>,
    connectionsMap: Map<string, string[]>,
    clusterStart: number,
    clusterWidth: number,
    width: number,
  ): void {
    // Check if any nodes have displayOrder - if so, use displayOrder-based positioning
    const hasDisplayOrder = levelNodes.some(node => this.hasValidDisplayOrder(node));

    if (hasDisplayOrder) {
      this.positionNodesByDisplayOrder(levelNodes, clusterCenters, clusterStart, clusterWidth, width);
      return;
    }

    // Fall back to algorithmic positioning
    // Analyze shared connections for better positioning
    const sharedConnectionData = this.analyzeSharedConnections(levelNodes, connectionsMap, clusterCenters);

    // Group nodes by their primary parent/connection, considering shared targets
    const nodeGroups = this.groupNodesByRelationshipsWithSharedTargets(
      levelNodes,
      parentMap,
      connectionsMap,
      clusterCenters,
      sharedConnectionData,
    );

    // Calculate positions for each group
    const groupKeys = Array.from(nodeGroups.keys());
    const groupCount = groupKeys.length;

    if (groupCount === 1) {
      // Single group: optimize for shared connections
      const groupNodes = nodeGroups.get(groupKeys[0]) || [];
      const parentX = this.getGroupAnchorX(groupKeys[0], clusterCenters, width);
      this.distributeNodesWithSharedConnections(groupNodes, parentX, clusterCenters, sharedConnectionData);
    } else {
      // Multiple groups: distribute across available width with shared connection optimization
      groupKeys.forEach((groupKey, groupIndex) => {
        const groupNodes = nodeGroups.get(groupKey) || [];
        const groupX = this.calculateGroupPosition(groupIndex, groupCount, clusterStart, clusterWidth, groupKey, clusterCenters, width);
        this.distributeNodesWithSharedConnections(groupNodes, groupX, clusterCenters, sharedConnectionData);
      });
    }
  }

  private hasValidDisplayOrder(node: any): boolean {
    // Check if node has a valid displayOrder in its config or metadata
    const displayOrder = this.getDisplayOrder(node);
    return displayOrder !== null && displayOrder !== undefined && displayOrder !== 0;
  }

  private getDisplayOrder(node: any): number | null {
    // Try to get displayOrder from various possible locations
    if (node.originalNode?.config?.displayOrder !== undefined && node.originalNode.config.displayOrder !== null) {
      return node.originalNode.config.displayOrder;
    }
    if (node.originalNode?.metadata?.displayOrder !== undefined && node.originalNode.metadata.displayOrder !== null) {
      return node.originalNode.metadata.displayOrder;
    }
    if (node.config?.displayOrder !== undefined && node.config.displayOrder !== null) {
      return node.config.displayOrder;
    }
    if (node.metadata?.displayOrder !== undefined && node.metadata.displayOrder !== null) {
      return node.metadata.displayOrder;
    }
    return null;
  }

  private positionNodesByDisplayOrder(
    levelNodes: any[],
    clusterCenters: Map<string, number>,
    clusterStart: number,
    clusterWidth: number,
    width: number,
  ): void {
    // Separate nodes with and without displayOrder
    const nodesWithOrder = levelNodes.filter(node => this.hasValidDisplayOrder(node));
    const nodesWithoutOrder = levelNodes.filter(node => !this.hasValidDisplayOrder(node));

    // Sort nodes with displayOrder (lower displayOrder = leftmost position)
    const sortedOrderedNodes = nodesWithOrder.sort((a, b) => {
      const aOrder = this.getDisplayOrder(a) || 0;
      const bOrder = this.getDisplayOrder(b) || 0;
      return aOrder - bOrder;
    });

    // Sort nodes without displayOrder by name (these go after ordered nodes)
    const sortedUnorderedNodes = nodesWithoutOrder.sort((a, b) => a.name.localeCompare(b.name));

    // Combine: ordered nodes first (left), then unordered nodes (right)
    const finalNodeOrder = [...sortedOrderedNodes, ...sortedUnorderedNodes];

    // Position nodes across available width
    this.distributeNodesEvenly(finalNodeOrder, clusterCenters, clusterStart, clusterWidth, width);
  }

  private distributeNodesEvenly(
    orderedNodes: any[],
    clusterCenters: Map<string, number>,
    clusterStart: number,
    clusterWidth: number,
    width: number,
  ): void {
    const nodeCount = orderedNodes.length;

    if (nodeCount === 1) {
      // Single node: center it
      clusterCenters.set(orderedNodes[0].id, width / 2);
      return;
    }

    // Calculate spacing to fit within cluster width
    const availableWidth = clusterWidth;
    const spacing = nodeCount > 1 ? availableWidth / (nodeCount - 1) : 0;

    orderedNodes.forEach((node, index) => {
      const position = clusterStart + index * spacing;
      clusterCenters.set(node.id, position);
    });
  }

  private analyzeSharedConnections(
    levelNodes: any[],
    connectionsMap: Map<string, string[]>,
    clusterCenters: Map<string, number>,
  ): Map<string, any> {
    const sharedTargets = new Map<string, string[]>(); // target -> nodes that connect to it
    const nodeToTargets = new Map<string, string[]>(); // node -> targets it connects to

    // Build target connection maps
    levelNodes.forEach(node => {
      const connections = connectionsMap.get(node.id) || [];
      const downstreamTargets = connections.filter(connId => !clusterCenters.has(connId)); // Not yet positioned = downstream

      nodeToTargets.set(node.id, downstreamTargets);

      downstreamTargets.forEach(targetId => {
        if (!sharedTargets.has(targetId)) {
          sharedTargets.set(targetId, []);
        }
        sharedTargets.get(targetId)?.push(node.id);
      });
    });

    // Find shared connection groups
    const sharedGroups = new Map<string, string[]>();
    sharedTargets.forEach((sourceNodes, targetId) => {
      if (sourceNodes.length > 1) {
        // Multiple nodes connect to this target - create shared group
        const groupKey = `shared:${targetId}`;
        sharedGroups.set(groupKey, sourceNodes);
      }
    });

    return new Map([
      ['sharedTargets', sharedTargets],
      ['nodeToTargets', nodeToTargets],
      ['sharedGroups', sharedGroups],
    ]);
  }

  private groupNodesByRelationshipsWithSharedTargets(
    levelNodes: any[],
    parentMap: Map<string, string>,
    connectionsMap: Map<string, string[]>,
    clusterCenters: Map<string, number>,
    sharedConnectionData: Map<string, any>,
  ): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    const sharedGroups = sharedConnectionData.get('sharedGroups') as Map<string, string[]>;
    const processedNodes = new Set<string>();

    // First, handle nodes with shared connections
    sharedGroups.forEach((nodeIds, groupKey) => {
      const groupNodes = nodeIds.map(id => levelNodes.find(n => n.id === id)).filter(n => n);
      if (groupNodes.length > 0) {
        groups.set(groupKey, groupNodes);
        groupNodes.forEach(node => processedNodes.add(node.id));
      }
    });

    // Then handle remaining nodes using original logic
    levelNodes.forEach(node => {
      if (!processedNodes.has(node.id)) {
        const groupKey = this.findBestGroupKey(node, parentMap, connectionsMap, clusterCenters);

        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)?.push(node);
      }
    });

    return groups;
  }

  private distributeNodesWithSharedConnections(
    nodes: any[],
    centerX: number,
    clusterCenters: Map<string, number>,
    sharedConnectionData: Map<string, any>,
  ): void {
    const nodeCount = nodes.length;

    if (nodeCount <= 1) {
      // Single node or empty - use original logic
      this.distributeNodesAroundCenter(nodes, centerX, clusterCenters);
      return;
    }

    // Check if these nodes share connections
    const nodeToTargets = sharedConnectionData.get('nodeToTargets') as Map<string, string[]>;
    const hasSharedTargets = this.checkForSharedTargets(nodes, nodeToTargets);

    if (hasSharedTargets) {
      // Optimize spacing for shared connections
      this.optimizeSharedConnectionSpacing(nodes, centerX, clusterCenters, nodeToTargets);
    } else {
      // Use original distribution
      this.distributeNodesAroundCenter(nodes, centerX, clusterCenters);
    }
  }

  private checkForSharedTargets(nodes: any[], nodeToTargets: Map<string, string[]>): boolean {
    const allTargets = new Set<string>();
    let totalConnections = 0;

    nodes.forEach(node => {
      const targets = nodeToTargets.get(node.id) || [];
      targets.forEach(target => allTargets.add(target));
      totalConnections += targets.length;
    });

    // If total connections > unique targets, there are shared targets
    return totalConnections > allTargets.size;
  }

  private optimizeSharedConnectionSpacing(
    nodes: any[],
    centerX: number,
    clusterCenters: Map<string, number>,
    nodeToTargets: Map<string, string[]>,
  ): void {
    const nodeCount = nodes.length;

    // Calculate tighter spacing for shared connections
    const baseSpacing = Math.min(40, 300 / Math.max(1, nodeCount)); // Tighter spacing

    // Sort nodes by their connection similarity (nodes with similar targets should be closer)
    const sortedNodes = this.sortNodesByConnectionSimilarity(nodes, nodeToTargets);
    sortedNodes.forEach((node, index) => {
      if (nodeCount === 1) {
        clusterCenters.set(node.id, centerX);
      } else {
        const offset = (index - (nodeCount - 1) / 2) * baseSpacing;
        clusterCenters.set(node.id, centerX + offset);
      }
    });
  }

  private sortNodesByConnectionSimilarity(nodes: any[], nodeToTargets: Map<string, string[]>): any[] {
    // Sort nodes so that those with similar connections are adjacent
    return [...nodes].sort((a, b) => {
      const aTargets = new Set(nodeToTargets.get(a.id) || []);
      const bTargets = new Set(nodeToTargets.get(b.id) || []);

      // Calculate intersection size
      const intersection = new Set([...aTargets].filter(x => bTargets.has(x)));
      const union = new Set([...aTargets, ...bTargets]);

      // Jaccard similarity (intersection / union)
      const similarity = union.size > 0 ? intersection.size / union.size : 0;

      // Sort by similarity (descending) and then by name for consistency
      if (similarity !== 0) {
        return similarity > 0.5 ? -1 : 1; // Group similar nodes together
      }
      return a.name.localeCompare(b.name);
    });
  }

  private groupNodesByRelationships(
    levelNodes: any[],
    parentMap: Map<string, string>,
    connectionsMap: Map<string, string[]>,
    clusterCenters: Map<string, number>,
  ): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    levelNodes.forEach(node => {
      // Find the best grouping key for this node
      const groupKey = this.findBestGroupKey(node, parentMap, connectionsMap, clusterCenters);

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)?.push(node);
    });

    return groups;
  }

  private findBestGroupKey(
    node: any,
    parentMap: Map<string, string>,
    connectionsMap: Map<string, string[]>,
    clusterCenters: Map<string, number>,
  ): string {
    // Priority 1: Direct hierarchical parent
    const parent = parentMap.get(node.id);
    if (parent && clusterCenters.has(parent)) {
      return parent;
    }

    // Priority 2: Most connected node in upper levels
    const connections = connectionsMap.get(node.id) || [];
    const upperLevelConnections = connections.filter(connId => {
      const connNode = clusterCenters.has(connId);
      return connNode; // Already positioned nodes are in upper levels
    });

    if (upperLevelConnections.length > 0) {
      // Return the connection with the most overall connections (most central)
      return upperLevelConnections.reduce((best, current) => {
        const currentConnections = connectionsMap.get(current)?.length || 0;
        const bestConnections = connectionsMap.get(best)?.length || 0;
        return currentConnections > bestConnections ? current : best;
      });
    }

    // Priority 3: Orphan group
    return 'orphan';
  }

  private getGroupAnchorX(groupKey: string, clusterCenters: Map<string, number>, width: number): number {
    if (groupKey === 'orphan') {
      return width / 2;
    }
    return clusterCenters.get(groupKey) || width / 2;
  }

  private calculateGroupPosition(
    groupIndex: number,
    groupCount: number,
    clusterStart: number,
    clusterWidth: number,
    groupKey: string,
    clusterCenters: Map<string, number>,
    width: number,
  ): number {
    // If we have a positioned parent, try to stay close to it
    const parentX = this.getGroupAnchorX(groupKey, clusterCenters, width);

    if (groupCount <= 3) {
      // For small numbers of groups, distribute evenly but bias toward parent
      const evenSpacing = clusterStart + (groupIndex / Math.max(1, groupCount - 1)) * clusterWidth;
      const parentBias = 0.3; // 30% bias toward parent position
      return evenSpacing * (1 - parentBias) + parentX * parentBias;
    } else {
      // For many groups, use even distribution
      return clusterStart + (groupIndex / Math.max(1, groupCount - 1)) * clusterWidth;
    }
  }

  private distributeNodesAroundCenter(nodes: any[], centerX: number, clusterCenters: Map<string, number>): void {
    const nodeCount = nodes.length;
    const spacing = Math.min(60, 400 / Math.max(1, nodeCount)); // Adaptive spacing

    nodes.forEach((node, index) => {
      if (nodeCount === 1) {
        clusterCenters.set(node.id, centerX);
      } else {
        const offset = (index - (nodeCount - 1) / 2) * spacing;
        clusterCenters.set(node.id, centerX + offset);
      }
    });
  }

  private optimizeCrossLayerConnections(
    nodesByLevel: Map<number, any[]>,
    clusterCenters: Map<string, number>,
    relationshipData: any,
    width: number,
  ): void {
    const { connectionsMap } = relationshipData;
    const levels = Array.from(nodesByLevel.keys()).sort((a, b) => a - b);

    // Perform multiple optimization passes
    for (let pass = 0; pass < 2; pass++) {
      // Process each level pair
      for (let i = 0; i < levels.length - 1; i++) {
        const upperLevel = levels[i];
        const lowerLevel = levels[i + 1];

        const upperNodes = nodesByLevel.get(upperLevel) || [];
        const lowerNodes = nodesByLevel.get(lowerLevel) || [];

        this.optimizeLayerPair(upperNodes, lowerNodes, clusterCenters, connectionsMap, width);
      }
    }
  }

  private optimizeLayerPair(
    upperNodes: any[],
    lowerNodes: any[],
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
    width: number,
  ): void {
    // Calculate edge crossings and optimize lower level positions
    const crossingData = this.calculateEdgeCrossings(upperNodes, lowerNodes, clusterCenters, connectionsMap);

    if (crossingData.totalCrossings > 0) {
      // Try to reduce crossings by reordering nodes in the lower level
      const optimizedPositions = this.findBetterPositions(lowerNodes, upperNodes, clusterCenters, connectionsMap, width);

      // Apply improvements that reduce crossings
      optimizedPositions.forEach((newX, nodeId) => {
        if (clusterCenters.has(nodeId)) {
          clusterCenters.set(nodeId, newX);
        }
      });
    }
  }

  private calculateEdgeCrossings(
    upperNodes: any[],
    lowerNodes: any[],
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
  ): { totalCrossings: number; crossingPairs: Array<{ edge1: any; edge2: any }> } {
    const edges: Array<{ source: string; target: string; sourceX: number; targetX: number }> = [];

    // Build edge list between these two levels
    upperNodes.forEach(upperNode => {
      const connections = connectionsMap.get(upperNode.id) || [];
      connections.forEach(connId => {
        if (lowerNodes.some(n => n.id === connId)) {
          const sourceX = clusterCenters.get(upperNode.id) || 0;
          const targetX = clusterCenters.get(connId) || 0;
          edges.push({
            source: upperNode.id,
            target: connId,
            sourceX,
            targetX,
          });
        }
      });
    });

    // Count crossings
    let totalCrossings = 0;
    const crossingPairs = [];

    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const edge1 = edges[i];
        const edge2 = edges[j];

        // Check if edges cross
        const cross1 = edge1.sourceX < edge2.sourceX && edge1.targetX > edge2.targetX;
        const cross2 = edge1.sourceX > edge2.sourceX && edge1.targetX < edge2.targetX;

        if (cross1 || cross2) {
          totalCrossings++;
          crossingPairs.push({ edge1, edge2 });
        }
      }
    }

    return { totalCrossings, crossingPairs };
  }

  private findBetterPositions(
    lowerNodes: any[],
    upperNodes: any[],
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
    width: number,
  ): Map<string, number> {
    const improvements = new Map<string, number>();

    // Analyze shared connections among lower nodes
    const sharedConnectionAnalysis = this.analyzeSharedConnectionsForOptimization(lowerNodes, upperNodes, connectionsMap);

    // For each lower node, calculate its optimal position
    lowerNodes.forEach(lowerNode => {
      const connections = connectionsMap.get(lowerNode.id) || [];
      const connectedUpperNodes = connections.filter(connId => upperNodes.some(n => n.id === connId));

      if (connectedUpperNodes.length > 0) {
        // Calculate weighted center of connected upper nodes
        const connectedPositions = connectedUpperNodes
          .map(connId => clusterCenters.get(connId))
          .filter(pos => pos !== undefined) as number[];

        if (connectedPositions.length > 0) {
          let optimalX = connectedPositions.reduce((sum, pos) => sum + pos, 0) / connectedPositions.length;

          // Apply shared connection adjustment
          const sharedAdjustment = this.calculateSharedConnectionAdjustment(lowerNode, sharedConnectionAnalysis, clusterCenters);
          optimalX += sharedAdjustment;

          // Constrain to reasonable bounds
          const constrainedX = Math.max(50, Math.min(width - 50, optimalX));

          // Only suggest if it's significantly different from current position
          const currentX = clusterCenters.get(lowerNode.id) || 0;
          if (Math.abs(constrainedX - currentX) > 25) {
            // Reduced threshold for shared connections
            improvements.set(lowerNode.id, constrainedX);
          }
        }
      }
    });

    return improvements;
  }

  private analyzeSharedConnectionsForOptimization(
    lowerNodes: any[],
    upperNodes: any[],
    connectionsMap: Map<string, string[]>,
  ): Map<string, any> {
    const upperNodeConnections = new Map<string, string[]>(); // upperNode -> lowerNodes that connect to it

    upperNodes.forEach(upperNode => {
      const connectingLowerNodes = lowerNodes.filter(lowerNode => {
        const connections = connectionsMap.get(lowerNode.id) || [];
        return connections.includes(upperNode.id);
      });

      if (connectingLowerNodes.length > 1) {
        upperNodeConnections.set(
          upperNode.id,
          connectingLowerNodes.map(n => n.id),
        );
      }
    });

    return new Map([['upperNodeConnections', upperNodeConnections]]);
  }

  private calculateSharedConnectionAdjustment(
    node: any,
    sharedConnectionAnalysis: Map<string, any>,
    clusterCenters: Map<string, number>,
  ): number {
    const upperNodeConnections = sharedConnectionAnalysis.get('upperNodeConnections') as Map<string, string[]>;
    let adjustment = 0;
    let adjustmentCount = 0;

    // Find if this node shares connections with others
    upperNodeConnections.forEach(connectedNodes => {
      if (connectedNodes.includes(node.id)) {
        // This node shares a connection - calculate adjustment to cluster with siblings
        const siblingPositions = connectedNodes
          .filter(nodeId => nodeId !== node.id)
          .map(nodeId => clusterCenters.get(nodeId))
          .filter(pos => pos !== undefined) as number[];

        if (siblingPositions.length > 0) {
          const siblingCenter = siblingPositions.reduce((sum, pos) => sum + pos, 0) / siblingPositions.length;
          const currentPos = clusterCenters.get(node.id) || 0;

          // Gentle pull toward siblings (20% adjustment)
          adjustment += (siblingCenter - currentPos) * 0.2;
          adjustmentCount++;
        }
      }
    });

    return adjustmentCount > 0 ? adjustment / adjustmentCount : 0;
  }

  private applyBackPropagationOptimization(
    nodesByLevel: Map<number, any[]>,
    clusterCenters: Map<string, number>,
    relationshipData: any,
    width: number,
  ): void {
    const { childrenMap, connectionsMap } = relationshipData;
    const levels = Array.from(nodesByLevel.keys()).sort((a, b) => b - a); // Process bottom-up

    // Perform multiple back-propagation passes
    for (let pass = 0; pass < 2; pass++) {
      levels.forEach(level => {
        const levelNodes = nodesByLevel.get(level) || [];

        levelNodes.forEach(node => {
          const optimizedPosition = this.calculateBackPropagatedPosition(node, clusterCenters, childrenMap, connectionsMap, width);

          if (optimizedPosition !== null) {
            clusterCenters.set(node.id, optimizedPosition);
          }
        });
      });
    }
  }

  private calculateBackPropagatedPosition(
    parentNode: any,
    clusterCenters: Map<string, number>,
    childrenMap: Map<string, string[]>,
    connectionsMap: Map<string, string[]>,
    width: number,
  ): number | null {
    const currentPosition = clusterCenters.get(parentNode.id);
    if (currentPosition === undefined) {
      return null;
    }

    // Get all downstream connections (children and other connected nodes)
    const directChildren = childrenMap.get(parentNode.id) || [];
    const allConnections = connectionsMap.get(parentNode.id) || [];

    // Find positioned downstream nodes
    const downstreamNodes = [...directChildren, ...allConnections]
      .filter((nodeId, index, arr) => arr.indexOf(nodeId) === index) // Remove duplicates
      .filter(nodeId => {
        const pos = clusterCenters.get(nodeId);
        return pos !== undefined && this.isDownstreamNode(parentNode, nodeId, clusterCenters);
      });

    if (downstreamNodes.length === 0) {
      return null;
    }

    // Calculate weighted center of downstream nodes
    const downstreamPositions = downstreamNodes.map(nodeId => clusterCenters.get(nodeId)).filter(pos => pos !== undefined) as number[];
    const targetPosition = downstreamPositions.reduce((sum, pos) => sum + pos, 0) / downstreamPositions.length;

    // Apply gradual adjustment (30% toward children, maintaining some stability)
    const adjustmentStrength = this.calculateAdjustmentStrength(parentNode, downstreamNodes.length);
    const newPosition = currentPosition * (1 - adjustmentStrength) + targetPosition * adjustmentStrength;

    // Constrain to reasonable bounds and ensure significant movement
    const constrainedPosition = Math.max(50, Math.min(width - 50, newPosition));
    const movementThreshold = 20;

    return Math.abs(constrainedPosition - currentPosition) > movementThreshold ? constrainedPosition : null;
  }

  private isDownstreamNode(parentNode: any, childNodeId: string, clusterCenters: Map<string, number>): boolean {
    // Check if child is in a lower level (higher level number) than parent
    const parentLevel = this.NODE_LEVELS[parentNode.type as keyof typeof this.NODE_LEVELS] || 3;

    // Try to determine child level from node ID pattern or assume it's downstream
    // This is a heuristic - in practice, you might want to store level info with nodes
    if (childNodeId.includes('l3out:') || childNodeId.includes('service-graph:')) {
      return parentLevel <= 3; // VRF level is 2, L3Out/ServiceGraph is 3
    }
    if (childNodeId.includes('external-firewall:') || childNodeId.includes('service-graph-firewall:')) {
      return parentLevel <= 4; // Firewall level is 4
    }
    if (childNodeId.includes('external-vrf-connection:')) {
      return parentLevel <= 5; // External VRF Connection level is 5
    }

    // Default: assume it's downstream if we have position info
    return clusterCenters.has(childNodeId);
  }

  private calculateAdjustmentStrength(parentNode: any, childrenCount: number): number {
    // More children = stronger pull toward their center
    const baseStrength = 0.3; // 30% base adjustment
    const childrenBonus = Math.min(0.2, childrenCount * 0.05); // Up to 20% bonus for many children

    // VRFs should be more responsive to their children's positions
    const typeMultiplier = parentNode.type === 'VRF' ? 1.2 : 1.0;

    return (baseStrength + childrenBonus) * typeMultiplier;
  }

  private optimizeLowerLevels(
    nodesByLevel: Map<number, any[]>,
    clusterCenters: Map<string, number>,
    relationshipData: any,
    width: number,
  ): void {
    const { connectionsMap } = relationshipData;
    const levels = Array.from(nodesByLevel.keys()).sort((a, b) => b - a); // Bottom-up

    // Focus on the bottom 3 levels where overlap is most problematic
    const lowerLevels = levels.slice(0, 3);

    // Perform multiple optimization passes for lower levels
    for (let pass = 0; pass < 3; pass++) {
      lowerLevels.forEach(level => {
        const levelNodes = nodesByLevel.get(level) || [];

        if (levelNodes.length > 1) {
          this.optimizeLevelForConnectionDensity(levelNodes, clusterCenters, connectionsMap, width, level);
        }
      });

      // After each pass, apply multi-level edge crossing reduction
      this.reduceMultiLevelCrossings(lowerLevels, nodesByLevel, clusterCenters, connectionsMap, width);
    }
  }

  private optimizeLevelForConnectionDensity(
    levelNodes: any[],
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
    width: number,
    level: number,
  ): void {
    // Skip optimization if nodes have displayOrder (respect explicit ordering)
    const hasDisplayOrder = levelNodes.some(node => this.hasValidDisplayOrder(node));
    if (hasDisplayOrder) {
      return; // Don't override explicit displayOrder positioning
    }

    // Analyze connection density for each node
    const connectionAnalysis = this.analyzeConnectionDensity(levelNodes, clusterCenters, connectionsMap);

    // Sort nodes by connection density and incoming connection positions
    const optimizedOrder = this.calculateOptimalOrder(levelNodes, connectionAnalysis);

    // Redistribute nodes with enhanced spacing based on density
    this.redistributeNodesForDensity(optimizedOrder, clusterCenters, connectionAnalysis, width, level);
  }

  private analyzeConnectionDensity(
    levelNodes: any[],
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
  ): Map<string, any> {
    const nodeAnalysis = new Map<string, any>();

    levelNodes.forEach(node => {
      const connections = connectionsMap.get(node.id) || [];
      const incomingConnections = connections.filter(connId => clusterCenters.has(connId));
      const incomingPositions = incomingConnections.map(connId => clusterCenters.get(connId)).filter(pos => pos !== undefined) as number[];

      const avgIncomingPosition =
        incomingPositions.length > 0
          ? incomingPositions.reduce((sum, pos) => sum + pos, 0) / incomingPositions.length
          : clusterCenters.get(node.id) || 0;

      nodeAnalysis.set(node.id, {
        node,
        connectionCount: incomingConnections.length,
        avgIncomingPosition,
        incomingPositions,
        currentPosition: clusterCenters.get(node.id) || 0,
      });
    });

    return nodeAnalysis;
  }

  private calculateOptimalOrder(levelNodes: any[], connectionAnalysis: Map<string, any>): any[] {
    // Sort nodes by their optimal position based on incoming connections
    return [...levelNodes].sort((a, b) => {
      const aAnalysis = connectionAnalysis.get(a.id);
      const bAnalysis = connectionAnalysis.get(b.id);

      if (!aAnalysis || !bAnalysis) {
        return a.name.localeCompare(b.name);
      }

      // Primary sort: by average incoming position
      const positionDiff = aAnalysis.avgIncomingPosition - bAnalysis.avgIncomingPosition;
      if (Math.abs(positionDiff) > 10) {
        return positionDiff;
      }

      // Secondary sort: by connection count (more connections = more stable)
      const connectionDiff = bAnalysis.connectionCount - aAnalysis.connectionCount;
      if (connectionDiff !== 0) {
        return connectionDiff;
      }

      // Tertiary sort: by name for consistency
      return a.name.localeCompare(b.name);
    });
  }

  private redistributeNodesForDensity(
    orderedNodes: any[],
    clusterCenters: Map<string, number>,
    connectionAnalysis: Map<string, any>,
    width: number,
    level: number,
  ): void {
    const nodeCount = orderedNodes.length;
    if (nodeCount <= 1) {
      return;
    }

    // Calculate dynamic spacing based on level and connection density
    const baseSpacing = this.calculateDynamicSpacing(orderedNodes, connectionAnalysis, level);
    const totalWidth = (nodeCount - 1) * baseSpacing;
    const startX = Math.max(50, (width - totalWidth) / 2);

    orderedNodes.forEach((node, index) => {
      const analysis = connectionAnalysis.get(node.id);
      if (!analysis) {
        return;
      }

      // Base position from even distribution
      const evenPosition = startX + index * baseSpacing;

      // Bias toward incoming connections
      const incomingBias = analysis.avgIncomingPosition;
      const biasStrength = Math.min(0.4, analysis.connectionCount * 0.1); // Up to 40% bias

      const optimizedPosition = evenPosition * (1 - biasStrength) + incomingBias * biasStrength;
      const constrainedPosition = Math.max(50, Math.min(width - 50, optimizedPosition));

      clusterCenters.set(node.id, constrainedPosition);
    });
  }

  private calculateDynamicSpacing(orderedNodes: any[], connectionAnalysis: Map<string, any>, level: number): number {
    // Base spacing increases for lower levels (more crowded)
    const levelMultiplier = Math.max(1, level - 2); // Levels 3+ get extra spacing
    let baseSpacing = 50 + levelMultiplier * 15;

    // Reduce spacing if we have many high-connection nodes (they need to be closer to their sources)
    const avgConnectionCount =
      orderedNodes.reduce((sum, node) => {
        const analysis = connectionAnalysis.get(node.id);
        return sum + (analysis?.connectionCount || 0);
      }, 0) / orderedNodes.length;

    if (avgConnectionCount > 2) {
      baseSpacing *= 0.8; // Reduce spacing by 20% for highly connected levels
    }

    return Math.max(35, baseSpacing); // Minimum spacing of 35px
  }

  private reduceMultiLevelCrossings(
    lowerLevels: number[],
    nodesByLevel: Map<number, any[]>,
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
    width: number,
  ): void {
    // Check for crossings that span multiple levels
    for (let i = 0; i < lowerLevels.length - 1; i++) {
      const upperLevel = lowerLevels[i + 1]; // Higher in hierarchy (lower number)
      const lowerLevel = lowerLevels[i]; // Lower in hierarchy (higher number)

      const upperNodes = nodesByLevel.get(upperLevel) || [];
      const lowerNodes = nodesByLevel.get(lowerLevel) || [];

      // Find and resolve multi-level crossings
      const crossingImprovements = this.findMultiLevelCrossingImprovements(upperNodes, lowerNodes, clusterCenters, connectionsMap, width);

      // Apply improvements
      crossingImprovements.forEach((newPosition, nodeId) => {
        clusterCenters.set(nodeId, newPosition);
      });
    }
  }

  private findMultiLevelCrossingImprovements(
    upperNodes: any[],
    lowerNodes: any[],
    clusterCenters: Map<string, number>,
    connectionsMap: Map<string, string[]>,
    width: number,
  ): Map<string, number> {
    const improvements = new Map<string, number>();

    // Build connection map between these levels
    const connections: Array<{ upper: string; lower: string; upperX: number; lowerX: number }> = [];

    upperNodes.forEach(upperNode => {
      const upperConnections = connectionsMap.get(upperNode.id) || [];
      upperConnections.forEach(connId => {
        if (lowerNodes.some(n => n.id === connId)) {
          const upperX = clusterCenters.get(upperNode.id) || 0;
          const lowerX = clusterCenters.get(connId) || 0;
          connections.push({
            upper: upperNode.id,
            lower: connId,
            upperX,
            lowerX,
          });
        }
      });
    });

    // Find the most problematic crossings and suggest improvements
    const crossingCount = this.countCrossings(connections);
    if (crossingCount > 0) {
      // Try to improve by adjusting lower level positions toward their connections
      lowerNodes.forEach(lowerNode => {
        const nodeConnections = connections.filter(c => c.lower === lowerNode.id);
        if (nodeConnections.length > 0) {
          const avgUpperX = nodeConnections.reduce((sum, c) => sum + c.upperX, 0) / nodeConnections.length;
          const currentX = clusterCenters.get(lowerNode.id) || 0;

          // Move 25% toward the average position of connected upper nodes
          const improvedX = currentX * 0.75 + avgUpperX * 0.25;
          const constrainedX = Math.max(50, Math.min(width - 50, improvedX));

          if (Math.abs(constrainedX - currentX) > 15) {
            improvements.set(lowerNode.id, constrainedX);
          }
        }
      });
    }

    return improvements;
  }

  private countCrossings(connections: Array<{ upper: string; lower: string; upperX: number; lowerX: number }>): number {
    let crossings = 0;

    for (let i = 0; i < connections.length; i++) {
      for (let j = i + 1; j < connections.length; j++) {
        const c1 = connections[i];
        const c2 = connections[j];

        // Check if these connections cross
        const cross1 = c1.upperX < c2.upperX && c1.lowerX > c2.lowerX;
        const cross2 = c1.upperX > c2.upperX && c1.lowerX < c2.lowerX;

        if (cross1 || cross2) {
          crossings++;
        }
      }
    }

    return crossings;
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
