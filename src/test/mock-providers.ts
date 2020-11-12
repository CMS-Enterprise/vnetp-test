import { of } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { Router } from '@angular/router';

const MockNgxSmartModalService = () => {
  return {
    getModal: jest.fn(() => {
      return {
        open: jest.fn(),
        getData: jest.fn(),
        setData: jest.fn(),
        close: jest.fn(),
        isVisible: jest.fn(),
        onOpen: of({}),
        onAnyCloseEvent: of({
          getData: jest.fn(() => {}),
        }),
        onCloseFinished: of({
          getData: jest.fn(() => {}),
        }),
      };
    }),
    close: jest.fn(),
    setModalData: jest.fn(),
    getModalData: jest.fn(),
    resetModalData: jest.fn(),
  };
};

const MockToastrService = () => {
  return {
    success: jest.fn(),
    error: jest.fn(),
  };
};

const MockDatacenterContextService = () => {
  return {
    currentDatacenter: of({ id: '1' }),
    currentDatacenterValue: { id: '1' },
    datacenters: of([{ id: '1', tiers: [] }]),
    lockCurrentDatacenter: of(false),
    lockDatacenter: jest.fn(),
    switchDatacenter: jest.fn(),
    unlockDatacenter: jest.fn(),
  };
};

const MockTierContextService = () => {
  return {
    lockTier: jest.fn(),
    unlockTier: jest.fn(),
    switchTier: jest.fn(),
    currentTier: of({ id: '2' }),
  };
};

const MockRouter = () => {
  return {
    navigateByUrl: jest.fn(),
  };
};

const MockProviders = new Map<any, () => object>([
  [NgxSmartModalService, MockNgxSmartModalService],
  [ToastrService, MockToastrService],
  [DatacenterContextService, MockDatacenterContextService],
  [TierContextService, MockTierContextService],
  [Router, MockRouter],
]);

type Constructor<T> = new (...args: any[]) => T;
type Props<T> = { [K in keyof T]?: Partial<T[K]> };

export const MockProvider = <T extends object>(provide: Constructor<T>, additionalProps: Props<T> = {}) => {
  const value = MockProviders.get(provide);
  const useValue = !!value ? value() : generateMockProvider(provide, additionalProps);
  return { provide, useValue };
};

const generateMockProvider = <T extends object>(provider: Constructor<T>, additionalProps: Props<T> = {}): object => {
  const name = provider.prototype.constructor.name as string;
  if (!name.endsWith('Service')) {
    return {};
  }

  const mockProvider = {} as any;

  const functions = getFunctions(new provider());
  functions.forEach(fn => {
    const isGetList = fn.endsWith('Get') && !fn.endsWith('IdGet');
    const returnType = isGetList ? [] : {};
    mockProvider[fn] = jest.fn(() => of(returnType));
  });

  Object.keys(additionalProps).forEach(key => {
    mockProvider[key] = jest.fn(() => additionalProps[key]);
  });

  return mockProvider;
};

function getFunctions(clazz: object): string[] {
  let props = [];
  let obj = clazz;
  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)));

  return props.sort().filter(prop => prop !== 'constructor');
}
