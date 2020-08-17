import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HealthMonitorModalComponent } from './health-monitor-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1LoadBalancerHealthMonitorsService } from 'api_client';

describe('HealthMonitorModalComponent', () => {
  let component: HealthMonitorModalComponent;
  let fixture: ComponentFixture<HealthMonitorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [HealthMonitorModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerHealthMonitorsService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HealthMonitorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  it('type should be required', () => {
    const type = component.form.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it('service port should be required', () => {
    const servicePort = component.form.controls.servicePort;
    expect(servicePort.valid).toBeFalsy();
  });

  it('interval should be required', () => {
    const interval = component.form.controls.interval;
    expect(interval.valid).toBeFalsy();
  });

  it('timeout should be required', () => {
    const timeout = component.form.controls.timeout;
    expect(timeout.valid).toBeFalsy();
  });
});
