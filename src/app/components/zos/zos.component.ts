import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ConfigurationUploadType, V1ConfigurationUploadService, ConfigurationUpload } from 'api_client';
import { SubscriptionUtil } from 'src/app/utils/subscription.util';

@Component({
  selector: 'app-zos',
  templateUrl: './zos.component.html',
})
export class ZosComponent implements OnInit, OnDestroy {
  requestModalSubscription: Subscription;
  configurations: ConfigurationUpload[];

  currentConfigurationPage = 1;
  perPage = 20;

  constructor(private ngx: NgxSmartModalService, private configurationService: V1ConfigurationUploadService) {}

  getConfigurations() {
    this.configurationService
      .v1ConfigurationUploadGet({
        fields: 'id,requestedAt,configuredAt',
        filter: `type||eq||${ConfigurationUploadType.OS}`,
      })
      .subscribe(data => {
        this.configurations = data;
      });
  }

  getConfigurationFile(event: Event, id: string) {
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
    const configurationDto = {
      id,
      uploadType,
      type: ConfigurationUploadType.OS,
    };
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

  exportFile(requestFile: { type: string; data: number[] }) {
    const utf8decoder = new TextDecoder();
    const buff = new Uint8Array(requestFile.data);
    const blob = utf8decoder.decode(buff);

    const getDownloadName = () => {
      const isXlsm = blob.includes('application/vnd.ms-excel.sheet.macroenabled.12;base64');
      const isDocx = blob.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64');
      const date = new Date().toISOString().slice(0, 19);
      if (isXlsm) {
        return `${date}.xlsm`;
      }
      if (isDocx) {
        return `${date}.docx`;
      }
      return date;
    };

    const link = document.createElement('a');
    link.setAttribute('href', blob);
    link.setAttribute('download', getDownloadName());
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
