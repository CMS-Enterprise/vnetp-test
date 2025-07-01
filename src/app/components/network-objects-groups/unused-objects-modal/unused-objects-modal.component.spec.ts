import { ComponentFixture, TestBed } from '@angular/core/testing';
import { V1NetworkSecurityNetworkObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { UnusedObjectsModalComponent } from './unused-objects-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UnusedObjectsModalComponent', () => {
  let component: UnusedObjectsModalComponent;
  let fixture: ComponentFixture<UnusedObjectsModalComponent>;
  let mockNetworkObjectService: V1NetworkSecurityNetworkObjectsService;
  let mockNgxSmartModalService: NgxSmartModalService;

  beforeEach(() => {
    mockNetworkObjectService = {
      softDeleteOneNetworkObject: jest.fn().mockReturnValue(of({})),
    } as any;

    mockNgxSmartModalService = {} as any; // Not used directly, but needed for SubscriptionUtil

    TestBed.configureTestingModule({
      declarations: [UnusedObjectsModalComponent],
      providers: [
        { provide: V1NetworkSecurityNetworkObjectsService, useValue: mockNetworkObjectService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UnusedObjectsModalComponent);
    component = fixture.componentInstance;

    // Initialize @Input
    component.unusedObjectsInput = {
      data: [
        { id: '1', name: 'obj1' },
        { id: '2', name: 'obj2' },
        { id: '3', name: 'obj3' },
      ],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('softDeleteNetworkObject', () => {
    it('should open a confirmation modal and delete the object on confirmation', () => {
      const objectToDelete = { id: '2', name: 'obj2' };
      const initialDataLength = component.unusedObjectsInput.data.length;

      // Mock the subscription utility
      const subscribeSpy = jest
        .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
        .mockImplementation((modalDto: YesNoModalDto, ngx: NgxSmartModalService, onConfirm: () => void) => {
          // Immediately execute the onConfirm callback to simulate user clicking "yes"
          onConfirm();
          return new Subscription();
        });

      // Call the method
      component.softDeleteNetworkObject(objectToDelete);

      // Verify confirmation modal was triggered
      expect(subscribeSpy).toHaveBeenCalled();
      const modalDtoArg = subscribeSpy.mock.calls[0][0];
      expect(modalDtoArg.modalTitle).toBe('Soft Delete');

      // Verify service was called
      expect(mockNetworkObjectService.softDeleteOneNetworkObject).toHaveBeenCalledWith({ id: objectToDelete.id });

      // Verify local data is updated
      expect(component.unusedObjectsInput.data.length).toBe(initialDataLength - 1);
      expect(component.unusedObjectsInput.data.find(obj => obj.id === objectToDelete.id)).toBeUndefined();
    });
  });

  it('config should have the correct template', () => {
    expect(component.config.columns[1].template()).toBe(component.actionsTemplate);
  });
});
