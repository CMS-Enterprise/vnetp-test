import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ConfigurationUploadType, V1ConfigurationUploadService, ConfigurationUpload } from 'api_client';

@Component({
  selector: 'app-zos',
  templateUrl: './zos.component.html',
  styleUrls: ['./zos.component.css'],
})
export class ZosComponent implements OnInit, OnDestroy {
  requestModalSubscription: Subscription;
  configurations: ConfigurationUpload[];

  constructor(private ngx: NgxSmartModalService, private configurationService: V1ConfigurationUploadService) {}

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
