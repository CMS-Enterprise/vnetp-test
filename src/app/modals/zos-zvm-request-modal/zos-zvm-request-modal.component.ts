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
      configuration.file = this.file;
      this.configurationService
        .v1ConfigurationUploadPost({
          configurationUpload: configuration,
        })
        .subscribe(data => this.closeModal());
    } else if (this.uploadType === 'configuration' && this.uploadId) {
      console.log('cf');
      this.configure(this.uploadId);
    }
  }

  configure(id) {
    this.configurationService
      .v1ConfigurationUploadIdConfigurePut({
        id,
        configurationDto: { configuration: null },
      })
      .subscribe(data => this.closeModal());
  }

  importFile(event: any) {
    const files = event.target.files;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      this.file = reader.result;
      this.file = ('\\x' + this.file ? this.file.toString('hex') : '') as any;
    };
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

  private buildForm() {
    this.form = this.formBuilder.group({
      file: ['', Validators.required],
    });
  }

  cancel() {
    this.ngx.close('requestModal');
    this.reset();
  }

  public reset() {
    // this.unsubAll();
    // this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
