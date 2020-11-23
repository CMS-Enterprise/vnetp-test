import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActifioPolicyDto, ActifioTemplateDto, V1ActifioGmTemplatesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

const availableTimes = Array(24)
  .fill('')
  .map((value: string, index: number) => {
    const hour = `${index}`.padStart(2, '0');
    return hour + ':00';
  });

@Component({
  selector: 'app-template-modal',
  templateUrl: './template-modal.component.html',
})
export class TemplateModalComponent implements OnInit {
  public form: FormGroup;
  public isNewTemplate = true;
  public modalTitle: string;
  public policies: ActifioPolicyDto[] = [];
  public submitted = false;
  public times = [...availableTimes];

  private template: ActifioTemplateDto;

  constructor(
    private agmTemplateService: V1ActifioGmTemplatesService,
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  get f() {
    return this.form.controls;
  }

  public saveTemplate(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    const { name, description, endTime, startTime } = this.form.value;
    if (this.isNewTemplate) {
      this.createTemplate(name, description, endTime, startTime);
    } else {
      this.updateTemplate(name, description, endTime, startTime);
    }
  }

  public onLoad(): void {
    const template = this.ngx.getModalData('templateModal') || {};
    const { id = '', name = '', description = '' } = template;
    this.isNewTemplate = !name;
    this.modalTitle = this.isNewTemplate ? 'Edit SLA Template' : 'Create SLA Template';

    if (this.isNewTemplate) {
      this.form.enable();
      this.form.setValue({
        name: '',
        description: '',
        endTime: availableTimes[availableTimes.length - 1],
        startTime: availableTimes[0],
      });
    } else {
      this.form.setValue({
        name,
        description,
        endTime: null,
        startTime: null,
      });
      this.template = template;
      this.form.controls.name.disable();
      this.loadSnapshotPolicy(id);
    }
  }

  public onCancelOrClose(): void {
    this.form.reset();
    this.ngx.resetModalData('templateModal');
    this.ngx.close('templateModal');
    this.submitted = false;
    this.template = undefined;
    this.policies = [];
    this.isNewTemplate = true;
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: '',
      startTime: [availableTimes[0], Validators.required],
      endTime: [availableTimes[availableTimes.length - 1], Validators.required],
    });
  }

  private createTemplate(name: string, description: string, endTime: string, startTime: string): void {
    this.agmTemplateService
      .v1ActifioGmTemplatesPost({
        actifioAddTemplateDto: {
          name,
          description,
          policies: [
            {
              startTime: this.convertTimeToSeconds(startTime),
              endTime: this.convertTimeToSeconds(endTime),
              isWindowed: true,
              isSnapshot: true,
            },
          ],
        },
      })
      .subscribe(() => {
        this.onCancelOrClose();
        this.toastrService.success('Template Created');
      });
  }

  private loadSnapshotPolicy(templateId: string): void {
    this.agmTemplateService
      .v1ActifioGmTemplatesIdPolicyGet({ id: templateId, isSnapshot: true, limit: 1, offset: 0 })
      .subscribe((policies: ActifioPolicyDto[]) => {
        this.policies = policies;
        if (policies.length === 0) {
          return;
        }
        const snapshotPolicy = policies[0];
        const { startTime, endTime } = snapshotPolicy;
        this.f.startTime.setValue(this.convertSecondsToTime(startTime));
        this.f.endTime.setValue(this.convertSecondsToTime(endTime));
      });
  }

  private updateTemplate(name: string, description: string, endTime: string, startTime: string): void {
    const { id } = this.template;

    const template$ = this.agmTemplateService.v1ActifioGmTemplatesIdPut({
      id,
      actifioUpdateTemplateDto: {
        id,
        name,
        description,
      },
    });

    if (this.policies.length === 0) {
      return;
    }
    const snapshotPolicy = this.policies[0];
    const policyId = snapshotPolicy.id;

    const snapshotPolicy$ = this.agmTemplateService.v1ActifioGmTemplatesIdPolicyPolicyIdPut({
      id,
      policyId,
      actifioUpdateTemplatePolicyDto: {
        id: policyId,
        endTime: this.convertTimeToSeconds(endTime),
        startTime: this.convertTimeToSeconds(startTime),
      },
    });

    forkJoin([template$, snapshotPolicy$]).subscribe(() => {
      this.onCancelOrClose();
      this.toastrService.success('Template Updated');
    });
  }

  private convertTimeToSeconds(time: string): number {
    const [hour, minute] = time.split(':');
    const hoursInSeconds = +hour * 60 * 60;
    const minutesInSeconds = +minute * 60;
    return hoursInSeconds + minutesInSeconds;
  }

  private convertSecondsToTime(seconds = 0): string {
    const hour = `${seconds / 3600}`.padStart(2, '0');
    return hour + ':00';
  }
}
