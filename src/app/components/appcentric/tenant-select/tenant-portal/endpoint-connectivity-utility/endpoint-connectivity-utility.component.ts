import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'client/api/utilities.service';
import { ConnectivityQuery } from 'client/model/models';
import { ConnectivityPath } from 'client/model/models';
import { Router } from '@angular/router';

interface GraphNode {
  id: string;
  type: string;
  name: string | null;
  metadata?: any;
  tenantId?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  sourceType: string;
  targetType: string;
  type: string;
}

interface HierarchyNode {
  id: string;
  type: string;
  name: string | null;
  metadata?: any;
  children: HierarchyNode[];
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    status: string;
    bypassServiceGraph: boolean;
  };
  hierarchy?: HierarchyNode[];
}

@Component({
  selector: 'app-endpoint-connectivity-utility',
  templateUrl: './endpoint-connectivity-utility.component.html',
  styleUrls: ['./endpoint-connectivity-utility.component.scss'],
})
export class EndpointConnectivityUtilityComponent implements OnInit {
  connectivityForm: FormGroup;
  connectivityPath: ConnectivityPath | null = null;
  graph: Graph | null = null;
  isLoading = false;
  error: string | null = null;
  tenantId: string;

  // Track expanded/collapsed state of hierarchy nodes
  expandedNodes: Set<string> = new Set();

  // Track active path nodes
  activePathNodes: Set<string> = new Set();
  sourceEndpointId: string | null = null;
  destEndpointId: string | null = null;

  // Constants for form defaults
  protocolOptions = ['tcp', 'udp', 'icmp'];

  constructor(private fb: FormBuilder, private utilitiesService: UtilitiesService, private router: Router) {
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
    this.connectivityForm = this.fb.group({
      generatedConfigIdentifier: ['connectivity-test-' + Date.now(), Validators.required],
      sourceEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      sourceEndpointPort: [null],
      destinationEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      destinationEndpointPort: ['', [Validators.required, Validators.pattern('^\\d+$')]],
      ipProtocol: ['tcp', Validators.required],
      bypassServiceGraph: [true],
      generateConfig: [false],
      applyConfig: [false],
      bidirectional: [false],
    });
  }

  ngOnInit(): void {
    // Initialization logic can be added here if needed
  }

