import { of, Subscription } from 'rxjs';
import { YesNoModalDto } from '../models/other/yes-no-modal-dto';
import SubscriptionUtil from './SubscriptionUtil';

describe('SubscriptionUtil', () => {
  describe('unsubscribe', () => {
    it('should unsubscribe from subscriptions', () => {
      const sub1 = new Subscription();
      expect(sub1.closed).toBe(false);

      SubscriptionUtil.unsubscribe([sub1]);
      expect(sub1.closed).toBe(true);
    });

    it('should not throw an error when unsubscribing from null & undefined subscriptions', () => {
      const shouldNotThrow = () => {
        SubscriptionUtil.unsubscribe([null, undefined]);
      };

      expect(shouldNotThrow).not.toThrow();
    });

    it('should unsubscribe from all valid subscriptions', () => {
      const sub1 = new Subscription();
      const sub2 = new Subscription();
      const sub3 = new Subscription();
      const sub4 = new Subscription();

      SubscriptionUtil.unsubscribe([sub1, null, sub2, undefined, sub3, null, sub4]);
      expect(sub1.closed).toBe(true);
      expect(sub2.closed).toBe(true);
      expect(sub3.closed).toBe(true);
      expect(sub4.closed).toBe(true);
    });
  });

  describe('subscribeToYesNoModal', () => {
    const initNgx = (open = jest.fn(), confirmData = {}) =>
      ({
        setModalData: jest.fn(),
        getModal: jest.fn(() => ({
          open,
          onCloseFinished: of({
            getData: jest.fn(() => confirmData),
            removeData: jest.fn(),
          }),
        })),
      } as any);

    it('should open "yesNoModal"', () => {
      const openSpy = jest.fn();
      const ngx = initNgx(openSpy);
      const dto = new YesNoModalDto('Title', 'Body');

      SubscriptionUtil.subscribeToYesNoModal(dto, ngx, () => {});

      expect(ngx.getModal).toHaveBeenCalledWith('yesNoModal');
      expect(openSpy).toHaveBeenCalled();
    });

    it('should not call the confirm function when cancelled', () => {
      const open = jest.fn();
      const ngx = initNgx(open, null);
      const dto = new YesNoModalDto('Title', 'Body');
      const confirmFn = jest.fn();

      SubscriptionUtil.subscribeToYesNoModal(dto, ngx, confirmFn);

      expect(confirmFn).not.toHaveBeenCalled();
    });

    it('should run the confirm function when confirmed', () => {
      const open = jest.fn();
      const ngx = initNgx(open, { modalYes: true });
      const dto = new YesNoModalDto('Title', 'Body');
      const confirmFn = jest.fn();

      SubscriptionUtil.subscribeToYesNoModal(dto, ngx, confirmFn);

      expect(confirmFn).toHaveBeenCalled();
    });
  });
});
