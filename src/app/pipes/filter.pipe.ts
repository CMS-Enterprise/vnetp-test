import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false,
  standalone: false,
})
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[], callback: (item: T) => boolean): T[] {
    if (!items || !callback) {
      return items;
    }
    return items.filter(item => callback(item));
  }
}
