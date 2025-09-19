import { Injectable } from '@angular/core';
import { D3Node, D3Link } from './tenant-graph-data.service';

/**
 * # Tenant Graph Layout Service
 *
 * ## Overview
 *
 * This service handles all layout calculation and node positioning algorithms for tenant graph visualization.
 * It implements sophisticated positioning algorithms to create readable, well-organized network topology layouts
 * with minimal edge crossings and logical grouping of related components.
 *
 * ## Key Layout Algorithms
 *
 * ### 1. **Hierarchical Positioning**
 * - Assigns nodes to vertical layers (levels 1-7) based on their type
 * - Top-down approach: Tenants → VRFs → L3Outs/Service Graphs → Firewalls, etc.
 * - Maintains consistent layer spacing and alignment
 * - Supports custom node level overrides
 *
 * ### 2. **Smart Horizontal Clustering**
 * - **Display order support**: If nodes have `displayOrder` metadata, uses that for positioning
 * - **Relationship-based clustering**: Groups nodes based on their connections
 * - **Shared connection optimization**: Nodes that connect to the same targets are positioned closer together
 * - **Parent-child alignment**: Child nodes positioned relative to their parents
 *
 * ### 3. **Multi-pass Optimization**
 * The service runs multiple optimization passes to improve the layout:
 * - **Forward pass**: Optimizes based on parent-child relationships
 * - **Backward pass**: Parents adjust to their children's positions (back-propagation)
 * - **Cross-layer optimization**: Reduces edge crossings between adjacent layers
 * - **Shared target optimization**: Groups nodes with common downstream connections
 *
 * ### 4. **Connection Analysis**
 * - Analyzes shared connections for better positioning
 * - Calculates connection similarity using Jaccard similarity
 * - Identifies orphaned nodes and handles them appropriately
 * - Optimizes for minimal edge crossings
 *
 * ## Layout Process Flow
 *
 * ```
 * 1. Group nodes by hierarchy level
 *     ↓
 * 2. Calculate hierarchical positions (top-down)
 *     ↓
 * 3. Apply optimization algorithms
 *     ↓
 * 4. Return cluster centers and positioning functions
 * ```
 *
 * ## Display Order Support
 *
 * Nodes can have a `displayOrder` property in their config or metadata to control positioning:
 * ```typescript
 * node.config.displayOrder = 1; // Left-most position
 * node.metadata.displayOrder = 2; // Second position
 * ```
 *
 * Lower values appear on the left, higher values on the right. Nodes without displayOrder
 * are positioned after ordered nodes and sorted alphabetically.
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private layoutService: TenantGraphLayoutService) {}
 *
 * // Calculate layout
 * calculatePositions(nodes: D3Node[], links: D3Link[]) {
 *   const config: LayoutConfig = {
 *     width: 1200,
 *     height: 800,
 *     margins: { top: 40, bottom: 30 },
 *     clusterConfig: { widthPercent: 0.7, startPercent: 0.15 },
 *     levelLabels: { 1: 'Tenant', 2: 'VRF', 3: 'Service Graph' },
 *     nodeLevels: { TENANT: 1, VRF: 2, L3OUT: 3 },
 *     enableOptimization: true
 *   };
 *
 *   const result = this.layoutService.calculateLayout(nodes, links, config);
 *
 *   // Apply positions to nodes
 *   nodes.forEach(node => {
 *     node.x = result.clusterCenters.get(node.id) || config.width / 2;
 *     node.y = result.yForType(node.type);
 *   });
 * }
 * ```
 *
 * ## Performance Considerations
 *
 * - **Large graphs**: For graphs with 100+ nodes, consider disabling optimization
 * - **Complex optimization**: Multi-pass algorithms can be computationally expensive
 * - **Memory usage**: Maintains multiple maps and data structures during calculation
 * - **Real-time updates**: Layout calculation happens on every graph render
 */

export interface LayoutResult {
  clusterCenters: Map<string, number>;
  yForType: (type: string) => number;
  ringRadii?: number[]; // For circular layout guide circles
}

