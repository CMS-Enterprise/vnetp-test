import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActifioTemplateDto, V1AgmTemplatesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';

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
  public modalTitle: string;
  public submitted = false;
  public template: ActifioTemplateDto;
  public times = [...availableTimes];

  private isNewTemplate = true;

  constructor(
    private agmTemplateService: V1AgmTemplatesService,
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
    }
  }

  public onLoad(): void {
    this.initForm();
    this.template = this.ngx.getModalData('templateModal') || {};
    this.isNewTemplate = !this.template.name;
    this.modalTitle = this.isNewTemplate ? 'Edit SLA Template' : 'Create SLA Template';
  }

  public onCancelOrClose(): void {
    this.form.reset();
    this.template = undefined;
    this.ngx.resetModalData('templateModal');
    this.ngx.close('templateModal');
    this.submitted = false;
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
      .v1AgmTemplatesPost({
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

  private convertTimeToSeconds(time: string): number {
    const [hour, minute] = time.split(':');
    const hoursInSeconds = +hour * 60 * 60;
    const minutesInSeconds = +minute * 60;
    return hoursInSeconds + minutesInSeconds;
  }
}
