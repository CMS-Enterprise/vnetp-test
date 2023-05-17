import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { D3PieChartComponent } from './d3-pie-chart.component';

describe('D3PieChartComponent', () => {
  let component: D3PieChartComponent;
  let fixture: ComponentFixture<D3PieChartComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [D3PieChartComponent],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(D3PieChartComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should recalculate the center when width and height change', () => {
    component.height = 1000;
    component.width = 1000;
    component.ngOnChanges();

    expect(component.center).toBe('translate(500, 500)');
  });

  it('should map chart data', () => {
    component.data = [
      { value: 10, color: 'red' },
      { value: 5, color: 'yellow' },
    ];
    component.ngOnChanges();

    expect(component.chartdata.length).toBe(2);
  });
});
