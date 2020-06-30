import { Component, EventEmitter } from '@angular/core';

const MockComponent = (options: Component): Component => {
  const metadata = { ...options };
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
