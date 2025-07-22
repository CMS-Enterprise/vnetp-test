import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subject } from 'rxjs';
import { EndpointDisplayModalComponent, EsgModalDisplayData, ModalDisplayEndpoint } from './endpoint-display-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock NgxSmartModalService
class MockNgxSmartModalService {
  private modalInstance: any = {
    onOpen: new Subject<void>(),
    onClose: new Subject<void>(),
    onDismiss: new Subject<void>(),
    getData: jest.fn(),
    setData: jest.fn(),
    open: jest.fn(),
    close: jest.fn(),
  };

  getModal(id: string) {
    if (id === 'endpointDisplayModal') {
      return this.modalInstance;
    }
    // Simulate modal not found
    throw new Error(`Modal '${id}' not found.`);
  }

  // Helper to trigger onOpen for tests
  triggerModalOpen() {
    this.modalInstance.onOpen.next();
  }

  // Helper to trigger onClose for tests
  triggerModalClose() {
    this.modalInstance.onClose.next();
  }

  // Helper to trigger onDismiss for tests
  triggerModalDismiss() {
    this.modalInstance.onDismiss.next();
  }

  // Helper to set modal data for tests
  setModalData(data: any) {
    this.modalInstance.getData.mockReturnValue(data);
  }
}

describe('EndpointDisplayModalComponent', () => {
  let component: EndpointDisplayModalComponent;
  let fixture: ComponentFixture<EndpointDisplayModalComponent>;
  let mockModalService: MockNgxSmartModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EndpointDisplayModalComponent],
      providers: [{ provide: NgxSmartModalService, useClass: MockNgxSmartModalService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointDisplayModalComponent);
    component = fixture.componentInstance;
    mockModalService = TestBed.inject(NgxSmartModalService) as any;
    fixture.detectChanges(); // This calls ngOnInit and ngAfterViewInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty processed data on ngOnInit', () => {
    expect(component.processedModalData).toEqual([]);
  });

  describe('ngAfterViewInit', () => {
    it('should subscribe to modal events', () => {
      const modal = mockModalService.getModal('endpointDisplayModal');
      const onOpenSpy = jest.spyOn(modal.onOpen, 'subscribe');
      const onCloseSpy = jest.spyOn(modal.onClose, 'subscribe');
      const onDismissSpy = jest.spyOn(modal.onDismiss, 'subscribe');

      component.ngAfterViewInit(); // Call it again to test the subscription setup

      expect(onOpenSpy).toHaveBeenCalled();
      expect(onCloseSpy).toHaveBeenCalled();
      expect(onDismissSpy).toHaveBeenCalled();
    });

    it('should log an error if the modal is not found', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      component.modalId = 'nonexistentModal';
      component.ngAfterViewInit();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Modal \'nonexistentModal\' not found in ngAfterViewInit. Check ID and registration.',
        expect.any(Error),
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Modal Event Handling', () => {
    it('should process new ESG data format on modal open', () => {
      const esgData: EsgModalDisplayData[] = [
        { epgName: 'epg-1', endpoints: [], isEpgExpanded: true },
        { epgName: 'epg-2', endpoints: [], isEpgExpanded: false },
      ];
      mockModalService.setModalData({ data: esgData, context: 'esg' });

      mockModalService.triggerModalOpen();

      expect(component.displayContext).toBe('esg');
      expect(component.processedModalData).toEqual(esgData);
    });

    it('should process new EPG data format on modal open', () => {
      const epgData = [
        { macAddress: 'AA:BB', ipAddresses: [{ address: '1.1.1.1' }] },
        { macAddress: 'CC:DD', ipAddresses: [] },
      ];
      mockModalService.setModalData({ data: epgData, context: 'epg' });

      mockModalService.triggerModalOpen();

      expect(component.displayContext).toBe('epg');
      expect(component.processedModalData.length).toBe(2);
      expect((component.processedModalData[0] as ModalDisplayEndpoint).macAddress).toBe('AA:BB');
      expect((component.processedModalData[0] as ModalDisplayEndpoint).isIpListExpanded).toBe(true);
    });

    it('should process old EPG data format on modal open', () => {
      const oldEpgData = [
        { macAddress: 'AA:BB', ipAddresses: [{ address: '1.1.1.1' }] },
        { macAddress: 'CC:DD', ipAddresses: [] },
      ];
      mockModalService.setModalData(oldEpgData);

      mockModalService.triggerModalOpen();

      expect(component.displayContext).toBe('epg');
      expect(component.processedModalData.length).toBe(2);
      expect((component.processedModalData[0] as ModalDisplayEndpoint).macAddress).toBe('AA:BB');
    });

    it('should handle invalid data on modal open and log an error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const invalidData = { some: 'unexpected', structure: 'here' };
      mockModalService.setModalData(invalidData);

      mockModalService.triggerModalOpen();

      expect(component.processedModalData).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Modal data is not in the expected format or is missing.', invalidData);
      consoleErrorSpy.mockRestore();
    });

    it('should handle an unknown context type', () => {
      const dataWithUnknownContext = { data: [], context: 'unknown' };
      mockModalService.setModalData(dataWithUnknownContext);

      mockModalService.triggerModalOpen();

      expect(component.processedModalData).toEqual([]);
    });

    it('should clear data on modal close', () => {
      // Set some data first
      component.processedModalData = [{ epgName: 'test', endpoints: [], isEpgExpanded: true }];
      mockModalService.triggerModalClose();
      expect(component.processedModalData).toEqual([]);
    });

    it('should clear data on modal dismiss', () => {
      // Set some data first
      component.processedModalData = [{ epgName: 'test', endpoints: [], isEpgExpanded: true }];
      mockModalService.triggerModalDismiss();
      expect(component.processedModalData).toEqual([]);
    });
  });

  describe('UI Interaction', () => {
    it('should toggle isIpListExpanded', () => {
      const endpoint: ModalDisplayEndpoint = { isIpListExpanded: true };
      component.toggleIpAddresses(endpoint);
      expect(endpoint.isIpListExpanded).toBe(false);
      component.toggleIpAddresses(endpoint);
      expect(endpoint.isIpListExpanded).toBe(true);
    });

    it('should toggle isEpgExpanded', () => {
      const epg: EsgModalDisplayData = { epgName: 'test-epg', endpoints: [], isEpgExpanded: false };
      component.toggleEpgExpansion(epg);
      expect(epg.isEpgExpanded).toBe(true);
      component.toggleEpgExpansion(epg);
      expect(epg.isEpgExpanded).toBe(false);
    });
  });

  describe('processInputData', () => {
    it('should do nothing if rawModalInput is null', () => {
      component.rawModalInput = null;
      component.processInputData();
      expect(component.processedModalData).toEqual([]);
    });

    it('should handle esg context', () => {
      const esgData: EsgModalDisplayData[] = [{ epgName: 'esg-1', endpoints: [], isEpgExpanded: true }];
      component.rawModalInput = { data: esgData, context: 'esg' };
      component.processInputData();
      expect(component.processedModalData).toEqual(esgData);
    });

    it('should handle epg context by mapping endpoints', () => {
      const epgData = [{ macAddress: 'AA:BB', ipAddresses: [{ address: '1.1.1.1' }] }];
      component.rawModalInput = { data: epgData, context: 'epg' };
      component.processInputData();
      expect(component.processedModalData.length).toBe(1);
      const processed = component.processedModalData[0] as ModalDisplayEndpoint;
      expect(processed.macAddress).toBe('AA:BB');
      expect(processed.isIpListExpanded).toBe(true);
    });

    it('should reset data for an unknown context', () => {
      component.rawModalInput = { data: [], context: 'unknown' as any };
      component.processInputData();
      expect(component.processedModalData).toEqual([]);
    });
  });
});
