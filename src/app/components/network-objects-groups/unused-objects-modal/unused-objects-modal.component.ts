import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1NetworkSecurityNetworkObjectGroupsService, V1NetworkSecurityNetworkObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-unused-objects-modal',
  templateUrl: './unused-objects-modal.component.html',
})
export class UnusedObjectsModalComponent implements OnInit {
  @Input() unusedObjectsInput;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public config = {
    description: 'Unused Network Objects/Groups',
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
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
  ) {}

  restoreNetworkObject(networkObject) {
    if (networkObject.deletedAt) {
      this.networkObjectService.restoreOneNetworkObject({ id: networkObject.id }).subscribe(() => {});
    }
  }

  softDeleteNetworkObject(objToDelete) {
    if (objToDelete.type === 'Network Object') {
      const modalDto = new YesNoModalDto('Soft Delete', `Are you sure you would like to soft delete this network object?`);
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
    } else {
      const modalDto = new YesNoModalDto('Soft Delete', `Are you sure you would like to soft delete this network object group?`);
      const onConfirm = () => {
        this.networkObjectGroupService.softDeleteOneNetworkObjectGroup({ id: objToDelete.id }).subscribe(data => {
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

  onClose() {
    console.log('closing!!!');
  }

  ngOnInit(): void {
    console.log('initialized');
  }
}
