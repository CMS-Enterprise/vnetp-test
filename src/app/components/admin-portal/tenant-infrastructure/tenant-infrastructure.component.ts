import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  V2AdminTenantOrchestratorService,
  TenantInfrastructureConfigDto,
  TenantInfrastructureValidationResponse,
  ExternalVrfConnectionExternalVrfEnum,
  TenantConnectivityGraph,
  TenantInfrastructureResponse,
} from 'client';
import * as yaml from 'js-yaml';
import * as d3 from 'd3';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-tenant-infrastructure',
  templateUrl: './tenant-infrastructure.component.html',
  styleUrls: ['./tenant-infrastructure.component.scss'],
})
export class TenantInfrastructureComponent implements OnInit, OnDestroy {
  graph: TenantConnectivityGraph | null = null;
  mode: 'create' | 'edit' = 'create';
  tenantId?: string;
  private sub?: Subscription;

  rawJson = '';
  parseError: string | null = null;
  parsedConfig: TenantInfrastructureConfigDto | null = null;
  config: TenantInfrastructureConfigDto;
  validation: TenantInfrastructureValidationResponse | null = null;
  saveResponse: TenantInfrastructureResponse | null = null;
  validationErrors: Map<string, string> = new Map(); // path -> error message
  isSubmitting = false;
  isLoadingConfig = false;
  hasValidated = false;
  activeTab: 'tenant' | 'firewalls' | 'vrfs' = 'tenant';
  selectedFirewallIdx = 0;
  selectedVrfIdx = 0;
  externalVrfOptions = Object.values(ExternalVrfConnectionExternalVrfEnum);
  previewFormat: 'json' | 'yaml' = 'json';
  rightPanelView: 'config' | 'graph' | 'response' = 'config';
  private graphUpdateSubject = new Subject<void>();
  private graphUpdateSubscription?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private orchestrator: V2AdminTenantOrchestratorService) {}

  ngOnInit(): void {
    // id comes from the parent route (admin portal child route: edit/:id)
    this.sub =
      this.route.parent?.paramMap.subscribe(params => {
        const id = params.get('id');
        this.tenantId = id || undefined;
        this.mode = id ? 'edit' : 'create';
      }) || undefined;

    // Seed example JSON/config
    if (this.mode === 'create') {
      this.config = {
        tenant: {
          name: 'tenant1',
          environmentId: '12345678-1234-1234-1234-123456789012',
          alias: 'Tenant 1',
          description: '',
        },
        externalFirewalls: [
          {
            name: 'fw1',
            firewallDeviceType: 'PaloAlto',
            vsysName: 'vsys1',
            bgpAsn: null,
            bgpAsnAutoGenerate: true,
            externalVrfConnections: [] as any[],
          },
        ],
        vrfs: [
          {
            name: 'default_vrf',
            alias: 'Default VRF',
            maxExternalRoutes: 150,
            bgpAsn: null,
            bgpAsnAutoGenerate: true,
            serviceGraphs: [
              {
                name: 'sg1',
                serviceGraphFirewall: {
                  name: 'sg1-fw',
                  firewallDeviceType: 'PaloAlto',
                  vsysName: 'vsys1',
                },
              },
            ] as any[],
            l3outs: [{ name: 'l3out1', l3outType: 'external', externalFirewall: 'fw1' }] as any[],
          },
        ],
      } as TenantInfrastructureConfigDto;
    } else if (this.mode === 'edit' && this.tenantId) {
      this.loadExistingConfig();
    }

    if (this.mode === 'create') {
      this.updateRawFromConfig();
    }

    let debounceTimeMs = 1000;

    if (this.mode === 'edit') {
      debounceTimeMs = 0;
      this.generateGraphInternal();
    }

    // Setup debounced graph updates
    this.graphUpdateSubscription = this.graphUpdateSubject.pipe(debounceTime(debounceTimeMs)).subscribe(() => {
      if (this.rightPanelView === 'graph') {
        this.generateGraphInternal();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.graphUpdateSubscription?.unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/adminportal/tenant-v2'], { queryParamsHandling: 'merge' });
  }

  onTextChange(): void {
    this.validation = null;
    try {
      let obj: any;
      if (this.previewFormat === 'json') {
        obj = JSON.parse(this.rawJson);
      } else {
        obj = yaml.load(this.rawJson);
      }
      this.parsedConfig = obj as TenantInfrastructureConfigDto;
      this.config = this.parsedConfig;
      // Ensure arrays exist
      this.config.externalFirewalls = this.config.externalFirewalls || [];
      this.config.vrfs = this.config.vrfs || [];
      this.parseError = null;
      // Clamp selections
      if (this.selectedFirewallIdx >= this.config.externalFirewalls.length) {
        this.selectedFirewallIdx = 0;
      }
      if (this.selectedVrfIdx >= this.config.vrfs.length) {
        this.selectedVrfIdx = 0;
      }
    } catch (e: any) {
      this.parsedConfig = null;
      this.parseError = e?.message || `Invalid ${this.previewFormat.toUpperCase()}`;
    }
  }

  validate(): void {
    this.isSubmitting = true;
    this.validation = null;
    this.validationErrors.clear();

    this.orchestrator.validateTenantInfrastructure({ tenantInfrastructureConfigDto: this.config }).subscribe({
      next: res => {
        this.validation = res as TenantInfrastructureValidationResponse;
        this.hasValidated = true;
        this.showConfig();
      },
      error: err => {
        console.log('Validation error response:', err);
        this.hasValidated = false;

        // Parse class-validator errors from API response
        if (err?.error?.detail?.message && Array.isArray(err.error.detail.message)) {
          err.error.detail.message.forEach((msg: string) => {
            this.parseValidationError(msg);
          });
        }

        // Also create a general validation response for the UI
        this.validation = {
          success: false,
          errors: err?.error?.detail?.message?.map((msg: string) => ({
            path: '$',
            message: msg,
          })) || [{ path: '$', message: err?.message || 'Request failed' }],
        } as TenantInfrastructureValidationResponse;
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  private parseValidationError(message: string): void {
    // Parse messages like "externalFirewalls.0.bgpAsn must be provided if bgpAsnAutoGenerate is not true"
    // Extract the path part before the first space
    const pathMatch = message.match(/^([a-zA-Z0-9.\[\]]+)/);
    if (pathMatch) {
      const path = pathMatch[1];
      this.validationErrors.set(path, message);
      console.log('Parsed validation error:', { path, message }); // Debug
    }
  }

  getFieldError(path: string): string | null {
    return this.validationErrors.get(path) || null;
  }

  hasFieldError(path: string): boolean {
    const hasError = this.validationErrors.has(path);
    if (hasError) {
      console.log('Field has error:', { path, message: this.validationErrors.get(path) }); // Debug
    }
    return hasError;
  }

  getGraph(): void {
    if (this.isSubmitting) {
      return;
    }
    this.rightPanelView = 'graph';
    this.graphUpdateSubject.next();
  }

  private generateGraphInternal(): void {
    if (this.mode === 'create') {
      this.orchestrator.buildTenantInfrastructureGraph({ tenantInfrastructureConfigDto: this.config }).subscribe({
        next: res => {
          this.graph = res as TenantConnectivityGraph;
          setTimeout(() => this.renderGraph(), 100);
        },
        error: err => {
          console.error(err);
        },
      });
    } else if (this.mode === 'edit') {
      this.orchestrator.getTenantInfrastructureGraph({ id: this.tenantId }).subscribe({
        next: res => {
          this.graph = res as TenantConnectivityGraph;
          console.log('Graph data:', this.graph);
          setTimeout(() => this.renderGraph(), 100);
        },
      });
    }
  }

  saveConfig(): void {
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.orchestrator.configureTenantInfrastructure({ tenantInfrastructureConfigDto: this.config }).subscribe({
      next: res => {
        console.log('Config saved:', res);
        this.saveResponse = res as TenantInfrastructureResponse;
        this.rightPanelView = 'response';
      },
      error: err => {
        this.validation = {
          success: false,
          errors: [
            {
              path: '$',
              message: err?.message || 'Request failed',
            } as any,
          ],
        } as TenantInfrastructureValidationResponse;
        this.showConfig();
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  showConfig(): void {
    this.rightPanelView = 'config';
  }

  showResponse(): void {
    this.rightPanelView = 'response';
  }

  loadExistingConfig(): void {
    if (!this.tenantId) {
      return;
    }

    this.isLoadingConfig = true;
    this.orchestrator.getTenantInfrastructureConfig({ id: this.tenantId }).subscribe({
      next: config => {
        this.config = config as TenantInfrastructureConfigDto;
        this.updateRawFromConfig();
        this.rightPanelView = 'graph';
        this.generateGraphInternal();
      },
      error: err => {
        console.error('Failed to load tenant config:', err);
        // Fallback to empty config
        this.config = {
          tenant: { name: '', environmentId: '', alias: '', description: '' },
          externalFirewalls: [],
          vrfs: [],
        } as TenantInfrastructureConfigDto;
        this.updateRawFromConfig();
      },
      complete: () => {
        this.isLoadingConfig = false;
      },
    });
  }

  private renderGraph(): void {
    if (!this.graph) {
      return;
    }

    const container = document.getElementById('graphContainer');
    if (!container) {
      return;
    }

    const svg = d3.select('#graphSvg');
    svg.selectAll('*').remove();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    svg.attr('viewBox', [0, 0, width, height]);

    // Transform backend graph to D3 format
    const nodes = Object.values(this.graph.nodes).map(graphNode => ({
      id: graphNode.id,
      name: graphNode.name,
      type: graphNode.type,
    }));

    const links = Object.values(this.graph.edges)
      .filter(edge => {
        // Hide tenant contains firewall edges to reduce clutter
        if (edge.type === 'TENANT_CONTAINS_FIREWALL' && edge.targetNodeId.includes('external-firewall:')) {
          return false;
        }
        return true;
      })
      .map(edge => ({
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        type: edge.type,
        metadata: edge.metadata,
      }));

    console.log('Filtered links for rendering:', links); // Debug: check what links are being rendered

    // Hierarchy levels (define early)
    const levels = {
      TENANT: 1,
      VRF: 2,
      SERVICE_GRAPH: 3,
      L3OUT: 3,
      SERVICE_GRAPH_FIREWALL: 4,
      EXTERNAL_FIREWALL: 4,
      EXTERNAL_VRF_CONNECTION: 5,
      EXTERNAL_VRF: 6,
    };

    // Horizontal clustering: group nodes by their parent relationships
    const nodesByLevel = new Map<number, any[]>();
    const parentMap = new Map<string, string>(); // child -> parent
    const childrenMap = new Map<string, string[]>(); // parent -> children[]

    // Build parent-child relationships
    links.forEach(edge => {
      if (edge.type === 'TENANT_CONTAINS_VRF' || edge.type === 'VRF_TO_L3OUT' || edge.type === 'VRF_TO_SERVICE_GRAPH') {
        parentMap.set(edge.target, edge.source);
        if (!childrenMap.has(edge.source)) {
          childrenMap.set(edge.source, []);
        }
        const children = childrenMap.get(edge.source);
        if (children) {
          children.push(edge.target);
        }
      }
    });

    // Group nodes by level and assign cluster positions
    nodes.forEach(graphNode => {
      const level = levels[graphNode.type as keyof typeof levels] || 3;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      const levelArray = nodesByLevel.get(level);
      if (levelArray) {
        levelArray.push(graphNode);
      }
    });

    // Calculate cluster centers for each level
    const clusterCenters = new Map<string, number>(); // nodeId -> x position
    const clusterWidth = width * 0.7; // Use 70% of width for clustering
    const clusterStart = width * 0.15; // Start at 15% from left

    nodesByLevel.forEach((levelNodes, level) => {
      if (level === 1) {
        // Tenant: center
        levelNodes.forEach(tenantNode => clusterCenters.set(tenantNode.id, width / 2));
      } else {
        // Group by parent
        const groups = new Map<string, any[]>();
        levelNodes.forEach(levelNode => {
          const parent = parentMap.get(levelNode.id) || 'orphan';
          if (!groups.has(parent)) {
            groups.set(parent, []);
          }
          const group = groups.get(parent);
          if (group) {
            group.push(levelNode);
          }
        });

        const groupKeys = Array.from(groups.keys());
        if (groupKeys.length === 1) {
          // Single group: center it
          const groupNodes = groups.get(groupKeys[0]);
          if (!groupNodes) {
            return;
          }
          const parentX = clusterCenters.get(groupKeys[0]) || width / 2;
          groupNodes.forEach((groupNode, nodeIdx) => {
            const offset = groupNodes.length > 1 ? (nodeIdx - (groupNodes.length - 1) / 2) * 40 : 0;
            clusterCenters.set(groupNode.id, parentX + offset);
          });
        } else {
          // Multiple groups: distribute evenly
          groupKeys.forEach((parentId, groupIdx) => {
            const groupNodes = groups.get(parentId);
            if (!groupNodes) {
              return;
            }
            const baseX = clusterStart + (groupIdx / Math.max(1, groupKeys.length - 1)) * clusterWidth;

            groupNodes.forEach((groupNode, nodeIdx) => {
              const offset = groupNodes.length > 1 ? (nodeIdx - (groupNodes.length - 1) / 2) * 35 : 0;
              clusterCenters.set(groupNode.id, baseX + offset);
            });
          });
        }
      }
    });

    // Apply cluster positions to nodes
    nodes.forEach(clusterNode => {
      (clusterNode as any).clusterX = clusterCenters.get(clusterNode.id) || width / 2;
    });

    // Color mapping by type
    const colorByType = {
      TENANT: '#007bff',
      VRF: '#28a745',
      SERVICE_GRAPH: '#ffc107',
      SG_FIREWALL: '#dc3545',
      L3OUT: '#6f42c1',
      EXTERNAL_FIREWALL: '#e83e8c',
      EXTERNAL_VRF: '#6c757d',
    };

    const levelLabels = {
      1: 'Tenant',
      2: 'VRF',
      3: 'Service Graph / L3Out',
      4: 'SG Firewall / External Firewall',
      5: 'External VRF Connection',
      6: 'External VRF',
    };
    const marginTop = 40;
    const marginBottom = 30;
    const laneCount = 6;
    const innerH = Math.max(0, height - marginTop - marginBottom);
    const laneH = innerH / laneCount;
    const yForLevel = (lvl: number) => marginTop + (lvl - 0.5) * laneH;
    const yForType = (type: string) => yForLevel(levels[type as keyof typeof levels] || 3);

    const zoomGroup = svg.append('g');
    svg.call(
      d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.25, 2])
        .on('zoom', event => {
          zoomGroup.attr('transform', event.transform);
        }),
    );

    // Lane guides and labels
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
      guides
        .append('text')
        .attr('x', 10)
        .attr('y', y - 6)
        .attr('font-size', 10)
        .attr('fill', '#6c757d')
        .text(`${levelLabels[i as keyof typeof levelLabels] || ''}`);
    }

    // Links
    const link = zoomGroup
      .append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('stroke-width', 1.5)
      .attr('stroke', (d: any) => {
        if (d.type === 'INTERVRF_CONNECTION') {
          return '#ff6b35';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '#ff6b35';
        }
        return '#adb5bd';
      })
      .attr('stroke-opacity', 0.8)
      .attr('stroke-dasharray', (d: any) => {
        if (d.type === 'TENANT_CONTAINS_VRF') {
          return '5,5';
        }
        if (d.type === 'TENANT_CONTAINS_FIREWALL') {
          return '5,5';
        }
        if (d.type === 'INTERVRF_CONNECTION') {
          return '3,3';
        }
        if (d.type === 'L3OUT_TO_FIREWALL' && d.metadata?.l3outType === 'intervrf') {
          return '3,3';
        }
        return 'none';
      });

    // Nodes
    const node = zoomGroup
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(
        d3
          .drag<SVGGElement, any>()
          .on('start', (event, d: any) => {
            if (!event.active) {
              simulation.alphaTarget(0.3).restart();
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
              simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
          }),
      );

    node
      .append('circle')
      .attr('r', 8)
      .attr('fill', (d: any) => colorByType[d.type as keyof typeof colorByType] || '#6c757d')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Label halo
    node
      .append('text')
      .text((d: any) => d.name)
      .attr('x', 10)
      .attr('y', 3)
      .attr('font-size', 11)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('paint-order', 'stroke')
      .attr('fill', 'none');

    node
      .append('text')
      .text((d: any) => d.name)
      .attr('x', 10)
      .attr('y', 3)
      .attr('font-size', 11)
      .attr('fill', '#212529');

    // Simulation with clustering
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3
          .forceLink(links as any)
          .id((d: any) => d.id)
          .distance(80)
          .strength(0.6),
      )
      .force('layerY', d3.forceY((d: any) => yForType(d.type)).strength(2.5))
      .force('clusterX', d3.forceX((d: any) => d.clusterX).strength(0.3))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('collide', d3.forceCollide((d: any) => 20 + Math.min(80, (d.name?.length || 6) * 2.5)).iterations(3));

    simulation.on('tick', () => {
      // Clamp to lanes
      nodes.forEach((n: any) => {
        n.y = yForType(n.type);
        n.x = Math.max(20, Math.min(width - 20, n.x));
      });

      link.attr('d', (d: any) => {
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

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 160}, 20)`)
      .attr('pointer-events', 'none');

    legend
      .append('rect')
      .attr('width', 150)
      .attr('height', 195)
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
      { type: 'TENANT', color: '#007bff', label: 'Tenant' },
      { type: 'VRF', color: '#28a745', label: 'VRF' },
      { type: 'L3OUT', color: '#6f42c1', label: 'L3Out' },
      { type: 'EXTERNAL_FIREWALL', color: '#e83e8c', label: 'External Firewall' },
      { type: 'SERVICE_GRAPH', color: '#ffc107', label: 'Service Graph' },
      { type: 'SERVICE_GRAPH_FIREWALL', color: '#dc3545', label: 'Service Graph Firewall' },
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

    legend
      .append('line')
      .attr('x1', 15)
      .attr('x2', 35)
      .attr('y1', 30 + legendItems.length * 18 + 25)
      .attr('y2', 30 + legendItems.length * 18 + 25)
      .attr('stroke', '#adb5bd')
      .attr('stroke-width', 1.5);
    legend
      .append('text')
      .attr('x', 40)
      .attr('y', 30 + legendItems.length * 18 + 28)
      .attr('font-size', 10)
      .attr('fill', '#212529')
      .text('Connection');

    legend
      .append('line')
      .attr('x1', 15)
      .attr('x2', 35)
      .attr('y1', 30 + legendItems.length * 18 + 40)
      .attr('y2', 30 + legendItems.length * 18 + 40)
      .attr('stroke', '#adb5bd')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,5');
    legend
      .append('text')
      .attr('x', 40)
      .attr('y', 30 + legendItems.length * 18 + 43)
      .attr('font-size', 10)
      .attr('fill', '#212529')
      .text('Contains');

    legend
      .append('line')
      .attr('x1', 15)
      .attr('x2', 35)
      .attr('y1', 30 + legendItems.length * 18 + 55)
      .attr('y2', 30 + legendItems.length * 18 + 55)
      .attr('stroke', '#ff6b35')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');
    legend
      .append('text')
      .attr('x', 40)
      .attr('y', 30 + legendItems.length * 18 + 58)
      .attr('font-size', 10)
      .attr('fill', '#212529')
      .text('Inter-VRF');
  }

  // UI helpers
  onConfigMutated(): void {
    this.validation = null;
    this.hasValidated = false;
    this.validationErrors.clear(); // Clear field-level errors on changes
    this.updateRawFromConfig();
    if (this.rightPanelView === 'graph') {
      this.graphUpdateSubject.next();
    }
  }

  // Error indicator helpers
  get tenantTabHasErrors(): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith('tenant.'));
  }

  get firewallsTabHasErrors(): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith('externalFirewalls.'));
  }

  get vrfsTabHasErrors(): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith('vrfs.'));
  }

  hasFirewallErrors(index: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`externalFirewalls.${index}.`));
  }

  hasVrfErrors(index: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`vrfs.${index}.`));
  }

  hasServiceGraphErrors(vrfIndex: number, sgIndex: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`vrfs.${vrfIndex}.serviceGraphs.${sgIndex}.`));
  }

  hasL3OutErrors(vrfIndex: number, l3Index: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path => path.startsWith(`vrfs.${vrfIndex}.l3outs.${l3Index}.`));
  }

  hasExternalVrfConnectionErrors(firewallIndex: number, connIndex: number): boolean {
    return Array.from(this.validationErrors.keys()).some(path =>
      path.startsWith(`externalFirewalls.${firewallIndex}.externalVrfConnections.${connIndex}.`),
    );
  }

  private updateRawFromConfig(): void {
    try {
      if (this.previewFormat === 'json') {
        this.rawJson = JSON.stringify(this.config, null, 2);
      } else {
        this.rawJson = yaml.dump(this.config, { noRefs: true, indent: 2 });
      }
      this.parseError = null;
    } catch (e: any) {
      this.parseError = e?.message || `Unable to convert to ${this.previewFormat.toUpperCase()}`;
    }
  }

  onFormatChange(): void {
    this.updateRawFromConfig();
  }

  copyToClipboard(): void {
    navigator.clipboard
      ?.writeText(this.rawJson)
      .then(() => {
        // Could add a toast notification here
        console.log('Configuration copied to clipboard');
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = this.rawJson;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        console.log('Configuration copied to clipboard (fallback)');
      });
  }

  setActiveTab(tab: 'tenant' | 'firewalls' | 'vrfs'): void {
    this.activeTab = tab;
  }

  // Firewalls
  addFirewall(): void {
    this.config.externalFirewalls.push({
      name: 'new-firewall',
      firewallDeviceType: 'PaloAlto',
      vsysName: '',
      bgpAsn: null,
      bgpAsnAutoGenerate: true,
      externalVrfConnections: [] as any[],
    } as any);
    this.selectedFirewallIdx = this.config.externalFirewalls.length - 1;
    this.onConfigMutated();
  }
  removeFirewall(i: number): void {
    this.config.externalFirewalls.splice(i, 1);
    if (this.selectedFirewallIdx >= this.config.externalFirewalls.length) {
      this.selectedFirewallIdx = 0;
    }
    this.onConfigMutated();
  }
  addExternalVrfConnection(fwIdx: number): void {
    const fw = this.config.externalFirewalls[fwIdx] as any;
    fw.externalVrfConnections.push({
      name: 'connection',
      externalVrf: '',
      injectDefaultRouteFromExternalVrf: false,
      allowAllRoutesFromExternalVrf: false,
      advertiseHostBasedRoutesToExternalVrf: false,
      advertiseAllRoutesToExternalVrf: false,
    });
    this.onConfigMutated();
  }
  removeExternalVrfConnection(fwIdx: number, i: number): void {
    const fw = this.config.externalFirewalls[fwIdx] as any;
    fw.externalVrfConnections.splice(i, 1);
    this.onConfigMutated();
  }

  // VRFs
  addVrf(): void {
    this.config.vrfs.push({
      name: 'new-vrf',
      alias: '',
      maxExternalRoutes: 0,
      bgpAsn: null,
      bgpAsnAutoGenerate: true,
      serviceGraphs: [] as any[],
      l3outs: [] as any[],
    } as any);
    this.selectedVrfIdx = this.config.vrfs.length - 1;
    this.onConfigMutated();
  }
  removeVrf(i: number): void {
    this.config.vrfs.splice(i, 1);
    if (this.selectedVrfIdx >= this.config.vrfs.length) {
      this.selectedVrfIdx = 0;
    }
    this.onConfigMutated();
  }
  addServiceGraph(vrfIdx: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.serviceGraphs.push({
      name: 'new-sg',
      serviceGraphFirewall: { name: 'new-sg-fw', firewallDeviceType: 'PaloAlto', vsysName: '' },
    });
    this.onConfigMutated();
  }
  removeServiceGraph(vrfIdx: number, i: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.serviceGraphs.splice(i, 1);
    this.onConfigMutated();
  }
  addL3Out(vrfIdx: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.l3outs.push({ name: 'new-l3out', l3outType: 'external', externalFirewall: '' });
    this.onConfigMutated();
  }
  removeL3Out(vrfIdx: number, i: number): void {
    const vrf = this.config.vrfs[vrfIdx] as any;
    vrf.l3outs.splice(i, 1);
    this.onConfigMutated();
  }

  trackByIdx(_i: number): any {
    return _i;
  }
}
