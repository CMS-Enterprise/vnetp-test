import { of, Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { V1VmwareVirtualMachinesService, V1VmwareVirtualMachinesBulkPostRequestParams } from 'api_client';

const MockNgxSmartModalService = {
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

const MockToastrService = {
  success: jest.fn(),
  error: jest.fn(),
};

const MockProviders = new Map<any, object>([
  [NgxSmartModalService, MockNgxSmartModalService],
  [ToastrService, MockToastrService],
]);

export const MockProvider = <T>(type: T) => {
  const value = MockProviders.get(type) || {};
  return { provide: type, useValue: Object.assign({}, value) };
};
