import { Subscription } from 'rxjs';

export namespace SubscriptionUtil {
  export function unsubscribe(subscriptions: Subscription[]): void {
    const canUnsubscribe = (sub: Subscription) => {
      return sub && sub.unsubscribe instanceof Function;
    };
    subscriptions.filter(canUnsubscribe).forEach(s => s.unsubscribe());
  }
}
