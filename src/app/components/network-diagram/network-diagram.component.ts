import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import { color } from 'd3';
import { Router } from '@angular/router';
import { ObjectService } from 'src/app/services/object.service';
import { Graph } from 'src/app/models/other/graph';

@Component({
  selector: 'app-network-diagram',
  templateUrl: './network-diagram.component.html',
  styleUrls: ['./network-diagram.component.css']
})
export class NetworkDiagramComponent implements OnInit, AfterContentInit {
  title = 'network-diagram';
  @ViewChild('graphContainer') graphContainer: ElementRef;

  width = 960;
  height = 800;
  colors = d3.scaleOrdinal(d3.schemeCategory10);

  svg: any;
  forceDiagram: any;

  constructor(private router: Router, private objectService: ObjectService) {}

  ngOnInit(): void {}

  ngAfterContentInit() {
    this.createGraph();
  }

  createGraph() {
    const rect = this.graphContainer.nativeElement.getBoundingClientRect();
    this.width = rect.width;

    // Create SVG
    this.svg = d3
      .select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('width', this.width)
      .attr('height', this.height);

    // Create Force Diaagram
    this.forceDiagram = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id((d: any) => d.id)
          .distance(200)
          .strength(1)
      )
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength(-200)
          .distanceMax(500)
          .distanceMin(50)
      )
      .force(
        'y',
        d3
          .forceY((d: any) => {
            // Support up to 6 hierarchy levels.
            if (d.group === '5') {
              return (5 * this.height) / 6;
            } else if (d.group === '4') {
              return (4 * this.height) / 6;
            } else if (d.group === '3') {
              return (3 * this.height) / 6;
            } else if (d.group === '2') {
              return (2 * this.height) / 6;
            } else if (d.group === '1') {
              return (1 * this.height) / 6;
            } else {
              return (0 * this.height) / 6;
            }
          })
          .strength(2)
      )
      .force('x', d3.forceX(this.width / 2))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(100));

    this.addGraphData();
  }

  addGraphData() {

    // Clear any current SVG elements.
    d3.selectAll('svg > *').remove();

    // Draw Links
    const link = this.svg
      .append('g')
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .attr('stroke', '#778899')
      .attr('stroke-width', 1.5);

      // Draw Nodes
    const node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('a')
      .data(this.graph.nodes)
      .enter()
      .append('a')
      .attr('target', '_blank')
      .attr('xlink:href', (d: any) => {
        return window.location.href + '?device=' + d.id;
      });

    // Handle Click Event, disable default D3 actions.
    node.on('click', d => {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      this.OnNodeClick(d.id);
    });

    // Drag Event Handlers
    node.call(d3.drag()
          .on('start', d => { this.dragstarted(d); })
          .on('drag', d => {this.dragged(d); })
          .on('end', d => {this.dragended(d); }));

    // Add Image to Node
    node
      .append('image')
      .attr('xlink:href', (d) => {
        return 'assets/img/group' + d.group + '.png';
      })
      .attr('width', 32)
      .attr('height', 32)
      .attr('x', -16)
      .attr('y', -16)
      .attr('fill', (d: any) => {
        return color(d.group);
      });

    // Add Text to Node
    node
      .append('text')
      .style('text-anchor', 'end')
      .attr('dx', -20)
      .attr('dy', '.35em')
      .text((d: any) => {
        return d.id;
      });

    node.append('title').text((d: any) => {
      return d.id;
    });

    this.forceDiagram.nodes(this.graph.nodes).on('tick', ticked);

    this.forceDiagram.force('link').links(this.graph.links);

    function ticked() {
      link
        .attr('x1', (d: any) => {
          return d.source.x;
        })
        .attr('y1', (d: any) => {
          return d.source.y;
        })
        .attr('x2', (d: any) => {
          return d.target.x;
        })
        .attr('y2', (d: any) => {
          return d.target.y;
        });

      node.attr('transform', (d: any) => {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    }
  }

  dragstarted(d) {
    if (!d3.event.active) { this.forceDiagram.alphaTarget(0.3).restart(); }
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d) {
    if (!d3.event.active) { this.forceDiagram.alphaTarget(0); }
    d.fx = null;
    d.fy = null;
  }

  OnNodeClick(id) {
    console.log(`Clicked node ${id}`);
    // this.router.navigate([`/networks/edit/${id}`]);
  }

  OnTestClick() {
    const obj = { name: 'Parent', childArray: [{name: 'Child1'}, {name: 'Child2'}]};

    const result = new Graph(obj);

    this.graph = result as any;
    this.createGraph();
  }

  // Sample Data
  // tslint:disable-next-line: member-ordering
  graph = {
    links: [
      {
        source: 'DRaaS Customer',
        target: 'Presentation',
      },
      {
        source: 'DRaaS Customer',
        target: 'Application'
      },
      {
        source: 'DRaaS Customer',
        target: 'Database'
      },
      {
        source: 'Presentation',
        target: 'WebServers1',
      },
      {
        source: 'Presentation',
        target: 'WebServers2',
      },
      {
        source: 'Application',
        target: 'AppServers1',
      },
      {
        source: 'Database',
        target: 'DbServers1'
      }
    ],
    nodes: [
      {
        group: '1',
        id: 'DRaaS Customer'
      },
      {
        group: '2',
        id: 'Presentation'
      },
      {
        group: '2',
        id: 'Application'
      },
      {
        group: '2',
        id: 'Database'
      },
      {
        group: '3',
        id: 'WebServers1'
      },
      {
        group: '3',
        id: 'WebServers2'
      },
      {
        group: '3',
        id: 'AppServers1'
      },
      {
        group: '3',
        id: 'DbServers1'
      }
    ]
  };
}
