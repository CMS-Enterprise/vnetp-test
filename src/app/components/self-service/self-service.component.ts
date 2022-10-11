import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1SelfServiceService } from 'client/api/v1SelfService.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-self-service',
  templateUrl: './self-service.component.html',
})
export class SelfServiceComponent implements OnInit, OnDestroy {
  private selfServiceModalSubscription: Subscription;
  public loadingSelfServices: boolean;

  @ViewChild('mappedObjects') mappedObjectsTemplate: TemplateRef<any>;
  @ViewChild('convertedObjects') convertedObjectsTemplate: TemplateRef<any>;
  public config: TableConfig<any> = {
    description: 'Self Services',
    columns: [
      { name: 'Id', property: 'id' },
      { name: 'Mapped Objects', template: () => this.mappedObjectsTemplate },
      { name: 'Converted Objects', template: () => this.convertedObjectsTemplate },
    ],
  };

  public selfServices;

  constructor(private selfServiceService: V1SelfServiceService, private ngx: NgxSmartModalService) {}

  public getSelfServices() {
    this.loadingSelfServices = true;
    this.selfServiceService.getSelfServicesSelfService().subscribe(
      data => {
        this.selfServices = data;
      },
      () => {
        this.selfServices = null;
      },
      () => {
        this.loadingSelfServices = false;
      },
    );
  }

  public subscribeToSelfServiceModal() {
    this.selfServiceModalSubscription = this.ngx.getModal('selfServiceModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('selfServiceModal');
      this.selfServiceModalSubscription.unsubscribe();
      this.getSelfServices();
    });
  }

  public openSelfServiceModal() {
    this.subscribeToSelfServiceModal();
    this.ngx.getModal('selfServiceModal').open();
  }

  ngOnInit(): void {
    console.log('im initialized!');
    this.getSelfServices();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.selfServiceModalSubscription]);
  }
}