  onSubmit(): void {
    if (this.connectivityForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.activePathNodes.clear();

    const query: ConnectivityQuery = this.connectivityForm.value;
    query.tenantId = this.tenantId;
    // Convert string port values to numbers
    if (query.sourceEndpointPort) {
      query.sourceEndpointPort = Number(query.sourceEndpointPort);
    }
    query.destinationEndpointPort = Number(query.destinationEndpointPort);

    this.utilitiesService.generateConnectivityReportUtilities({ connectivityQuery: query }).subscribe(
      result => {
        this.isLoading = false;
        this.connectivityPath = result;
        this.graph = result as unknown as Graph;
        console.log('Connectivity results:', result);

        // Initialize all nodes as expanded
        this.expandAllNodes();

        // Identify source and destination endpoints and active path
        this.identifyConnectivityPathNodes();
      },
      error => {
        this.isLoading = false;
        this.error = error.message || 'An error occurred while testing connectivity';
        console.error('Error testing connectivity:', error);
      },
    );
  }

  // Identify nodes in the connectivity path
  identifyConnectivityPathNodes(): void {
    if (!this.graph || !this.graph.nodes) {
      return;
    }

    // Find source and destination endpoints based on IP addresses from the form
    const sourceIp = this.connectivityForm.get('sourceEndpointIp')?.value;
    const destIp = this.connectivityForm.get('destinationEndpointIp')?.value;

    // Find source and destination endpoint nodes
    const sourceEndpoint = this.graph.nodes.find(node => node.type === 'endpoint' && node.metadata?.ipAddress === sourceIp);

    const destEndpoint = this.graph.nodes.find(node => node.type === 'endpoint' && node.metadata?.ipAddress === destIp);

    if (sourceEndpoint) {
      this.sourceEndpointId = sourceEndpoint.id;
      this.activePathNodes.add(sourceEndpoint.id);

      // Find parent EPG
      const sourceEpgEdge = this.graph.edges.find(edge => edge.target === sourceEndpoint.id && edge.sourceType === 'epg');

      if (sourceEpgEdge) {
        this.activePathNodes.add(sourceEpgEdge.source);

        // Find parent ESG
        const sourceEsgEdge = this.graph.edges.find(edge => edge.target === sourceEpgEdge.source && edge.sourceType === 'esg');

        if (sourceEsgEdge) {
          this.activePathNodes.add(sourceEsgEdge.source);
        }
      }
    }

    if (destEndpoint) {
      this.destEndpointId = destEndpoint.id;
      this.activePathNodes.add(destEndpoint.id);

      // Find parent EPG
      const destEpgEdge = this.graph.edges.find(edge => edge.target === destEndpoint.id && edge.sourceType === 'epg');

      if (destEpgEdge) {
        this.activePathNodes.add(destEpgEdge.source);

        // Find parent ESG
        const destEsgEdge = this.graph.edges.find(edge => edge.target === destEpgEdge.source && edge.sourceType === 'esg');

        if (destEsgEdge) {
          this.activePathNodes.add(destEsgEdge.source);
        }
      }
    }

    // Add contract, subject, and filter nodes to active path
    this.graph.edges.forEach(edge => {
      if (edge.type === 'to' || edge.type === 'from') {
        if (this.activePathNodes.has(edge.source) || this.activePathNodes.has(edge.target)) {
          this.activePathNodes.add(edge.source);
          this.activePathNodes.add(edge.target);
        }
      }
    });
  }

  // Check if a node is in the active path
  isActivePathNode(nodeId: string): boolean {
    return this.activePathNodes.has(nodeId);
  }

  // Get the role of an ESG/EPG in the connectivity path
  getNodeRole(nodeId: string): string | null {
    if (!this.graph) {
      return null;
    }

    // Check if it's a consumer (to) of any contract
    const consumerEdge = this.graph.edges.find(edge => edge.source === nodeId && edge.type === 'to');

    if (consumerEdge) {
      return 'consumer';
    }

    // Check if it's a provider (from) of any contract
    const providerEdge = this.graph.edges.find(edge => edge.source === nodeId && edge.type === 'from');

    if (providerEdge) {
      return 'provider';
    }

    return null;
  }

  // Get related ESG/EPG for a given node based on consumer/provider relationship
  getRelatedNode(nodeId: string, relationType: 'consumer' | 'provider'): string | null {
    if (!this.graph) {
      return null;
    }

    // If node is a consumer, find the contract, then find the provider
    if (relationType === 'provider') {
      const consumerEdge = this.graph.edges.find(edge => edge.source === nodeId && edge.type === 'to');

      if (consumerEdge) {
        const contractId = consumerEdge.target;

        // Find provider of this contract
        const providerEdge = this.graph.edges.find(edge => edge.target === contractId && edge.type === 'from');

        if (providerEdge) {
          return providerEdge.source;
        }
      }
    }

    // If node is a provider, find the contract, then find the consumer
    if (relationType === 'consumer') {
      const providerEdge = this.graph.edges.find(edge => edge.source === nodeId && edge.type === 'from');

      if (providerEdge) {
        const contractId = providerEdge.target;

        // Find consumer of this contract
        const consumerEdge = this.graph.edges.find(edge => edge.target === contractId && edge.type === 'to');

        if (consumerEdge) {
          return consumerEdge.source;
        }
      }
    }

    return null;
  }

  // Hierarchy-based methods
  getHierarchy(): HierarchyNode[] {
    if (!this.graph || !this.graph.hierarchy) {
      return [];
    }
    return this.graph.hierarchy;
  }

  getTenants(): HierarchyNode[] {
    return this.getHierarchy().filter(node => node.type === 'tenant');
  }

  getChildrenByType(node: HierarchyNode, type: string): HierarchyNode[] {
    return node.children.filter(child => child.type === type);
  }

  getNodeRelationships(nodeId: string): GraphEdge[] {
    if (!this.graph) {
      return [];
    }

    return this.graph.edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
  }

  getConsumerEdges(contractId: string): GraphEdge[] {
    if (!this.graph) {
      return [];
    }

    return this.graph.edges.filter(edge => edge.target === contractId && edge.type === 'to');
  }

  getProviderEdges(contractId: string): GraphEdge[] {
    if (!this.graph) {
      return [];
    }

    return this.graph.edges.filter(edge => edge.source === contractId && edge.type === 'from');
  }

  getConsumers(contractNode: HierarchyNode): any[] {
    return contractNode.metadata?.consumers || [];
  }

  getProviders(contractNode: HierarchyNode): any[] {
    return contractNode.metadata?.providers || [];
  }

  // Find node in hierarchy by ID
  findNodeInHierarchy(id: string, nodes: HierarchyNode[] = this.getHierarchy()): HierarchyNode | null {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const foundNode = this.findNodeInHierarchy(id, node.children);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }

  // Expand/collapse functionality
  isExpanded(nodeId: string): boolean {
    return this.expandedNodes.has(nodeId);
  }

  toggleExpand(nodeId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.isExpanded(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  expandAllNodes(): void {
    if (!this.graph || !this.graph.hierarchy) {
      return;
    }

    const expandAll = (nodes: HierarchyNode[]) => {
      for (const node of nodes) {
        this.expandedNodes.add(node.id);
        if (node.children && node.children.length > 0) {
          expandAll(node.children);
        }
      }
    };

    expandAll(this.graph.hierarchy);
  }

  collapseAllNodes(): void {
    this.expandedNodes.clear();
  }

  getNodeIcon(type: string): string {
    switch (type) {
      case 'tenant':
        return 'building';
      case 'esg':
        return 'object-group';
      case 'epg':
        return 'layer-group';
      case 'endpoint':
        return 'desktop';
      case 'contract':
        return 'file-contract';
      case 'subject':
        return 'book';
      case 'filter':
        return 'filter';
      case 'filter_entry':
        return 'list';
      default:
        return 'circle';
    }
  }

  getNodeColor(type: string): string {
    switch (type) {
      case 'tenant':
        return '#3498db';
      case 'esg':
        return '#16a085';
      case 'epg':
        return '#3498db';
      case 'endpoint':
        return '#2c3e50';
      case 'contract':
        return '#9b59b6';
      case 'subject':
        return '#8e44ad';
      case 'filter':
        return '#e67e22';
      case 'filter_entry':
        return '#d35400';
      default:
        return '#95a5a6';
    }
  }

  getConnectionStatus(): string {
    if (!this.graph) {
      return 'unknown';
    }
    return this.graph.metadata.status;
  }

  isConnectionAllowed(): boolean {
    return this.getConnectionStatus() === 'allowed';
  }

  getStatusClass(): string {
    const status = this.getConnectionStatus();
    switch (status) {
      case 'allowed':
        return 'status-allowed';
      case 'denied':
        return 'status-denied';
      default:
        return 'status-unknown';
    }
  }

  // Edge and relationship helpers
  getRelationshipType(source: string, target: string): string {
    if (!this.graph) {
      return '';
    }

    const edge = this.graph.edges.find(e => (e.source === source && e.target === target) || (e.source === target && e.target === source));

    if (!edge) {
      return '';
    }

    return edge.type;
  }

  isConsumerOf(sourceId: string, targetId: string): boolean {
    if (!this.graph) {
      return false;
    }

    const edge = this.graph.edges.find(e => e.source === sourceId && e.target === targetId && e.type === 'to');

    return !!edge;
  }

  isProviderFor(sourceId: string, targetId: string): boolean {
    if (!this.graph) {
      return false;
    }

    const edge = this.graph.edges.find(e => e.source === sourceId && e.target === targetId && e.type === 'from');

    return !!edge;
  }

  getNodeMetadataDisplay(node: HierarchyNode): string[] {
    if (!node.metadata) {
      return [];
    }

    const result: string[] = [];

    if (node.type === 'endpoint') {
      if (node.metadata.ipAddress) {
        result.push(`IP: ${node.metadata.ipAddress}`);
      }
      if (node.metadata.ipProtocol) {
        result.push(`Protocol: ${node.metadata.ipProtocol.toUpperCase()}`);
      }
      if (node.metadata.sourceFromPort) {
        result.push(`Source Port: ${node.metadata.sourceFromPort}`);
      }
      if (node.metadata.destinationFromPort) {
        result.push(`Destination Port: ${node.metadata.destinationFromPort}`);
      }
    } else if (node.type === 'contract') {
      const consumers = this.getConsumers(node);
      const providers = this.getProviders(node);

      if (consumers && consumers.length > 0) {
        result.push(`Consumer: ${consumers.map(c => c.name).join(', ')}`);
      }

      if (providers && providers.length > 0) {
        result.push(`Provider: ${providers.map(p => p.name).join(', ')}`);
      }
    } else if (node.type === 'filter_entry') {
      if (node.metadata.ipProtocol) {
        result.push(`Protocol: ${node.metadata.ipProtocol.toUpperCase()}`);
      }

      const srcPort = node.metadata.sourceFromPort || 'any';
      const dstPort = node.metadata.destinationFromPort || 'any';

      result.push(`Ports: ${srcPort} → ${dstPort}`);
    }

    return result;
  }

  resetForm(): void {
    this.connectivityForm.reset({
      generatedConfigIdentifier: 'connectivity-test-' + Date.now(),
      ipProtocol: 'tcp',
      bypassServiceGraph: true,
      generateConfig: false,
      applyConfig: false,
      bidirectional: false,
    });
    this.graph = null;
    this.error = null;
    this.expandedNodes.clear();
    this.activePathNodes.clear();
  }
}
