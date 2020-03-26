import { Component, OnInit } from '@angular/core';
import { pieChartData, lineChartData } from '../../mockChartData';

@Component({
  selector: 'app-replication-state-panel',
  templateUrl: './replication-state-panel.component.html',
  styleUrls: ['./replication-state-panel.component.css'],
})
export class ReplicationStatePanelComponent implements OnInit {
  pieChartData: any;
  lineChartData: any;

  // options
  pieView: any[] = [700, 300];
  pieShowLegend: boolean = true;
  pieShowLabels: boolean = true;
  pieLegendPosition: string = 'below';

  pieColorScheme = {
    domain: ['#e84d4d', '#5ac4f9', '#ffdf5a'],
  };

  // line chart options
  view: any[] = [700, 275];
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Number Queued';
  yScaleMax = 5;
  colorScheme = {
    domain: ['#ffad00'],
  };

  constructor() {}

  ngOnInit() {
    this.pieChartData = pieChartData;
    this.lineChartData = lineChartData;

    this.lineChartData.map(item => {
      item.series.map(d => {
        d.name = new Date(d.name * 1000);
      });
    });
  }
}
