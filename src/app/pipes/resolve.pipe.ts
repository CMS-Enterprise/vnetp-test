import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'resolve',
  pure: true,
  standalone: false,
})
export class ResolvePipe implements PipeTransform {
  transform<T, S>(item: T, callback: (item: T) => S): T | S {
    if (!item || !callback) {
      return item;
    }
    return callback(item);
  }
}
