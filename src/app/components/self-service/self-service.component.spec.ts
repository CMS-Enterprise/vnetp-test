import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelfServiceComponent } from './self-service.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1SelfServiceService } from 'client/api/v1SelfService.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { BehaviorSubject, of, Subject, Subscription, throwError } from 'rxjs';
import { Datacenter } from 'client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const mockDatacenter: Datacenter = { id: '1', name: 'dc1' };

const mockDatacenterContextService = {
  currentDatacenter: new BehaviorSubject<Datacenter | null>(mockDatacenter),
};

const mockSelfServiceService = {
  getSelfServicesSelfService: jest.fn(),
  getSelfServiceSelfService: jest.fn(),
  bulkUploadSelfService: jest.fn(),
  deleteSelfServiceSelfService: jest.fn(),
};

const mockModal = {
  onCloseFinished: new Subject<void>(),
  open: jest.fn(),
  resetModalData: jest.fn(),
};

const mockNgxSmartModalService = {
  getModal: jest.fn().mockReturnValue(mockModal),
  resetModalData: jest.fn(),
};

describe('SelfServiceComponent', () => {
  let component: SelfServiceComponent;
  let fixture: ComponentFixture<SelfServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelfServiceComponent],
      providers: [
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1SelfServiceService, useValue: mockSelfServiceService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SelfServiceComponent);
    component = fixture.componentInstance;
    jest.spyOn(SubscriptionUtil, 'unsubscribe').mockImplementation(() => {});
    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, onConfirm, onClose) => {
      onConfirm();
      if (onClose) {
        onClose();
      }
      return new Subscription();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockDatacenterContextService.currentDatacenter.next(mockDatacenter);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to current datacenter and get self services', () => {
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices');
      mockSelfServiceService.getSelfServicesSelfService.mockReturnValue(of({ data: [] }));
      component.ngOnInit();
      expect(component.currentDatacenter).toEqual(mockDatacenter);
      expect(getSelfServicesSpy).toHaveBeenCalled();
    });

    it('should not get self services if datacenter is null', () => {
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices');
      mockDatacenterContextService.currentDatacenter.next(null);
      component.ngOnInit();
      expect(getSelfServicesSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      component.ngOnDestroy();
      expect(SubscriptionUtil.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('getSelfServices', () => {
    it('should fetch and format self services data', () => {
      const mockData = {
        data: [
          { conversionStatus: 'CompletedSuccessfully', bulkUploadStatus: 'InProgress' },
          { conversionStatus: 'Failed', bulkUploadStatus: 'NotStarted' },
        ],
      };
      mockSelfServiceService.getSelfServicesSelfService.mockReturnValue(of(mockData));

      component.currentDatacenter = mockDatacenter;
      component.getSelfServices();

      expect(component.loadingSelfServices).toBe(false);
      expect(component.selfServices).toEqual(mockData);
      expect(component.selfServices.data[0].conversionStatus).toBe('Completed Successfully');
      expect(component.selfServices.data[0].bulkUploadStatus).toBe('In Progress');
      expect(component.selfServices.data[1].conversionStatus).toBe('Failed');
      expect(component.selfServices.data[1].bulkUploadStatus).toBe('Not Started');
    });

    it('should handle API error', () => {
      mockSelfServiceService.getSelfServicesSelfService.mockReturnValue(throwError(() => new Error('API Error')));
      component.currentDatacenter = mockDatacenter;
      component.getSelfServices();
      expect(component.loadingSelfServices).toBe(false);
      expect(component.selfServices).toBe(null);
    });
  });

  describe('importObjects', () => {
    it('should get self service, open modal, and import on confirm', fakeAsync(() => {
      const selfService = { id: '1' };
      const selectedSelfService = { id: '1', name: 'ss1' };
      mockSelfServiceService.getSelfServiceSelfService.mockReturnValue(of(selectedSelfService));
      mockSelfServiceService.bulkUploadSelfService.mockReturnValue(of({}));
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices').mockImplementation();

      component.importObjects(selfService);
      tick();

      expect(component.selectedSelfService).toEqual(selectedSelfService);
      expect(mockSelfServiceService.bulkUploadSelfService).toHaveBeenCalledWith({ selfService: selectedSelfService });
      expect(getSelfServicesSpy).toHaveBeenCalledTimes(2);
      expect(SubscriptionUtil.subscribeToYesNoModal).toHaveBeenCalled();
    }));
  });

  describe('Modals', () => {
    it('openSelfServiceModal should subscribe and open modal', () => {
      const subscribeSpy = jest.spyOn(component, 'subscribeToSelfServiceModal');
      component.openSelfServiceModal();
      expect(subscribeSpy).toHaveBeenCalled();
      expect(mockNgxSmartModalService.getModal).toHaveBeenCalledWith('selfServiceModal');
      expect(mockModal.open).toHaveBeenCalled();
    });

    it('subscribeToSelfServiceModal should handle modal close', () => {
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices');
      component.subscribeToSelfServiceModal();
      mockModal.onCloseFinished.next();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('selfServiceModal');
      expect(getSelfServicesSpy).toHaveBeenCalled();
    });

    it('openSelfServiceArtifactReviewModal should get data and open modal', fakeAsync(() => {
      const selfService = { id: '1' };
      mockSelfServiceService.getSelfServiceSelfService.mockReturnValue(of({ id: '1' }));
      const subscribeSpy = jest.spyOn(component, 'subscribeToSelfServiceArtifactReviewModal');
      component.openSelfServiceArtifactReviewModal(selfService);
      tick();
      expect(subscribeSpy).toHaveBeenCalled();
      expect(mockSelfServiceService.getSelfServiceSelfService).toHaveBeenCalledWith({ selfServiceId: '1' });
      expect(component.selectedSelfService).toEqual({ id: '1' });
      expect(mockNgxSmartModalService.getModal).toHaveBeenCalledWith('selfServiceArtifactReviewModal');
      expect(mockModal.open).toHaveBeenCalled();
    }));

    it('subscribeToSelfServiceArtifactReviewModal should handle modal close', () => {
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices');
      component.subscribeToSelfServiceArtifactReviewModal();
      mockModal.onCloseFinished.next();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('selfServiceArtifactReviewModal');
      expect(getSelfServicesSpy).toHaveBeenCalled();
    });

    it('subscribeToBulkUploadModal should handle modal close', () => {
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices').mockImplementation();
      component.subscribeToBulkUploadModal();
      mockModal.onCloseFinished.next();
      expect(mockNgxSmartModalService.getModal).toHaveBeenCalledWith('selfServiceBulkUploadModal');
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('selfServiceBulkUploadModal');
      expect(getSelfServicesSpy).toHaveBeenCalled();
    });
  });

  describe('deleteSelfService', () => {
    it('should get self service, open modal, and delete on confirm', fakeAsync(() => {
      const selfService = { id: 'ss1' };
      const selectedSelfService = {
        id: 'ss1',
        convertedConfig: { artifact: { error: 'Test Error' } },
      };
      mockSelfServiceService.getSelfServiceSelfService.mockReturnValue(of(selectedSelfService as any));
      mockSelfServiceService.deleteSelfServiceSelfService.mockReturnValue(of(null));
      const getSelfServicesSpy = jest.spyOn(component, 'getSelfServices').mockImplementation();

      component.deleteSelfService(selfService);
      tick();

      expect(mockSelfServiceService.getSelfServiceSelfService).toHaveBeenCalledWith({ selfServiceId: selfService.id });
      expect(component.selectedSelfService).toEqual(selectedSelfService);
      expect(SubscriptionUtil.subscribeToYesNoModal).toHaveBeenCalled();
      expect(mockSelfServiceService.deleteSelfServiceSelfService).toHaveBeenCalledWith({ selfServiceId: selfService.id });
      expect(getSelfServicesSpy).toHaveBeenCalledTimes(2);
    }));
  });
});
