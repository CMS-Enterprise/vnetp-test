import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { V1ConfigurationUploadService, ConfigurationUploadType, ConfigurationUpload } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-zos-zvm-request-modal',
  templateUrl: './zos-zvm-request-modal.component.html',
})
export class ZosZvmRequestModalComponent implements OnInit {
  form: FormGroup;
  configurationType: ConfigurationUploadType;
  uploadType: string;
  uploadId: string;

  ConfigurationUploadType = ConfigurationUploadType;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private configurationService: V1ConfigurationUploadService,
  ) {}

  public closeModal() {
    this.ngx.close('requestModal');
    this.reset();
  }

  public getData(): void {
    const configurationDto = this.ngx.getModalData('requestModal');
    this.uploadId = configurationDto.id;
    this.configurationType = configurationDto.type;
    this.uploadType = configurationDto.uploadType;
    this.ngx.resetModalData('requestModal');
  }

  public importFile(event: any): void {
    const hasFileToUpload = event.target.files && event.target.files.length;
    if (!hasFileToUpload) {
      return;
    }
    const [file] = event.target.files;
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({
        file: reader.result,
      });
    };
    reader.readAsDataURL(file);
  }

  public reset(): void {
    this.uploadId = null;
    this.buildForm();
  }

  public save(): void {
    if (this.uploadType === 'request') {
      this.createRequest();
    } else if (this.uploadType === 'configuration' && this.uploadId) {
      this.updateConfiguration();
    }
    this.ngx.resetModalData('requestModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      file: ['', Validators.required],
    });
  }

  private createRequest(): void {
    const configurationUpload = {
      type: this.configurationType,
      file: this.form.get('file').value,
    } as ConfigurationUpload;

    this.configurationService.v1ConfigurationUploadPost({ configurationUpload }).subscribe(data => this.closeModal());
  }

  private updateConfiguration(): void {
    const configuration = this.form.get('file').value;
    this.configurationService
      .v1ConfigurationUploadIdConfigurePatch({
        id: this.uploadId,
        configurationDto: { configuration },
      })
      .subscribe(data => this.closeModal());
  }

  ngOnInit() {
    this.buildForm();
  }
}
