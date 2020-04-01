import { Component, OnInit } from '@angular/core';
import { V1VtsService } from 'api_client';
import { Papa } from 'ngx-papaparse';
import { LineChartDataDto, ChartData, ReplicationTableDataDto } from '../../../../models/wizard/replication-charts-dto';

@Component({
  selector: 'app-replication-state-panel',
  templateUrl: './replication-state-panel.component.html',
  styleUrls: ['./replication-state-panel.component.css'],
})
export class ReplicationStatePanelComponent implements OnInit {
  // TO DO: add loading state?
  currentReplicationPage = 1;
  pieChartData: ChartData[];
  lineChartData: LineChartDataDto[];
  formattedReplicationData: ReplicationTableDataDto[];

  // options
  pieView: any[] = [700, 300];
  pieShowLegend = true;
  pieShowLabels = true;
  pieLegendPosition = 'below';
  placeholderPie = [{ name: 'no data', value: 1 }];
  placeholderColor = { domain: ['#7f8084'] };

  pieColorScheme = {
    domain: ['#e84d4d', '#5ac4f9', '#ffdf5a'],
  };

  // line chart options
  view: any[] = [700, 275];
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Number Queued';
  yScaleMax = 5;
  colorScheme = {
    domain: ['#ffad00'],
  };

  constructor(private vtsService: V1VtsService, private papa: Papa) {}

  getScale() {
    const scale = [this.pieChartData[0].value, this.pieChartData[1].value, this.pieChartData[2].value];
    this.yScaleMax = Math.max(...scale) + 30;
  }

  countStatuses(status: string) {
    switch (status) {
      case 'error':
        this.pieChartData[0].value = this.pieChartData[0].value + 1;
        break;
      case 'write':
        this.pieChartData[1].value = this.pieChartData[1].value + 1;
        break;
      case 'queued':
        this.pieChartData[2].value = this.pieChartData[2].value + 1;
        break;
      default:
        throw new Error('Invalid Status Type');
    }
  }

  getReplicationQueueDepth() {
    this.vtsService.v1VtsReplicationQueueDepthPost().subscribe(data => {
      this.lineChartData = data;
      const options = {
        skipEmptyLines: true,
        header: true,
      };
      let parsedData = null;
      let papaParsedData = null;
      if (this.lineChartData) {
        parsedData = JSON.parse(JSON.stringify(this.lineChartData));
        papaParsedData = this.papa.parse(parsedData, options);
        this.lineChartData = [{ name: 'Replication Queue Depth', series: [] }];
        papaParsedData.data.map(item => {
          this.lineChartData[0].series.push({
            name: new Date(Number(item.Timestamp) * 1000),
            value: item['Queue Depth'],
          });
        });
        this.getScale();
      }
    });
  }

  getReplicationNotCompleted() {
    this.vtsService.v1VtsReplicationNotCompletedPost().subscribe(data => {
      const results = data;
      const options = {
        skipEmptyLines: true,
        header: true,
      };
      let parsedData = null;
      let papaParsedData = null;
      if (results) {
        parsedData = JSON.parse(JSON.stringify(results));
        papaParsedData = this.papa.parse(parsedData, options);
        this.pieChartData = [
          {
            name: 'error',
            value: 0,
          },
          {
            name: 'write',
            value: 0,
          },
          {
            name: 'queued',
            value: 0,
          },
        ];
        this.formattedReplicationData = [];
        papaParsedData.data.map(item => {
          const replicationData = item.Date.split(' ');
          this.formattedReplicationData.push({
            date: `${replicationData[0]} ${replicationData[1]}`,
            status: replicationData[2],
            volser: replicationData[3],
            storagePool: replicationData[4],
            cgx: replicationData[5],
          });
          this.countStatuses(replicationData[2]);
        });
      }
    });
  }

  ngOnInit() {
    this.getReplicationQueueDepth();
    this.getReplicationNotCompleted();
  }
}
