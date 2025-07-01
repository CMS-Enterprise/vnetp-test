import { ComponentFixture, TestBed } from '@angular/core/testing';
import { V1NetworkSecurityServiceObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { UnusedObjectsModalComponent } from './unused-objects-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UnusedObjectsModalComponent', () => {
  let component: UnusedObjectsModalComponent;
  let fixture: ComponentFixture<UnusedObjectsModalComponent>;
  let mockServiceObjectsService: V1NetworkSecurityServiceObjectsService;
  let mockNgxSmartModalService: NgxSmartModalService;

  beforeEach(() => {
    mockServiceObjectsService = {
      softDeleteOneServiceObject: jest.fn().mockReturnValue(of({})),
    } as any;

    mockNgxSmartModalService = {} as any;

    TestBed.configureTestingModule({
      declarations: [UnusedObjectsModalComponent],
      providers: [
        { provide: V1NetworkSecurityServiceObjectsService, useValue: mockServiceObjectsService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UnusedObjectsModalComponent);
    component = fixture.componentInstance;

    component.unusedObjectsInput = {
      data: [
        { id: '1', name: 'service1' },
        { id: '2', name: 'service2' },
        { id: '3', name: 'service3' },
      ],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('softDeleteServiceObject', () => {
    it('should open a confirmation modal and delete the object on confirmation', () => {
      const objectToDelete = { id: '2', name: 'service2' };
      const initialDataLength = component.unusedObjectsInput.data.length;

      const subscribeSpy = jest
        .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
        .mockImplementation((modalDto: YesNoModalDto, ngx: NgxSmartModalService, onConfirm: () => void) => {
          onConfirm();
          return new Subscription();
        });

      component.softDeleteServiceObject(objectToDelete);

      expect(subscribeSpy).toHaveBeenCalled();
      const modalDtoArg = subscribeSpy.mock.calls[0][0];
      expect(modalDtoArg.modalTitle).toBe('Soft Delete');
      expect(modalDtoArg.modalBody).toContain('soft delete this service object');

      expect(mockServiceObjectsService.softDeleteOneServiceObject).toHaveBeenCalledWith({ id: objectToDelete.id });

      expect(component.unusedObjectsInput.data.length).toBe(initialDataLength - 1);
      expect(component.unusedObjectsInput.data.find(obj => obj.id === objectToDelete.id)).toBeUndefined();
    });
  });

  it('config should have the correct description and template', () => {
    expect(component.config.description).toBe('Unused Service Objects/Groups');
    expect(component.config.columns[1].template()).toBe(component.actionsTemplate);
  });
});
