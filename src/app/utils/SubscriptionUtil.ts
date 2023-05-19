import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { YesNoModalDto } from '../models/other/yes-no-modal-dto';

export default class SubscriptionUtil {
  static unsubscribe(subscriptions: Subscription[]): void {
    const canUnsubscribe = (sub: Subscription) => sub && sub.unsubscribe instanceof Function;
    subscriptions.filter(canUnsubscribe).forEach(s => s.unsubscribe());
  }

  static subscribeToYesNoModal(dto: YesNoModalDto, ngx: NgxSmartModalService, confirmFn: () => void, closeFn = () => {}): Subscription {
    const modalId = 'yesNoModal';

    ngx.setModalData(dto, modalId);
    ngx.getModal(modalId).open();

    const yesNoModalSubscription = ngx.getModal(modalId).onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        confirmFn();
      }
      closeFn();
      yesNoModalSubscription.unsubscribe();
    });

    return yesNoModalSubscription;
  }
}
