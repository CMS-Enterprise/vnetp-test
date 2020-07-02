import { Component, Input, OnChanges } from '@angular/core';
import { arc, pie, DefaultArcObject, PieArcDatum } from 'd3-shape';

export interface PieChartData {
  value: number;
  caption?: string;
  color?: string;
}

export interface InternalPieChartData extends PieChartData {
  path?: string;
  textPosition?: [number, number];
}

@Component({
  selector: 'app-d3-pie-chart',
  templateUrl: './d3-pie-chart.component.html',
})
export class D3PieChartComponent implements OnChanges {
  @Input() data: PieChartData[] = [];
  @Input() width = 350;
  @Input() height = 350;
  @Input() radius = Math.min(this.width, this.height) / 2;

  public chartdata!: (PieArcDatum<InternalPieChartData> & DefaultArcObject)[];
  public center: string;

  ngOnChanges(): void {
    this.center = `translate(${this.width / 2}, ${this.height / 2})`;

    const label = arc()
      .outerRadius(this.radius - 40)
      .innerRadius(this.radius - 40);

    const pieChartDataGenerator = pie<PieChartData>()
      .sort(null)
      .value((d: PieChartData) => d.value);

    const svgPathGenerator = arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);

    const x: PieArcDatum<InternalPieChartData>[] = pieChartDataGenerator(this.data);

    this.chartdata = x.map(element => {
      return {
        ...element,
        innerRadius: this.radius - 40,
        outerRadius: this.radius,
      };
    });

    this.chartdata.forEach(d => {
      d.data.path = svgPathGenerator(d);
      d.data.textPosition = label.centroid(d);
    });
  }
}
