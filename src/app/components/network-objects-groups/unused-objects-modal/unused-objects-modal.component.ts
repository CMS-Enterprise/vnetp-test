import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { V1NetworkSecurityNetworkObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-unused-objects-modal',
  templateUrl: './unused-objects-modal.component.html',
  standalone: false,
})
export class UnusedObjectsModalComponent {
  @Input() unusedObjectsInput;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public config = {
    description: 'Unused Network Objects/Groups',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(private ngx: NgxSmartModalService, private networkObjectService: V1NetworkSecurityNetworkObjectsService) {}
  public softDeleteNetworkObject(objToDelete) {
    const modalDto = new YesNoModalDto('Soft Delete', 'Are you sure you would like to soft delete this network object?');
    const onConfirm = () => {
      this.networkObjectService.softDeleteOneNetworkObject({ id: objToDelete.id }).subscribe(data => {
        this.unusedObjectsInput.data = this.unusedObjectsInput.data.filter(obj => {
          if (obj.id !== objToDelete.id) {
            return obj;
          }
        });
        return data;
      });
    };

    const onClose = () => {};

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }
}
