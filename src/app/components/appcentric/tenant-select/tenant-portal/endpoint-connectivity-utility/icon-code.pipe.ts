import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iconCode',
})
export class IconCodePipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'building':
        return '\uf1ad';
      case 'object-group':
        return '\uf247';
      case 'layer-group':
        return '\uf5fd';
      case 'desktop':
        return '\uf108';
      case 'file-contract':
        return '\uf56c';
      case 'book':
        return '\uf02d';
      case 'filter':
        return '\uf0b0';
      case 'list':
        return '\uf03a';
      default:
        return '\uf111'; // circle
    }
  }
}
