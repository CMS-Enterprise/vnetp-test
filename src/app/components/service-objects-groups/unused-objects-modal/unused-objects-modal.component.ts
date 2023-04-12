import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-unused-objects-modal',
  templateUrl: './unused-objects-modal.component.html',
})
export class UnusedObjectsModalComponent {
  @Input() unusedObjectsInput;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public config = {
    description: 'Unused Service Objects/Groups',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'Type',
        property: 'type',
      },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private ngx: NgxSmartModalService,
    private serviceObjectsService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
  ) {}

  public softDeleteServiceObject(objToDelete) {
    if (objToDelete.type === 'Service Object') {
      const modalDto = new YesNoModalDto('Soft Delete', `Are you sure you would like to soft delete this network object?`);
      const onConfirm = () => {
        this.serviceObjectsService.softDeleteOneServiceObject({ id: objToDelete.id }).subscribe(data => {
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
    } else {
      const modalDto = new YesNoModalDto('Soft Delete', `Are you sure you would like to soft delete this network object group?`);
      const onConfirm = () => {
        this.serviceObjectGroupService.softDeleteOneServiceObjectGroup({ id: objToDelete.id }).subscribe(data => {
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
}
