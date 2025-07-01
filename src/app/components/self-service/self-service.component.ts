import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Datacenter } from 'client';
import { V1SelfServiceService } from 'client/api/v1SelfService.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
@Component({
  selector: 'app-self-service',
  templateUrl: './self-service.component.html',
})
export class SelfServiceComponent implements OnInit, OnDestroy {
  private selfServiceModalSubscription: Subscription;
  private selfServiceArtifactReviewModalSubscription: Subscription;
  private selfServiceBulkUploadModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;

  public loadingSelfServices: boolean;
  public openingModal = false;
  public selfServices;
  selectedSelfService;

  @ViewChild('mappedObjects') mappedObjectsTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Managed Network',
    columns: [
      { name: 'Id', property: 'id' },
      { name: 'Raw Config File Name', property: 'rawConfigFileName' },
      { name: 'Mapped Objects', template: () => this.mappedObjectsTemplate },
      { name: 'Device Type', property: 'deviceType' },
      { name: 'DCS Tier', property: 'dcsTier' },
      { name: 'Conversion Status', property: 'conversionStatus' },
      { name: 'Bulk Upload Status', property: 'bulkUploadStatus' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private datacenterContextService: DatacenterContextService,
    private selfServiceService: V1SelfServiceService,
    private ngx: NgxSmartModalService,
  ) {}

  public getSelfServices() {
    this.loadingSelfServices = true;
    this.selfServiceService.getSelfServicesSelfService({ datacenterId: `${this.currentDatacenter.id}` }).subscribe(
      data => {
        this.selfServices = data;
        this.selfServices.data.map(ss => {
          // split the conversion and bulk upload status on capital letters for readability
          ss.conversionStatus = ss.conversionStatus?.split(/(?=[A-Z])/).join(' ');
          ss.bulkUploadStatus = ss.bulkUploadStatus?.split(/(?=[A-Z])/).join(' ');
        });
      },
      () => {
        this.selfServices = null;
        this.loadingSelfServices = false;
      },
      () => {
        this.loadingSelfServices = false;
      },
    );
  }

  public importObjects(selfService) {
    this.openingModal = true;
    this.selfServiceService.getSelfServiceSelfService({ selfServiceId: selfService.id }).subscribe(response => {
      this.selectedSelfService = response;
      this.openingModal = false;
      const modalDto = new YesNoModalDto('Import', 'Are you sure you would like to bulk import the converted objects?');
      const onConfirm = () => {
        // eslint-disable-next-line
        this.selfServiceService.bulkUploadSelfService({ selfService: this.selectedSelfService }).subscribe(data => {
          this.getSelfServices();
          return data;
        }),
          () => {},
          () => {
            this.getSelfServices();
          };
      };
      const onClose = () => {
        this.getSelfServices();
      };

      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
    });
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
    this.openingModal = true;
    this.subscribeToSelfServiceArtifactReviewModal();
    this.selfServiceService.getSelfServiceSelfService({ selfServiceId: selfService.id }).subscribe(data => {
      this.selectedSelfService = data;
      this.openingModal = false;
      this.ngx.getModal('selfServiceArtifactReviewModal').open();
    });
  }

  public subscribeToBulkUploadModal() {
    this.selfServiceBulkUploadModalSubscription = this.ngx.getModal('selfServiceBulkUploadModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('selfServiceBulkUploadModal');
      this.selfServiceBulkUploadModalSubscription.unsubscribe();
      this.getSelfServices();
    });
  }

  public async deleteSelfService(selfService) {
    this.selfServiceService.getSelfServiceSelfService({ selfServiceId: selfService.id }).subscribe(data => {
      this.selectedSelfService = data;
      const dto = new YesNoModalDto('Delete Self Service', `Error(s): "${this.selectedSelfService.convertedConfig.artifact.error}"`);
      const onConfirm = () => {
        this.selfServiceService.deleteSelfServiceSelfService({ selfServiceId: selfService.id }).subscribe(() => {
          this.getSelfServices();
        });
      };

      const onClose = () => {
        this.getSelfServices();
      };
      SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm, onClose);
    });
  }

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getSelfServices();
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([
      this.currentDatacenterSubscription,
      this.selfServiceModalSubscription,
      this.selfServiceBulkUploadModalSubscription,
      this.selfServiceArtifactReviewModalSubscription,
    ]);
  }
}
