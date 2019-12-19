import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'resolve',
  pure: false,
})
export class ResolvePipe implements PipeTransform {
  transform(item: any, callback: (item: any) => boolean): any {
    if (!item || !callback) {
      return item;
    }
    return callback(item);
  }
}
