import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HealthMonitorModalComponent } from './health-monitor-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerHealthMonitor, LoadBalancerHealthMonitorType, V1LoadBalancerHealthMonitorsService } from 'api_client';
import TestUtil from 'src/test/TestUtil';
import { HealthMonitorModalDto } from './health-monitor-modal.dto';

describe('HealthMonitorModalComponent', () => {
  let component: HealthMonitorModalComponent;
  let fixture: ComponentFixture<HealthMonitorModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [HealthMonitorModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerHealthMonitorsService)],
    });
    fixture = TestBed.createComponent(HealthMonitorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.form.controls.name)).toBe(true);
  });

  it('should require name, type, servicePort, interval, and timeout', () => {
    const requiredFields: (keyof LoadBalancerHealthMonitor)[] = ['name', 'type', 'servicePort', 'interval', 'timeout'];
    requiredFields.forEach(f => {
      const control = component.form.controls[f];
      control.setValue(null);
      control.updateValueAndValidity();

      expect(control.valid).toBe(false);
    });
  });

  it('should enable name and type when creating a new health monitor', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: HealthMonitorModalDto = {
        tierId: '1',
      };
      return dto;
    });

    expect(component.form.controls.name.enabled).toBe(true);
    expect(component.form.controls.type.enabled).toBe(true);
  });

  it('should disable name and type when editing an existing health monitor', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: HealthMonitorModalDto = {
        tierId: '1',
        healthMonitor: {
          id: '2',
          name: 'HealthMonitor2',
          type: LoadBalancerHealthMonitorType.HTTP,
          servicePort: 5,
          interval: 5,
          timeout: 5,
          tierId: '1',
        },
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.type.disabled).toBe(true);
    expect(component.form.controls.servicePort.disabled).toBe(false);
    expect(component.form.controls.interval.disabled).toBe(false);
    expect(component.form.controls.timeout.disabled).toBe(false);
  });

  it('should create a new health monitor', () => {
    const service = TestBed.inject(V1LoadBalancerHealthMonitorsService);
    const spy = jest.spyOn(service, 'v1LoadBalancerHealthMonitorsPost');
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: HealthMonitorModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();

    component.form.setValue({
      name: 'HealthMonitor1',
      type: LoadBalancerHealthMonitorType.HTTP,
      servicePort: 5,
      interval: 5,
      timeout: 5,
    });
    component.form.updateValueAndValidity();

    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerHealthMonitor: {
        tierId: '1',
        name: 'HealthMonitor1',
        type: LoadBalancerHealthMonitorType.HTTP,
        servicePort: 5,
        interval: 5,
        timeout: 5,
      },
    });
  });

  it('should update an existing health monitor', () => {
    const service = TestBed.inject(V1LoadBalancerHealthMonitorsService);
    const spy = jest.spyOn(service, 'v1LoadBalancerHealthMonitorsIdPut');
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: HealthMonitorModalDto = {
        tierId: '1',
        healthMonitor: {
          id: '2',
          name: 'HealthMonitor2',
          type: LoadBalancerHealthMonitorType.HTTP,
          servicePort: 5,
          interval: 5,
          timeout: 5,
          tierId: '1',
        },
      };
      return dto;
    });

    component.getData();

    component.form.setValue({
      name: 'HealthMonitor100',
      type: LoadBalancerHealthMonitorType.TCP,
      servicePort: 10,
      interval: 10,
      timeout: 10,
    });
    component.form.updateValueAndValidity();

    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerHealthMonitor: {
        tierId: null,
        name: 'HealthMonitor100',
        type: LoadBalancerHealthMonitorType.TCP,
        servicePort: 10,
        interval: 10,
        timeout: 10,
      },
    });
  });
});
