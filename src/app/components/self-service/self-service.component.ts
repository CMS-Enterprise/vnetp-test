import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1SelfServiceService } from 'client/api/v1SelfService.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { EntityService } from 'src/app/services/entity.service';
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
    description: 'Managed Network',
    columns: [
      { name: 'Id', property: 'id' },
      { name: 'Mapped Objects', template: () => this.mappedObjectsTemplate },
      { name: 'Device Type', property: 'deviceType' },
      { name: 'DCS Tier', property: 'dcsTier' },
      { name: 'Conversion Status', property: 'conversionStatus' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(private entityService: EntityService, private selfServiceService: V1SelfServiceService, private ngx: NgxSmartModalService) {}

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

  public importObjects(selfService) {
    console.log('this.selfService', selfService);
    const modalDto = new YesNoModalDto('Import', `Are you sure you would like to bulk import the converted objects?`);
    const onConfirm = () => {
      this.selfServiceService.bulkUploadSelfService({ selfService: selfService }).subscribe(data => {
        console.log('data', data);
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

  public deleteSelfService(selfService) {
    console.log('selfService', selfService);
    const dto = new YesNoModalDto(
      `Delete Self Service`,
      `Error(s): "${selfService.convertedConfig.artifact.error}"`,
      // `${deleteDescription} ${entityName}`,
      // 'Cancel',
      // 'danger',
    );
    const onConfirm = () => {
      this.selfServiceService.deleteSelfServiceSelfService({ selfServiceId: selfService.id }).subscribe(() => {
        this.getSelfServices();
      });
    };

    const onClose = () => {
      this.getSelfServices();
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm, onClose);
  }
  // public openBulkUploadModal(selfService) {
  //   this.subscribeToBulkUploadModal();
  //   this.selectedSelfService = selfService;
  //   this.ngx.getModal('selfServiceBulkUploadModal').open();
  // }

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
