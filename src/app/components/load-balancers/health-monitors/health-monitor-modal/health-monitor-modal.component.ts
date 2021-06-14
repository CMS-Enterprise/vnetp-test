import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HealthMonitorModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerHealthMonitor, LoadBalancerHealthMonitorTypeEnum, V1LoadBalancerHealthMonitorsService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { HealthMonitorModalDto } from './health-monitor-modal.dto';
import { RangeValidator } from 'src/app/validators/range-validator';

@Component({
  selector: 'app-health-monitor-modal',
  templateUrl: './health-monitor-modal.component.html',
})
export class HealthMonitorModalComponent implements OnInit {
  public form: FormGroup;
  public submitted: boolean;

  public healthMonitorTypes: LoadBalancerHealthMonitorTypeEnum[] = [
    LoadBalancerHealthMonitorTypeEnum.Http,
    LoadBalancerHealthMonitorTypeEnum.Https,
    LoadBalancerHealthMonitorTypeEnum.Tcp,
  ];

  private healthMonitorId: string;
  private modalMode: ModalMode;
  private tierId: string;

  constructor(
    private formBuilder: FormBuilder,
    private healthMonitorService: V1LoadBalancerHealthMonitorsService,
    private ngx: NgxSmartModalService,
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

    const { name, type, servicePort, interval, timeout } = this.form.getRawValue();

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
      const { id, interval, servicePort, type, name, timeout } = healthMonitor;
      this.healthMonitorId = id;

      this.form.controls.name.disable();
      this.form.controls.type.disable();

      this.form.controls.name.setValue(name);
      this.form.controls.type.setValue(type);
      this.form.controls.servicePort.setValue(servicePort);
      this.form.controls.interval.setValue(interval);
      this.form.controls.timeout.setValue(timeout);
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    this.ngx.resetModalData('healthMonitorModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      interval: ['', Validators.compose([Validators.required, RangeValidator(5, 300)])],
      name: ['', NameValidator()],
      servicePort: ['', Validators.compose([Validators.required, RangeValidator(1, 65535)])],
      timeout: ['', Validators.compose([Validators.required, RangeValidator(5, 300)])],
      type: ['', Validators.required],
    });
  }

  private createHealthMonitor(loadBalancerHealthMonitor: LoadBalancerHealthMonitor): void {
    this.healthMonitorService.createOneLoadBalancerHealthMonitor({ loadBalancerHealthMonitor }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateHealthMonitor(loadBalancerHealthMonitor: LoadBalancerHealthMonitor): void {
    loadBalancerHealthMonitor.tierId = null;
    this.healthMonitorService
      .updateOneLoadBalancerHealthMonitor({
        id: this.healthMonitorId,
        loadBalancerHealthMonitor,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }
}
