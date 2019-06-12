import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, Input, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as svg from 'save-svg-as-png';
import { color } from 'd3';
import { Graph } from 'src/app/models/other/graph';

@Component({
  selector: 'app-d3-graph',
  templateUrl: './d3-graph.component.html',
  styleUrls: ['./d3-graph.component.css']
})
export class D3GraphComponent implements OnInit, AfterContentInit {
  title = 'network-diagram';
  @ViewChild('graphContainer') graphContainer: ElementRef;

  @Input() graphObject?: any;
  @Input() graph: Graph;
  @Input() disableAnimation?: boolean;
  @Input() width = 800;
  @Input() height = 800;
  @Input() ignoreArray = ['custom_fields'];
  @Input() nameArray = ['name', 'title'];

  @Output() rendered = new EventEmitter<any>();
  @Output() nodeClicked = new EventEmitter<any>();

  colors = d3.scaleOrdinal(d3.schemeCategory10);

  svg: any;
  forceDiagram: any;

  constructor() {}

  ngOnInit(): void {
    if (this.graphObject) {
      this.graph = new Graph(this.graphObject, this.ignoreArray, this.nameArray);
    } else if (!this.graph) {
      this.graph = new Graph({Name: 'No Data to Graph'}, [''], ['']);
    }
    // TODO: Handle disableAnimation
  }

  ngAfterContentInit() {
    this.createGraph();
  }

  createGraph() {
    const t0 = performance.now();

    const rect = this.graphContainer.nativeElement.getBoundingClientRect();
    this.width = rect.width;

    // Create SVG
    this.svg = d3
      .select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('width', this.width)
      .attr('height', this.height)
      .call(d3.zoom().on('zoom', () => {
        this.svg.attr('transform', d3.event.transform);
      }));

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
            if (d.group) {
              return (d.group * this.height) / 6;
            } else {
              console.error('Cannot place node on graph.', d);
              return 0;
            }
          })
          .strength(2)
      )
      .force('x', d3.forceX(this.width / 2))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(100));

    this.addGraphData();

    const t1 = performance.now();
    console.log(`Graph rendered in ${Math.round(t1 - t0) / 100}ms.`);
    this.rendered.emit(true);
  }

  resetTransform() {
    this.svg.attr('transform', null)
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
      this.OnNodeClick(d);
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
        return d.name;
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

  saveImage() {
    svg.saveSvgAsPng(document.getElementsByTagName('svg')[0], 'graph.png');
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

  OnNodeClick(node) {
    this.nodeClicked.emit(node);
  }
}
