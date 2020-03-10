import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { V1ConfigurationUploadService, ConfigurationUpload, ConfigurationUploadType } from 'api_client';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-zvm',
  templateUrl: './zvm.component.html',
  styleUrls: ['./zvm.component.css'],
})
export class ZvmComponent implements OnInit, OnDestroy {
  requestModalSubscription: Subscription;
  configurations: ConfigurationUpload[];

  constructor(
    private ngx: NgxSmartModalService,
    private configurationService: V1ConfigurationUploadService,
    private sanitizer: DomSanitizer,
  ) {}

  getConfigurations() {
    this.configurationService
      .v1ConfigurationUploadGet({
        filter: `type||eq||${ConfigurationUploadType.VM}`,
      })
      .subscribe(data => {
        this.configurations = data;
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
    const reader = new FileReader();
    reader.readAsText(requestFile);
    reader.onload = () => {
      const exportObject = reader.result.toString();
      console.log(exportObject);
    };

    // console.log(exportJson);
    // return this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(exportJson));
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
