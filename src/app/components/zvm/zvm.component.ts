import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V1ConfigurationUploadService, ConfigurationUpload, ConfigurationUploadTypeEnum } from 'client';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import DownloadUtil from 'src/app/utils/DownloadUtil';

@Component({
  selector: 'app-zvm',
  templateUrl: './zvm.component.html',
})
export class ZvmComponent implements OnInit, OnDestroy {
  public configurations: ConfigurationUpload[];
  public currentConfigurationPage = 1;
  public perPage = 20;

  private requestModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private configurationService: V1ConfigurationUploadService) {}

  getConfigurations() {
    this.configurationService
      .getManyConfigurationUpload({
        fields: ['id,requestedAt,configuredAt'],
        filter: [`type||eq||${ConfigurationUploadTypeEnum.Vm}`],
        page: this.currentConfigurationPage,
        limit: this.perPage,
      })
      .subscribe(response => {
        this.configurations = response.data;
      });
  }

  getConfigurationFile(event, id: string) {
    event.preventDefault();
    this.configurationService
      .getOneConfigurationUpload({
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
      type: ConfigurationUploadTypeEnum.Vm,
    };
    this.subscribeToRequestModal();
    this.ngx.setModalData(configurationDto, 'requestModal');
    this.ngx.getModal('requestModal').open();
  }

  subscribeToRequestModal() {
    this.requestModalSubscription = this.ngx.getModal('requestModal').onAnyCloseEvent.subscribe(() => {
      this.getConfigurations();
      this.ngx.resetModalData('requestModal');
    });
  }

  exportFile(requestFile: { type: string; data: number[] }): void {
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

    DownloadUtil.download(getDownloadName(), blob);
  }

  ngOnInit() {
    this.getConfigurations();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.requestModalSubscription]);
  }
}
