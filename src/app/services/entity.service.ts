import { Injectable } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription, Observable } from 'rxjs';
import { YesNoModalDto } from '../models/other/yes-no-modal-dto';
import SubscriptionUtil from '../utils/SubscriptionUtil';

@Injectable({
  providedIn: 'root',
})
export class EntityService {
  constructor(private ngx: NgxSmartModalService) {}

  public deleteEntity(entity: Entity, config: DeleteEntityConfig): Subscription {
    const { deletedAt, name } = entity;
    const { entityName, delete$, softDelete$, onSuccess } = config;

    const deleteDescription = deletedAt ? 'Delete' : 'Soft-Delete';

    const onConfirm = () => {
      if (deletedAt) {
        delete$.subscribe(() => onSuccess());
      } else {
        softDelete$.subscribe(() => onSuccess());
      }
    };

    const dto = new YesNoModalDto(
      `${deleteDescription} ${entityName}`,
      `Do you want to ${deleteDescription.toLowerCase()} ${entityName.toLowerCase()} "${name}"?`,
      `${deleteDescription} ${entityName}`,
      'Cancel',
      'danger',
    );

    return SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm);
  }
}

export interface Entity {
  deletedAt?: object | string;
  provisionedAt?: object | string;
  name: string;
}

export interface DeleteEntityConfig {
  entityName: string;
  delete$: Observable<any>;
  softDelete$: Observable<any>;
  onSuccess: () => void;
}
