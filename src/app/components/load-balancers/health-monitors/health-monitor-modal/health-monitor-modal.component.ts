import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HealthMonitorModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerHealthMonitor, V1LoadBalancerHealthMonitorsService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { HealthMonitorModalDto } from './health-monitor-modal.dto';

@Component({
  selector: 'app-health-monitor-modal',
  templateUrl: './health-monitor-modal.component.html',
})
export class HealthMonitorModalComponent implements OnInit {
  public form: FormGroup;
  public submitted: boolean;

  private healthMonitor: LoadBalancerHealthMonitor;
  private healthMonitorId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private healthMonitorService: V1LoadBalancerHealthMonitorsService,
    public helpText: HealthMonitorModalHelpText,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('healthMonitorModal');
    this.submitted = false;
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, type, servicePort, interval, timeout } = this.form.value;

    const healthMonitor: LoadBalancerHealthMonitor = {
      tierId: this.tierId,
      interval,
      name,
      servicePort,
      timeout,
      type,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createHealthMonitor(healthMonitor);
    } else {
      this.updateHealthMonitor(healthMonitor);
    }
  }

  public getData(): void {
    const dto: HealthMonitorModalDto = Object.assign({}, this.ngx.getModalData('healthMonitorModal'));
    const { healthMonitor, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = healthMonitor ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      this.healthMonitorId = healthMonitor.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    if (healthMonitor !== undefined) {
      this.form.controls.name.setValue(healthMonitor.name);
      this.form.controls.name.disable();
      this.form.controls.type.setValue(healthMonitor.type);
      this.form.controls.type.disable();
      this.form.controls.servicePort.setValue(healthMonitor.servicePort);
      this.form.controls.interval.setValue(healthMonitor.interval);
      this.form.controls.timeout.setValue(healthMonitor.timeout);
    }
    this.ngx.resetModalData('healthMonitorModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      type: ['', Validators.required],
      servicePort: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(65535)])],
      interval: ['', Validators.compose([Validators.required, Validators.min(5), Validators.max(300)])],
      timeout: ['', Validators.compose([Validators.required, Validators.min(5), Validators.max(300)])],
    });
  }

  private createHealthMonitor(healthMonitor: LoadBalancerHealthMonitor): void {
    this.healthMonitorService
      .v1LoadBalancerHealthMonitorsPost({
        loadBalancerHealthMonitor: healthMonitor,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  private updateHealthMonitor(healthMonitor: LoadBalancerHealthMonitor): void {
    healthMonitor.tierId = undefined;
    this.healthMonitorService
      .v1LoadBalancerHealthMonitorsIdPut({
        id: this.healthMonitorId,
        loadBalancerHealthMonitor: healthMonitor,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }
}
