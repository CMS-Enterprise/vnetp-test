import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HealthMonitorModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerHealthMonitor,
  V1LoadBalancerHealthMonitorsService,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-health-monitor-modal',
  templateUrl: './health-monitor-modal.component.html',
})
export class HealthMonitorModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  ModalMode: ModalMode;
  HealthMonitor: LoadBalancerHealthMonitor;
  HealthMonitorId: string;

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

    if (this.ModalMode === ModalMode.Create) {
      healthMonitor.tierId = this.TierId;
      this.healthMonitorService
        .v1LoadBalancerHealthMonitorsPost({
          loadBalancerHealthMonitor: healthMonitor,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.healthMonitorService
        .v1LoadBalancerHealthMonitorsIdPut({
          id: this.HealthMonitorId,
          loadBalancerHealthMonitor: healthMonitor,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }

    this.closeModal();
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
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.healthMonitorService
            .v1LoadBalancerHealthMonitorsIdDelete({ id: healthMonitor.id })
            .subscribe(() => {
              this.getHealthMonitors();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private getHealthMonitors() {
    this.healthMonitorService
      .v1LoadBalancerHealthMonitorsIdGet({ id: this.HealthMonitor.id })
      .subscribe(data => {
        this.HealthMonitor = data;
      });
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('healthMonitorModal') as any,
    );

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.HealthMonitorId = dto.healthMonitor.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.type.enable();
      }
    }

    if (dto !== undefined) {
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

  public reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
