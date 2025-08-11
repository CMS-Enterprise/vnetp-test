/*
 *ngFor="let data of datum | sort:'prop'"
 */
import { Pipe, PipeTransform } from '@angular/core';

type SortProps<T extends object> = {
  [K in keyof T]: T[K] extends string | number ? K : never;
}[keyof T];

@Pipe({
  name: 'sort',
  pure: false,
  standalone: false,
})
export class SortPipe implements PipeTransform {
  transform<T extends object>(values: T[], prop: SortProps<T>): T[] {
    if (!values || !prop) {
      return values;
    }
    if (values.length <= 1) {
      return values;
    }
    const compareFn = this.getComparator(values, prop);
    return values.sort(compareFn);
  }

  private getComparator<T extends object>(values: T[], prop: SortProps<T>): (a, b) => number {
    if (typeof values[0][prop] === 'string') {
      return (a, b) => a[prop].localeCompare(b[prop]);
    }
    return (a, b) => a[prop] - b[prop];
  }
}
