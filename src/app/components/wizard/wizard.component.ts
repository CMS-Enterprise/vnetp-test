import { Component, OnInit, Input } from '@angular/core';
import { WizardSection } from 'src/app/models/wizard/wizard-data';
import { pieChartData, lineChartData, pieData } from './mockChartData';
import { V1VtsService } from 'api_client';
import { Papa } from 'ngx-papaparse';
import { wizardSections } from './wizardSections';
@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
  WizardSections = new Array<WizardSection>();
  WizardProgress = 50;
  pieChartData: any;
  lineChartData: any;

  replicationQueueDepth: any;
  replicationsNotCompleted: any;

  formattedQueueDepth: [];
  formattedReplicationData: any;

  // options
  pieView: any[] = [700, 300];
  pieShowLegend = true;
  pieShowLabels = true;
  legendPosition = 'below';

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
  timeline = false;
  yScaleMax = 10;
  colorScheme = {
    domain: ['#ffad00'],
  };

  constructor(private vtsService: V1VtsService, private papa: Papa) {}

  getProgressBarPercentage(statusProgress: number) {
    return `${statusProgress}%`;
  }

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
      this.replicationQueueDepth = data;
      const options = {
        skipEmptyLines: true,
        header: true,
      };
      let parsedData = null;
      let papaParsedData = null;
      if (this.replicationQueueDepth) {
        parsedData = JSON.parse(JSON.stringify(this.replicationQueueDepth));
        papaParsedData = this.papa.parse(parsedData, options);
        console.log(papaParsedData);
        this.replicationQueueDepth = [{ name: 'Replication Queue Depth', series: [] }];
        papaParsedData.data.map(item => {
          this.replicationQueueDepth[0].series.push({
            name: new Date(Number(item.Timestamp)),
            value: item['Queue Depth'],
          });
        });
        this.lineChartData = this.replicationQueueDepth;
      }
    });
  }

  getReplicationNotCompleted() {
    this.vtsService.v1VtsReplicationNotCompletedPost().subscribe(data => {
      this.replicationsNotCompleted = data;
      const options = {
        skipEmptyLines: true,
        header: true,
      };
      let parsedData = null;
      let papaParsedData = null;
      if (this.replicationsNotCompleted) {
        parsedData = JSON.parse(JSON.stringify(this.replicationsNotCompleted));
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
            status: `${replicationData[2]}`,
            volser: `${replicationData[3]}`,
            storagePool: `${replicationData[4]}`,
            cgx: `${replicationData[5]}`,
          });
          this.countStatuses(replicationData[2]);
          this.getScale();
        });
      }
    });
  }

  ngOnInit() {
    this.getReplicationQueueDepth();
    this.getReplicationNotCompleted();

    // For all wizard sections remove [0]
    this.WizardSections = [wizardSections[0]];
  }
}
