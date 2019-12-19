import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HealthMonitorModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerHealthMonitor } from 'api_client';
import { HealthMonitor } from 'src/app/models/loadbalancer/health-monitor';

@Component({
  selector: 'app-health-monitor-modal',
  templateUrl: './health-monitor-modal.component.html',
})
export class HealthMonitorModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: HealthMonitorModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const healthMonitor = {} as LoadBalancerHealthMonitor;
    healthMonitor.name = this.form.value.name;
    healthMonitor.type = this.form.value.type;
    healthMonitor.servicePort = this.form.value.servicePort;
    healthMonitor.interval = this.form.value.interval;
    healthMonitor.timeout = this.form.value.timeout;

    this.ngx.resetModalData('healthMonitorModal');
    this.ngx.setModalData(
      Object.assign({}, healthMonitor),
      'healthMonitorModal',
    );
    this.ngx.close('healthMonitorModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('healthMonitorModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const healthMonitor = Object.assign(
      {},
      this.ngx.getModalData('healthMonitorModal') as LoadBalancerHealthMonitor,
    );
    if (healthMonitor !== undefined) {
      this.form.controls.name.setValue(healthMonitor.name);
      this.form.controls.type.setValue(healthMonitor.type);
      this.form.controls.servicePort.setValue(healthMonitor.servicePort);
      this.form.controls.interval.setValue(healthMonitor.interval);
      this.form.controls.timeout.setValue(healthMonitor.timeout);
    }
    this.ngx.resetModalData('healthMonitorModal');
  }

  // TODO: Confirm min/max on interval and timeout.
  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      servicePort: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(65535),
        ]),
      ],
      interval: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(5),
          Validators.max(300),
        ]),
      ],
      timeout: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(5),
          Validators.max(300),
        ]),
      ],
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
