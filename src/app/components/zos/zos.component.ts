import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ConfigurationUploadType, V1ConfigurationUploadService, ConfigurationUpload } from 'api_client';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-zos',
  templateUrl: './zos.component.html',
  styleUrls: ['./zos.component.css'],
})
export class ZosComponent implements OnInit, OnDestroy {
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
        filter: `type||eq||${ConfigurationUploadType.OS}`,
      })
      .subscribe(data => {
        this.configurations = data;
      });
  }

  openRequestModal(uploadType: string, id: string) {
    const configurationDto = {} as any;
    configurationDto.type = ConfigurationUploadType.OS;
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
  }

  private unsubAll() {
    [this.requestModalSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    this.getConfigurations();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
