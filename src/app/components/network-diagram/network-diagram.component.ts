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
    console.log(rect.width, rect.height);

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

    // node.call(d3.drag()
    //       .on('start', dragstarted)
    //       .on('drag', dragged)
    //       .on('end', dragended));

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
      .attr('font-size', '0.8em')
      .attr('dx', 12)
      .attr('dy', '.35em')
      .attr('x', +8)
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

  OnNodeClick(id) {
    console.log(`Clicked node ${id}`);
  }

  // Sample Data
  // tslint:disable-next-line: member-ordering
  graph = {
    links: [
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm5',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm6',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm6',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm3',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm4',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm4',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esxm8',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esxm8',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'usplnMSVPCLAB1001',
        value: '40'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'usplnAGVPCLAB1003',
        value: '40'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'usplnAGVPCLAB1004',
        value: '40'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esxm7',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esxm7',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'pln-ng1-esxm3',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esx4',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esx1',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esx3',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'ng1-esx2',
        value: '10'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'usplnACvpclab1001',
        value: '40'
      },
      {
        source: 'usplnACvpclab1002',
        target: 'usplnACvpclab1001',
        value: '40'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'usplnAGVPCLAB1003',
        value: '40'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'usplnAGVPCLAB1004',
        value: '40'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'usplnACvpclab1002',
        value: '40'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'usplnMSVPCLAB2001',
        value: '40'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'usplnACvpclab1002',
        value: '40'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm3',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm3',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'usplnMSVPCLAB1004',
        value: '1'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esx2',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esx4',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-devbox',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esxm8',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esxm8',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm4',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm4',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esxm7',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esxm7',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esx1',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm5',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'ng1-esx3',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm6',
        value: '10'
      },
      {
        source: 'usplnACvpclab1001',
        target: 'pln-ng1-esxm6',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'usplnAGVPCLAB1003',
        value: '40'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'ng1-esx12',
        value: '20'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'ng1-esx11',
        value: '20'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'AR21-U12-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'AR21-U12-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'AR21-U12-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB1',
        target: 'AR21-U12-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'usplnAGVPCLAB1004',
        value: '40'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'ng1-esx12',
        value: '20'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'ng1-esx11',
        value: '20'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'AR21-U12-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'AR21-U12-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'AR21-U12-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U12-ICB2',
        target: 'AR21-U12-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'AR21-U23-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'AR21-U23-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'AR21-U23-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'AR21-U23-ICB2',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'usplnAGVPCLAB1003',
        value: '40'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'ng1-esx13',
        value: '20'
      },
      {
        source: 'AR21-U23-ICB1',
        target: 'ng1-esx14',
        value: '20'
      },
      {
        source: 'AR21-U23-ICB2',
        target: 'AR21-U23-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB2',
        target: 'AR21-U23-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB2',
        target: 'AR21-U23-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB2',
        target: 'AR21-U23-ICB1',
        value: '10'
      },
      {
        source: 'AR21-U23-ICB2',
        target: 'usplnAGVPCLAB1004',
        value: '40'
      }
    ],
    nodes: [
      {
        group: '2',
        id: 'usplnACvpclab1002'
      },
      {
        group: '1',
        id: 'pln-ng1-esxm5'
      },
      {
        group: '1',
        id: 'pln-ng1-esxm6'
      },
      {
        group: '1',
        id: 'pln-ng1-esxm3'
      },
      {
        group: '1',
        id: 'pln-ng1-esxm4'
      },
      {
        group: '1',
        id: 'ng1-esxm8'
      },
      {
        group: '1',
        id: 'usplnMSVPCLAB1001'
      },
      {
        group: '3',
        id: 'usplnAGVPCLAB1003'
      },
      {
        group: '3',
        id: 'usplnAGVPCLAB1004'
      },
      {
        group: '1',
        id: 'ng1-esxm7'
      },
      {
        group: '1',
        id: 'ng1-esx4'
      },
      {
        group: '1',
        id: 'ng1-esx1'
      },
      {
        group: '1',
        id: 'ng1-esx3'
      },
      {
        group: '1',
        id: 'ng1-esx2'
      },
      {
        group: '2',
        id: 'usplnACvpclab1001'
      },
      {
        group: '1',
        id: 'usplnMSVPCLAB2001'
      },
      {
        group: '1',
        id: 'usplnMSVPCLAB1004'
      },
      {
        group: '1',
        id: 'ng1-devbox'
      },
      {
        group: '2',
        id: 'AR21-U12-ICB1'
      },
      {
        group: '1',
        id: 'ng1-esx12'
      },
      {
        group: '1',
        id: 'ng1-esx11'
      },
      {
        group: '2',
        id: 'AR21-U12-ICB2'
      },
      {
        group: '2',
        id: 'AR21-U23-ICB1'
      },
      {
        group: '2',
        id: 'AR21-U23-ICB2'
      },
      {
        group: '1',
        id: 'ng1-esx13'
      },
      {
        group: '1',
        id: 'ng1-esx14'
      }
    ]
  };
}
