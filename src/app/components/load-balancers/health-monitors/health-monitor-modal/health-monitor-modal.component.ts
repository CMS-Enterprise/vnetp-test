import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HealthMonitorModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerHealthMonitor, V1LoadBalancerHealthMonitorsService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
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

    if (this.modalMode === ModalMode.Create) {
      healthMonitor.tierId = this.tierId;
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
    } else {
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

  private closeModal() {
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

  removeHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    const modalDto = new YesNoModalDto('Remove Health Monitor', '');
    const onConfirm = () => {
      this.healthMonitorService.v1LoadBalancerHealthMonitorsIdDelete({ id: healthMonitor.id }).subscribe(() => {
        this.getHealthMonitors();
      });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private getHealthMonitors() {
    this.healthMonitorService.v1LoadBalancerHealthMonitorsIdGet({ id: this.healthMonitor.id }).subscribe(data => {
      this.healthMonitor = data;
    });
  }

  getData() {
    const dto: HealthMonitorModalDto = Object.assign({}, this.ngx.getModalData('healthMonitorModal'));
    this.tierId = dto.tierId;
    this.modalMode = dto.healthMonitor ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      this.healthMonitorId = dto.healthMonitor.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    if (dto.healthMonitor !== undefined) {
      this.form.controls.name.setValue(dto.healthMonitor.name);
      this.form.controls.name.disable();
      this.form.controls.type.setValue(dto.healthMonitor.type);
      this.form.controls.type.disable();
      this.form.controls.servicePort.setValue(dto.healthMonitor.servicePort);
      this.form.controls.interval.setValue(dto.healthMonitor.interval);
      this.form.controls.timeout.setValue(dto.healthMonitor.timeout);
    }
    this.ngx.resetModalData('healthMonitorModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      type: ['', Validators.required],
      servicePort: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(65535)])],
      interval: ['', Validators.compose([Validators.required, Validators.min(5), Validators.max(300)])],
      timeout: ['', Validators.compose([Validators.required, Validators.min(5), Validators.max(300)])],
    });
  }

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
