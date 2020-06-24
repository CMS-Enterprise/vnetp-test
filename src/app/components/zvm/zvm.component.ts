import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { V1ConfigurationUploadService, ConfigurationUpload, ConfigurationUploadType } from 'api_client';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { SubscriptionUtil } from 'src/app/utils/subscription.util';

@Component({
  selector: 'app-zvm',
  templateUrl: './zvm.component.html',
})
export class ZvmComponent implements OnInit, OnDestroy {
  requestModalSubscription: Subscription;
  configurations: ConfigurationUpload[];
  downloadHref: SafeUrl;
  downloadName: string;

  currentConfigurationPage = 1;
  perPage = 20;

  constructor(
    private ngx: NgxSmartModalService,
    private configurationService: V1ConfigurationUploadService,
    private sanitizer: DomSanitizer,
  ) {}

  getConfigurations() {
    this.configurationService
      .v1ConfigurationUploadGet({
        fields: 'id,requestedAt,configuredAt',
        filter: `type||eq||${ConfigurationUploadType.VM}`,
      })
      .subscribe(data => {
        this.configurations = data;
      });
  }

  getConfigurationFile(event, id: string) {
    event.preventDefault();
    this.configurationService
      .v1ConfigurationUploadIdGet({
        id,
      })
      .subscribe(data => {
        const requestFile: any = data.file;
        this.exportFile(requestFile);
      });
  }

  openRequestModal(uploadType: string, id: string) {
    const configurationDto = {} as any;
    configurationDto.type = ConfigurationUploadType.VM;
    configurationDto.uploadType = uploadType;
    configurationDto.id = id;
    this.subscribeToRequestModal();
    this.ngx.setModalData(configurationDto, 'requestModal');
    this.ngx.getModal('requestModal').open();
  }

  subscribeToRequestModal() {
    this.requestModalSubscription = this.ngx.getModal('requestModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      this.getConfigurations();
      this.ngx.resetModalData('requestModal');
    });
  }

  exportFile(requestFile) {
    const utf8decoder = new TextDecoder();
    const buff = new Uint8Array(requestFile.data);
    const blob = utf8decoder.decode(buff);
    const isXlsm = blob.includes('application/vnd.ms-excel.sheet.macroenabled.12;base64');
    const isDocx = blob.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64');
    const date = new Date().toISOString().slice(0, 19);
    if (isXlsm) {
      this.downloadName = `${date}.xlsm`;
    }
    if (isDocx) {
      this.downloadName = `${date}.docx`;
    }
    this.downloadHref = this.sanitizer.bypassSecurityTrustUrl(blob);
    const link = document.createElement('a');
    link.setAttribute('href', blob);
    link.setAttribute('download', this.downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([this.requestModalSubscription]);
  }

  ngOnInit() {
    this.getConfigurations();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
