export class ChartData {
  name: string | Date;
  value: number;
}

export class LineChartDataDto {
  name: string;
  series: ChartData[];
}

export class ReplicationTableDataDto {
  date: string;
  status: string;
  volser: string;
  storagePool: string;
  cgx: string;
}
