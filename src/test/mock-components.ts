/**
 * Creates a Component to use during tests
 * @param options Either a component or just the selector name
 */
import { Component, EventEmitter } from '@angular/core';

export function MockComponent(options: string | { selector: string; inputs?: string[]; outputs?: string[]; template?: string }) {
  const meta = typeof options === 'string' ? { selector: options } : options;

  @Component({
    selector: meta.selector,
    template: meta.template ?? '',
    standalone: false,
    inputs: meta.inputs ?? [],
  })
  class Mock {
    constructor() {
      for (const out of meta.outputs ?? []) {
        (this as any)[out] = new EventEmitter<any>();
      }
    }
  }

  return Mock;
}

export const MockFontAwesomeComponent = MockComponent({ selector: 'fa-icon', inputs: ['icon', 'size', 'spin'] });
export const MockTooltipComponent = MockComponent({ selector: 'tooltip', inputs: ['message'] });
export const MockImportExportComponent = MockComponent({
  selector: 'app-import-export',
  inputs: ['exportObject', 'exportFileName', 'disableJson', 'disableCsv', 'disableImport', 'disableExport'],
  outputs: ['import'],
});
export const MockNgxSmartModalComponent = MockComponent({
  selector: 'ngx-smart-modal',
  template: '<ng-content></ng-content>',
  inputs: ['identifier', 'customClass', 'dismissable', 'closable'],
  outputs: ['onClose', 'onOpen'],
});
export const MockIconButtonComponent = MockComponent({
  selector: 'app-icon-button',
  inputs: ['icon', 'label', 'type'],
  outputs: ['handleClick'],
});
export const MockTabsComponent = MockComponent({
  selector: 'app-tabs',
  inputs: ['tabs'],
  outputs: ['tabChange'],
});

export const MockViewFieldComponent = MockComponent({
  selector: 'app-view-field',
  inputs: ['background', 'label', 'value'],
});

export const MockYesNoModalComponent = MockComponent({
  selector: 'app-yes-no-modal',
});

export const MockNgSelectComponent = MockComponent({
  selector: 'ng-select',
  inputs: ['items', 'bindLabel', 'bindValue'],
});