export interface LayoutConfig {
  width: number;
  height: number;
  margins: { top: number; bottom: number };
  clusterConfig: { widthPercent: number; startPercent: number };
  levelLabels: Record<number, string>;
  nodeLevels: Record<string, number>;
  layoutMode?: 'hierarchical' | 'circular';
  circularConfig?: {
    centerLevel?: number; // Which level to center (default: level with most nodes)
    radiusMultiplier?: number; // Controls spacing between rings (default: 1.2)
    startAngle?: number; // Starting angle for first node (default: -Math.PI/2, top)
    ringSpacing?: number; // Base spacing between rings (default: 80)
    minRadius?: number; // Minimum radius for center ring (default: 60)
  };
}

@Injectable({
  providedIn: 'root',
})
export class TenantGraphLayoutService {
  private readonly HIERARCHY_EDGE_TYPES = ['TENANT_CONTAINS_VRF', 'VRF_TO_L3OUT', 'VRF_TO_SERVICE_GRAPH'];

  public calculateLayout(nodes: D3Node[], links: D3Link[], config: LayoutConfig): LayoutResult {
    if (config.layoutMode === 'circular') {
      return this.calculateCircularLayout(nodes, links, config);
    } else {
      return this.calculateHierarchicalLayout(nodes, links, config);
    }
  }

  private calculateHierarchicalLayout(nodes: D3Node[], links: D3Link[], config: LayoutConfig): LayoutResult {
    const { width, height, margins, clusterConfig, levelLabels, nodeLevels } = config;

    const maxLevel = Math.max(...Object.keys(levelLabels).map(k => parseInt(k, 10)));
    const laneCount = Math.max(maxLevel, 6);
    const innerH = Math.max(0, height - margins.top - margins.bottom);
    const laneH = innerH / laneCount;
    const yForLevel = (lvl: number) => margins.top + (lvl - 0.5) * laneH;
    const yForType = (type: string) => yForLevel(nodeLevels[type] || 3);

    // Build comprehensive relationship maps
    const relationshipData = this.buildRelationshipMaps(nodes, links);

    // Group nodes by level
    const nodesByLevel = new Map<number, D3Node[]>();
    nodes.forEach(node => {
      const level = nodeLevels[node.type] || 3;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)?.push(node);
    });

    // Calculate optimized positions level by level
    const clusterCenters = this.calculateHierarchicalPositions(nodesByLevel, relationshipData, width, clusterConfig);

