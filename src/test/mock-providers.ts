import { of, Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';

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

const MockProviders = new Map<any, () => object>([
  [NgxSmartModalService, MockNgxSmartModalService],
  [ToastrService, MockToastrService],
  [DatacenterContextService, MockDatacenterContextService],
  [TierContextService, MockTierContextService],
]);

export const MockProvider = <T>(provide: T, additionalProps: { [key: string]: Observable<any> } = {}) => {
  const value = MockProviders.get(provide);
  const useValue = !!value ? value() : generateMockProvider(provide, additionalProps);
  return { provide, useValue };
};

const generateMockProvider = (provider: any, additionalProps: { [key: string]: Observable<any> } = {}): object => {
  const name = provider.prototype.constructor.name as string;
  if (!name.endsWith('Service')) {
    return {};
  }

  const baseName = name.substring(0, name.length - 'Service'.length).replace('V', 'v');
  const mockedProvider = {
    [`${baseName}IdDelete`]: jest.fn(() => of({})),
    [`${baseName}IdSoftDelete`]: jest.fn(() => of({})),
    [`${baseName}IdRestorePatch`]: jest.fn(() => of({})),
    [`${baseName}Post`]: jest.fn(() => of({})),
    [`${baseName}IdPut`]: jest.fn(() => of({})),
    [`${baseName}IdGet`]: jest.fn(() => of({})),
    [`${baseName}Get`]: jest.fn(() => of([])),
  };

  Object.keys(additionalProps).forEach(key => {
    mockedProvider[key] = jest.fn(() => additionalProps[key]);
  });

  return mockedProvider;
};
