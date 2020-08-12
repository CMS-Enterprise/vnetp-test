import { of } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';

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

const MockProviders = new Map<any, Function>([
  [NgxSmartModalService, MockNgxSmartModalService],
  [ToastrService, MockToastrService],
]);

export const MockProvider = <T>(provide: T) => {
  const value = MockProviders.get(provide);
  const useValue = !!value ? value() : {};
  return { provide, useValue };
};
