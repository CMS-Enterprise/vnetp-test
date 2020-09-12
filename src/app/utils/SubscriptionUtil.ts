import { Subscription } from 'rxjs';
export default class SubscriptionUtil {
  static unsubscribe(subscriptions: Subscription[]): void {
    const canUnsubscribe = (sub: Subscription) => {
      return sub && sub.unsubscribe instanceof Function;
    };
    subscriptions.filter(canUnsubscribe).forEach(s => s.unsubscribe());
  }
}
