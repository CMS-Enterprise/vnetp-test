import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { color } from 'd3';

@Component({
  selector: 'app-network-diagram',
  templateUrl: './network-diagram.component.html',
  styleUrls: ['./network-diagram.component.css']
})
export class NetworkDiagramComponent implements OnInit {
  title = 'network-diagram';
  @ViewChild('graphContainer') graphContainer: ElementRef;

  width = 960;
  height = 800;
  colors = d3.scaleOrdinal(d3.schemeCategory10);

  svg: any;
  force: any;
  path: any;
  circle: any;
  drag: any;
  dragLine: any;

  // mouse event vars
  selectedNode = null;
  selectedLink = null;
  mousedownLink = null;
  mousedownNode = null;
  mouseupNode = null;

  lastNodeId = 2;
  // only respond once per keydown
  lastKeyDown = -1;

  ngOnInit(): void {}

  ngAfterContentInit() {
    const rect = this.graphContainer.nativeElement.getBoundingClientRect();
    this.width = rect.width;

    // Create SVG
    this.svg = d3
      .select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('width', this.width)
      .attr('height', this.height);

    this.force = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id((d: any) => d.id)
          .distance(100)
          .strength(0.001)
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
            if (d.group === '1') {
              return (5 * this.height) / 6;
            } else if (d.group === '2') {
              return (4 * this.height) / 6;
            } else if (d.group === '3') {
              return (3 * this.height) / 6;
            } else if (d.group === '4') {
              return (2 * this.height) / 6;
            } else if (d.group === '5') {
              return (1 * this.height) / 6;
            } else {
              return (0 * this.width) / 6;
            }
          })
          .strength(2)
      )
      .force('x', d3.forceX(this.width / 2))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(35));

    this.drawGraph();
  }

  drawGraph() {
    const link = this.svg
      .append('g')
      .selectAll('line')
      .data(this.graph.links)
      .enter()
      .append('line')
      .attr('stroke', function(d) {
        return color('gray');
      })
      .attr('stroke-width', function(d) {
        return Math.sqrt(3);
      });

    const node = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('a')
      .data(this.graph.nodes)
      .enter()
      .append('a')
      .attr('target', '_blank')
      .attr('xlink:href', function(d) {
        return window.location.href + '?device=' + d.id;
      });

    // Handle Click Event, disable default D3 actions.
    node.on('click', d => {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      this.OnNodeClick(d.id);
    });

    node.call(d3.drag()
          .on('start',d => { this.dragstarted(d)})
          .on('drag', d => {this.dragged(d)})
          .on('end', d => {this.dragended(d)}));

    node
      .append('image')
      .attr('xlink:href', function(d) {
        return 'assets/img/group' + d.group + '.png';
      })
      .attr('width', 32)
      .attr('height', 32)
      .attr('x', -16)
      .attr('y', -16)
      .attr('fill', function(d) {
        return color(d.group);
      });

    node
      .append('text')
      .style('text-anchor', 'end')
      .attr("dx", -20)
      .attr("dy", ".35em")
      .text(function(d) {
        return d.id;
      });

    node.append('title').text(function(d) {
      return d.id;
    });

    this.force.nodes(this.graph.nodes).on('tick', ticked);

    this.force.force('link').links(this.graph.links);

    function ticked() {
      link
        .attr('x1', function(d) {
          return d.source.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y2', function(d) {
          return d.target.y;
        });

      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });
    }
  }

  dragstarted(d) {
    if (!d3.event.active) this.force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  dragended(d) {
    if (!d3.event.active) this.force.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  OnNodeClick(id) {
    console.log(`Clicked node ${id}`);
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
        source: 'Presentation',
        target: 'WebServers1',
      }
    ],
    nodes: [
      {
        group: '3',
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
        group: '1',
        id: 'WebServers1'
      }
    ]
  };
}
