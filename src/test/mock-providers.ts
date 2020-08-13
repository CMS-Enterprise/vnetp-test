import { of } from 'rxjs';
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
    lockDatacenter: jest.fn(),
    unlockDatacenter: jest.fn(),
    currentDatacenter: of({ id: '1' }),
  };
};

const MockTierContextService = () => {
  return {
    lockTier: jest.fn(),
    unlockTier: jest.fn(),
    switchTier: jest.fn(),
  };
};

const MockProviders = new Map<any, () => object>([
  [NgxSmartModalService, MockNgxSmartModalService],
  [ToastrService, MockToastrService],
  [DatacenterContextService, MockDatacenterContextService],
  [TierContextService, MockTierContextService],
]);

export const MockProvider = <T>(provide: T) => {
  const value = MockProviders.get(provide);
  const useValue = !!value ? value() : generateMockProvider(provide);
  return { provide, useValue };
};

const generateMockProvider = (provider: any): object => {
  const name = provider.prototype.constructor.name as string;
  if (!name.endsWith('Service')) {
    return {};
  }
  const baseName = name.substring(0, name.length - 'Service'.length).replace('V', 'v');
  return {
    [`${baseName}IdDelete`]: jest.fn(() => of({})),
    [`${baseName}IdSoftDelete`]: jest.fn(() => of({})),
    [`${baseName}IdRestorePatch`]: jest.fn(() => of({})),
    [`${baseName}Post`]: jest.fn(() => of({})),
    [`${baseName}IdPut`]: jest.fn(() => of({})),
    [`${baseName}IdGet`]: jest.fn(() => of({})),
    [`${baseName}Get`]: jest.fn(() => of([])),
  };
};
