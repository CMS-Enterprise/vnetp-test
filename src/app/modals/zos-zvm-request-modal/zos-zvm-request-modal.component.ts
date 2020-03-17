import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { V1ConfigurationUploadService, ConfigurationUploadType, ConfigurationUpload } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-zos-zvm-request-modal',
  templateUrl: './zos-zvm-request-modal.component.html',
  styleUrls: ['./zos-zvm-request-modal.component.css'],
})
export class ZosZvmRequestModalComponent implements OnInit {
  form: FormGroup;
  configurationType: ConfigurationUploadType;
  file: any;
  uploadType: string;
  uploadId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public configurationService: V1ConfigurationUploadService,
  ) {}

  save() {
    if (this.uploadType === 'request') {
      const configuration = {} as ConfigurationUpload;
      configuration.type = this.configurationType;
      configuration.file = this.form.get('file').value;
      this.configurationService
        .v1ConfigurationUploadPost({
          configurationUpload: configuration,
        })
        .subscribe(data => this.closeModal());
    } else if (this.uploadType === 'configuration' && this.uploadId) {
      this.configure();
    }
    this.ngx.resetModalData('requestModal');
    this.file = null;
  }

  configure() {
    const configuration = this.form.get('file').value;
    this.configurationService
      .v1ConfigurationUploadIdConfigurePatch({
        id: this.uploadId,
        configurationDto: { configuration },
      })
      .subscribe(data => this.closeModal());
  }

  importFile(event: any) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({
          file: reader.result,
        });
      };
    }
  }

  private closeModal() {
    this.ngx.close('requestModal');
    this.reset();
  }

  getData() {
    const configurationDto = this.ngx.getModalData('requestModal');
    this.configurationType = configurationDto.type;
    this.uploadType = configurationDto.uploadType;
    this.uploadId = configurationDto.id;
    this.ngx.resetModalData('requestModal');
  }

  public buildForm() {
    this.form = this.formBuilder.group({
      file: ['', Validators.required],
    });
  }

  cancel() {
    this.ngx.close('requestModal');
    this.reset();
  }

  public reset() {
    this.file = null;
    this.uploadId = null;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
