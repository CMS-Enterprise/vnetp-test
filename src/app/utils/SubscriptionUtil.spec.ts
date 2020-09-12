import { Subscription } from 'rxjs';
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
});
