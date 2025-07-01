import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { V1SelfServiceService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SelfServiceBulkUploadModalComponent } from './self-service-bulk-upload-modal.component';
import { of, Subscription } from 'rxjs';

describe('SelfServiceBulkUploadModalComponent', () => {
  let component: SelfServiceBulkUploadModalComponent;
  let fixture: ComponentFixture<SelfServiceBulkUploadModalComponent>;
  let mockSelfServiceService: V1SelfServiceService;
  let mockNgxSmartModalService: NgxSmartModalService;

  beforeEach(() => {
    mockSelfServiceService = {
      bulkUploadSelfService: jest.fn().mockReturnValue(of({})),
    } as any;

    mockNgxSmartModalService = {
      getModal: jest.fn(),
      setModalData: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      declarations: [SelfServiceBulkUploadModalComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: DatacenterContextService, useValue: {} },
        { provide: TierContextService, useValue: {} },
        { provide: V1SelfServiceService, useValue: mockSelfServiceService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SelfServiceBulkUploadModalComponent);
    component = fixture.componentInstance;
    component.selfService = { id: 'test' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleTabChange', () => {
    it('should not change navIndex if the tab is already selected', () => {
      component.navIndex = 0;
      const initialIndex = component.navIndex;
      component.handleTabChange({ name: component.tabs[0].name });
      expect(component.navIndex).toBe(initialIndex);
    });

    it('should change navIndex if a new tab is selected', () => {
      component.navIndex = 0;
      const newIndex = 1;
      component.handleTabChange({ name: component.tabs[newIndex].name });
      expect(component.navIndex).toBe(newIndex);
    });
  });

  describe('importObjects', () => {
    it('should open a confirmation modal and call the service on confirm', () => {
      const subscribeSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, onConfirm) => {
        onConfirm();
        return new Subscription();
      });

      component.importObjects();

      expect(subscribeSpy).toHaveBeenCalled();
      expect(mockSelfServiceService.bulkUploadSelfService).toHaveBeenCalledWith({
        selfService: component.selfService,
      });
    });
  });
});
