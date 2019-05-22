import { Component, OnInit} from '@angular/core';
import { NgxSmartModalService} from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HealthMonitor } from 'src/app/models/loadbalancer/health-monitor';

@Component({
  selector: 'app-health-monitor-modal',
  templateUrl: './health-monitor-modal.component.html',
  styleUrls: ['./health-monitor-modal.component.css']
})
export class HealthMonitorModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const healthMonitor = new HealthMonitor();
    healthMonitor.Name = this.form.value.name;
    healthMonitor.Type = this.form.value.type;
    healthMonitor.ServicePort = this.form.value.servicePort;
    healthMonitor.Interval = this.form.value.interval;
    healthMonitor.Timeout = this.form.value.timeout;

    this.ngx.resetModalData('healthMonitorModal');
    this.ngx.setModalData(Object.assign({}, healthMonitor), 'healthMonitorModal');
    this.ngx.close('healthMonitorModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('healthMonitorModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  getData() {
    const healthMonitor =  Object.assign({}, this.ngx.getModalData('healthMonitorModal') as HealthMonitor);
    if (healthMonitor !== undefined) {
      this.form.controls.name.setValue(healthMonitor.Name);
      this.form.controls.type.setValue(healthMonitor.Type);
      this.form.controls.servicePort.setValue(healthMonitor.ServicePort);
      this.form.controls.interval.setValue(healthMonitor.Interval);
      this.form.controls.timeout.setValue(healthMonitor.Timeout);
      }
  }

  // TODO: Confirm min/max on interval and timeout.
  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      servicePort: ['', Validators.compose([Validators.required,  Validators.min(1), Validators.max(65535)])],
      interval: ['', Validators.compose([Validators.required,  Validators.min(5), Validators.max(300)]) ],
      timeout: ['', Validators.compose([Validators.required,  Validators.min(5), Validators.max(300)])]
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