    return { clusterCenters, yForType };
  }

  private buildRelationshipMaps(nodes: D3Node[], links: D3Link[]) {
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
    nodesByLevel: Map<number, D3Node[]>,
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
    levelNodes: D3Node[],
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

  private hasValidDisplayOrder(node: D3Node): boolean {
    // Check if node has a valid displayOrder in its config or metadata
    const displayOrder = this.getDisplayOrder(node);
    return displayOrder !== null && displayOrder !== undefined && displayOrder !== 0;
  }

  private getDisplayOrder(node: D3Node): number | null {
    // Try to get displayOrder from various possible locations
    if (node.originalNode?.config?.displayOrder !== undefined && node.originalNode.config.displayOrder !== null) {
      return node.originalNode.config.displayOrder;
    }
    if (node.originalNode?.metadata?.displayOrder !== undefined && node.originalNode.metadata.displayOrder !== null) {
      return node.originalNode.metadata.displayOrder;
    }
    return null;
  }

  private positionNodesByDisplayOrder(
    levelNodes: D3Node[],
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
    orderedNodes: D3Node[],
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
    levelNodes: D3Node[],
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
    levelNodes: D3Node[],
    parentMap: Map<string, string>,
    connectionsMap: Map<string, string[]>,
    clusterCenters: Map<string, number>,
    sharedConnectionData: Map<string, any>,
  ): Map<string, D3Node[]> {
    const groups = new Map<string, D3Node[]>();
    const sharedGroups = sharedConnectionData.get('sharedGroups') as Map<string, string[]>;
    const processedNodes = new Set<string>();

    // First, handle nodes with shared connections
    sharedGroups.forEach((nodeIds, groupKey) => {
      const groupNodes = nodeIds.map(id => levelNodes.find(n => n.id === id)).filter(n => n) as D3Node[];
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

  private findBestGroupKey(
    node: D3Node,
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

  private distributeNodesWithSharedConnections(
    nodes: D3Node[],
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

  private checkForSharedTargets(nodes: D3Node[], nodeToTargets: Map<string, string[]>): boolean {
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
    nodes: D3Node[],
    centerX: number,
    clusterCenters: Map<string, number>,
    nodeToTargets: Map<string, string[]>,
  ): void {
    const nodeCount = nodes.length;

    // Calculate tighter spacing for shared connections
    const baseSpacing = Math.min(30, 250 / Math.max(1, nodeCount)); // Even tighter spacing

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

  private sortNodesByConnectionSimilarity(nodes: D3Node[], nodeToTargets: Map<string, string[]>): D3Node[] {
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

  private distributeNodesAroundCenter(nodes: D3Node[], centerX: number, clusterCenters: Map<string, number>): void {
    const nodeCount = nodes.length;
    const spacing = Math.min(40, 300 / Math.max(1, nodeCount)); // Tighter adaptive spacing

    nodes.forEach((node, index) => {
      if (nodeCount === 1) {
        clusterCenters.set(node.id, centerX);
      } else {
        const offset = (index - (nodeCount - 1) / 2) * spacing;
        clusterCenters.set(node.id, centerX + offset);
      }
    });
  }

  /**
   * Calculate circular layout with nodes arranged in concentric rings
   */
  private calculateCircularLayout(nodes: D3Node[], links: D3Link[], config: LayoutConfig): LayoutResult {
    const { width, height, nodeLevels, circularConfig } = config;

    // Apply default circular configuration
    const circularDefaults = {
      centerLevel: this.findOptimalCenterLevel(nodes, nodeLevels),
      radiusMultiplier: 1.0, // Reduced for more even spacing
      startAngle: -Math.PI / 2, // Start at top
      ringSpacing: 100, // Increased for better separation
      minRadius: 40, // Smaller center for tenant
      ...circularConfig,
    };

    // Group nodes by level
    const nodesByLevel = this.groupNodesByLevel(nodes, nodeLevels);

    // Calculate ring assignments (center level = ring 0, others by distance from center)
    const ringAssignments = this.assignNodesToRings(nodesByLevel, circularDefaults.centerLevel);

    // Distribute nodes angularly within each ring
    const angularPositions = this.distributeNodesAngularly(ringAssignments, links, circularDefaults);

    // Convert polar coordinates to cartesian
    const clusterCenters = this.convertToCartesian(angularPositions, width, height);

    // Create a yForType function that works with circular layout
    const yForType = this.createCircularYFunction(angularPositions, height);

    // Get ring radii for guide circles
    const ringRadii = this.getRingRadii(ringAssignments, circularDefaults);

    return { clusterCenters, yForType, ringRadii };
  }

  private findOptimalCenterLevel(nodes: D3Node[], nodeLevels: Record<string, number>): number {
    // Always use TENANT as center level for circular layout - it should be at the center
    const tenantLevel = nodeLevels.TENANT;
    if (tenantLevel !== undefined) {
      return tenantLevel;
    }

    // Fallback: find level with most nodes
    const levelCounts = new Map<number, number>();

    nodes.forEach(node => {
      const level = nodeLevels[node.type] || 3;
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    });

    let maxCount = 0;
    let optimalLevel = 1; // Default to level 1 (where TENANT should be)

    levelCounts.forEach((count, level) => {
      if (count > maxCount) {
        maxCount = count;
        optimalLevel = level;
      }
    });

    return optimalLevel;
  }

  private groupNodesByLevel(nodes: D3Node[], nodeLevels: Record<string, number>): Map<number, D3Node[]> {
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

  private assignNodesToRings(nodesByLevel: Map<number, D3Node[]>, centerLevel: number): Map<number, D3Node[]> {
    const ringAssignments = new Map<number, D3Node[]>();

    nodesByLevel.forEach((nodes, level) => {
      const ringIndex = Math.abs(level - centerLevel);
      if (!ringAssignments.has(ringIndex)) {
        ringAssignments.set(ringIndex, []);
      }
      ringAssignments.get(ringIndex)?.push(...nodes);
    });

    return ringAssignments;
  }

  private distributeNodesAngularly(
    ringAssignments: Map<number, D3Node[]>,
    links: D3Link[],
    circularConfig: any,
  ): Map<string, { radius: number; angle: number }> {
    const positions = new Map();

    ringAssignments.forEach((nodes, ringIndex) => {
      const radius = this.calculateRingRadius(ringIndex, circularConfig);

      // Sort nodes by displayOrder, respecting the existing logic
      const orderedNodes = this.sortNodesByDisplayOrder(nodes);

      // Distribute around the circle
      const angleStep = orderedNodes.length > 0 ? (2 * Math.PI) / orderedNodes.length : 0;

      orderedNodes.forEach((node, index) => {
        const angle = circularConfig.startAngle + index * angleStep;
        positions.set(node.id, { radius, angle });
      });
    });

    return positions;
  }

  private calculateRingRadius(ringIndex: number, circularConfig: any): number {
    if (ringIndex === 0) {
      return circularConfig.minRadius;
    }
    return circularConfig.minRadius + ringIndex * circularConfig.ringSpacing * circularConfig.radiusMultiplier;
  }

  private sortNodesByDisplayOrder(nodes: D3Node[]): D3Node[] {
    // Reuse existing display order logic
    const nodesWithOrder = nodes.filter(node => this.hasValidDisplayOrder(node));
    const nodesWithoutOrder = nodes.filter(node => !this.hasValidDisplayOrder(node));

    // Sort nodes with displayOrder (lower displayOrder = earlier in circle)
    const sortedOrderedNodes = nodesWithOrder.sort((a, b) => {
      const aOrder = this.getDisplayOrder(a) || 0;
      const bOrder = this.getDisplayOrder(b) || 0;
      return aOrder - bOrder;
    });

    // Sort nodes without displayOrder by name
    const sortedUnorderedNodes = nodesWithoutOrder.sort((a, b) => a.name.localeCompare(b.name));

    // Combine: ordered nodes first (starting position), then unordered nodes
    return [...sortedOrderedNodes, ...sortedUnorderedNodes];
  }

  private convertToCartesian(
    angularPositions: Map<string, { radius: number; angle: number }>,
    width: number,
    height: number,
  ): Map<string, number> {
    const clusterCenters = new Map<string, number>();
    const centerX = width / 2;
    const centerY = height / 2;

    angularPositions.forEach((position, nodeId) => {
      const x = centerX + position.radius * Math.cos(position.angle);
      const y = centerY + position.radius * Math.sin(position.angle);

      // Store x position in clusterCenters
      clusterCenters.set(nodeId, x);

      // Store y position with special key for circular layout
      clusterCenters.set(`${nodeId}_y`, y);
    });

    return clusterCenters;
  }

  private createCircularYFunction(
    angularPositions: Map<string, { radius: number; angle: number }>,
    height: number,
  ): (type: string) => number {
    const centerY = height / 2;

    // For circular layout, return center as fallback (actual Y positions are stored per-node)
    return () => centerY;
  }

  private getRingRadii(ringAssignments: Map<number, D3Node[]>, circularConfig: any): number[] {
    const radii: number[] = [];
    const sortedRings = Array.from(ringAssignments.keys()).sort((a, b) => a - b);

    sortedRings.forEach(ringIndex => {
      const radius = this.calculateRingRadius(ringIndex, circularConfig);
      radii.push(radius);
    });

    return radii;
  }
}
