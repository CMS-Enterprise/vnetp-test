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
  private selfServiceArtifactReviewModalSubscription: Subscription;
  private selfServiceBulkUploadModalSubscription: Subscription;
  public loadingSelfServices: boolean;
  public selfServices;
  selectedSelfService;

  @ViewChild('mappedObjects') mappedObjectsTemplate: TemplateRef<any>;
  @ViewChild('deviceType') deviceTypeTemplate: TemplateRef<any>;
  @ViewChild('conversionStatus') conversionStatusTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Self Services',
    columns: [
      { name: 'Id', property: 'id' },
      { name: 'Mapped Objects', template: () => this.mappedObjectsTemplate },
      { name: 'Device Type', property: 'deviceType' },
      { name: 'Conversion Status', property: 'conversionStatus' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(private selfServiceService: V1SelfServiceService, private ngx: NgxSmartModalService) {}

  public getSelfServices() {
    this.loadingSelfServices = true;
    this.selfServiceService.getSelfServicesSelfService().subscribe(
      data => {
        this.selfServices = data;
        this.selfServices.data.map(ss => {
          // split the conversion status on capital letters for readability
          ss.conversionStatus = ss.conversionStatus.split(/(?=[A-Z])/).join(' ');
        });
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

  public subscribeToSelfServiceArtifactReviewModal() {
    this.selfServiceArtifactReviewModalSubscription = this.ngx.getModal('selfServiceArtifactReviewModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('selfServiceArtifactReviewModal');
      this.selfServiceArtifactReviewModalSubscription.unsubscribe();
      this.getSelfServices();
    });
  }

  public openSelfServiceArtifactReviewModal(selfService) {
    this.subscribeToSelfServiceArtifactReviewModal();
    this.selectedSelfService = selfService;
    this.ngx.getModal('selfServiceArtifactReviewModal').open();
  }

  public subscribeToBulkUploadModal() {
    this.selfServiceBulkUploadModalSubscription = this.ngx.getModal('selfServiceBulkUploadModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('selfServiceBulkUploadModal');
      this.selfServiceBulkUploadModalSubscription.unsubscribe();
      this.getSelfServices();
    });
  }
  public openBulkUploadModal(selfService) {
    this.subscribeToBulkUploadModal();
    this.selectedSelfService = selfService;
    this.ngx.getModal('selfServiceBulkUploadModal').open();
  }

  ngOnInit(): void {
    console.log('im initialized!');
    this.getSelfServices();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([
      this.selfServiceModalSubscription,
      this.selfServiceBulkUploadModalSubscription,
      this.selfServiceArtifactReviewModalSubscription,
    ]);
  }
}
