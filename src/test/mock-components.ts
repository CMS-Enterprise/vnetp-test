import { Component, EventEmitter } from '@angular/core';

/**
 * Creates a Component to use during tests
 * @param options Either a component or just the selector name
 */
export const MockComponent = (options: Component | string): Component => {
  const metadata = typeof options === 'string' ? { selector: options } : { ...options };
  metadata.template = metadata.template || '';
  metadata.outputs = metadata.outputs || [];
  metadata.exportAs = metadata.exportAs || '';

  class Mock {}

  metadata.outputs.forEach(method => {
    Mock.prototype[method] = new EventEmitter<any>();
  });

  return Component(metadata)(Mock as any);
};

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
  inputs: ['identifier', 'customClass', 'dismissable'],
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
