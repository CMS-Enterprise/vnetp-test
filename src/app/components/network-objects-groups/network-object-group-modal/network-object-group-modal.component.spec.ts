import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import {
  V1NetworkSecurityNetworkObjectGroupsService,
  V1TiersService,
  NetworkObjectGroup,
  NetworkObject,
  NetworkObjectTypeEnum,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import { NetworkObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const MOCK_GROUP: NetworkObjectGroup = {
  id: 'group-1',
  name: 'test-group',
  description: 'A test group',
  tierId: 'tier-1',
  networkObjects: [{ id: 'no-1', name: 'obj1', ipAddress: '1.1.1.1', type: NetworkObjectTypeEnum.IpAddress, tierId: 'tier-1' }],
};

const MOCK_TIER_OBJECTS: NetworkObject[] = [
  { id: 'no-1', name: 'obj1', ipAddress: '1.1.1.1', type: NetworkObjectTypeEnum.IpAddress, tierId: 'tier-1', deletedAt: null },
  { id: 'no-2', name: 'obj2', ipAddress: '2.2.2.2', type: NetworkObjectTypeEnum.IpAddress, tierId: 'tier-1', deletedAt: null },
  {
    id: 'no-3',
    name: 'obj3',
    ipAddress: '3.3.3.3',
    deletedAt: 'a-date',
    type: NetworkObjectTypeEnum.IpAddress,
    tierId: 'tier-1',
  }, // To be filtered out
];

describe('NetworkObjectGroupModalComponent', () => {
  let component: NetworkObjectGroupModalComponent;
  let fixture: ComponentFixture<NetworkObjectGroupModalComponent>;
  let mockNgx: NgxSmartModalService;
  let mockNogService: V1NetworkSecurityNetworkObjectGroupsService;
  let mockTierService: V1TiersService;

  beforeEach(() => {
    mockNgx = {
      getModalData: jest.fn(),
      resetModalData: jest.fn(),
      close: jest.fn(),
    } as any;

    mockNogService = {
      createOneNetworkObjectGroup: jest.fn().mockReturnValue(of(MOCK_GROUP)),
      updateOneNetworkObjectGroup: jest.fn().mockReturnValue(of(MOCK_GROUP)),
      addNetworkObjectToGroupNetworkObjectGroup: jest.fn().mockReturnValue(of({})),
      removeNetworkObjectFromGroupNetworkObjectGroup: jest.fn().mockReturnValue(of({})),
      getOneNetworkObjectGroup: jest.fn().mockReturnValue(of(MOCK_GROUP)),
    } as any;

    mockTierService = {
      getOneTier: jest.fn().mockReturnValue(of({ networkObjects: MOCK_TIER_OBJECTS })),
    } as any;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [NetworkObjectGroupModalComponent],
      providers: [
        UntypedFormBuilder,
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: V1NetworkSecurityNetworkObjectGroupsService, useValue: mockNogService },
        { provide: V1TiersService, useValue: mockTierService },
        { provide: NetworkObjectGroupModalHelpText, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call buildForm', () => {
    const spy = jest.spyOn(component as any, 'buildForm');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  describe('save', () => {
    it('should not save if form is invalid', () => {
      component.form.setErrors({ invalid: true });
      component.save();
      expect(component.submitted).toBe(true);
      expect(mockNogService.createOneNetworkObjectGroup).not.toHaveBeenCalled();
    });

    it('should create in Create mode', () => {
      component.ModalMode = ModalMode.Create;
      component.TierId = 'tier-1';
      component.form.setValue({ name: 'new-group', description: 'new desc' });
      const spy = jest.spyOn(component as any, 'closeModal');
      component.save();
      expect(mockNogService.createOneNetworkObjectGroup).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should update in Edit mode', () => {
      component.ModalMode = ModalMode.Edit;
      component.NetworkObjectGroupId = 'group-1';
      component.form.setValue({ name: 'new-group', description: 'new desc' });
      const spy = jest.spyOn(component as any, 'closeModal');
      component.save();
      expect(mockNogService.updateOneNetworkObjectGroup).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  it('cancel should close the modal', () => {
    component.cancel();
    expect(mockNgx.close).toHaveBeenCalledWith('networkObjectGroupModal');
  });

  it('f getter should return form controls', () => {
    expect(component.f).toBe(component.form.controls);
  });

  it('addNetworkObject should call the service and refresh data', fakeAsync(() => {
    const getGroupSpy = jest.spyOn(component as any, 'getGroupNetworkObjects');
    const getTierSpy = jest.spyOn(component as any, 'getTierNetworkObjects');
    component.NetworkObjectGroupId = 'group-1';
    component.selectedNetworkObject = {
      id: 'no-2',
      name: 'obj2',
      ipAddress: '2.2.2.2',
      type: NetworkObjectTypeEnum.IpAddress,
      tierId: 'tier-1',
    };

    component.addNetworkObject();
    tick();

    expect(mockNogService.addNetworkObjectToGroupNetworkObjectGroup).toHaveBeenCalledWith({
      networkObjectGroupId: 'group-1',
      networkObjectId: 'no-2',
    });
    expect(component.selectedNetworkObject).toBeNull();
    expect(getGroupSpy).toHaveBeenCalled();
    expect(getTierSpy).toHaveBeenCalled();
  }));

  it('removeNetworkObject should show confirmation and then remove the object', () => {
    const objectToRemove = { id: 'no-1', name: 'obj1' };
    const getGroupSpy = jest.spyOn(component as any, 'getGroupNetworkObjects');
    const getTierSpy = jest.spyOn(component as any, 'getTierNetworkObjects');
    component.NetworkObjectGroupId = 'group-1';

    jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto: YesNoModalDto, ngx: NgxSmartModalService, onConfirm: () => void) => {
        onConfirm();
        return new Subscription();
      });

    component.removeNetworkObject(objectToRemove as NetworkObject);

    expect(mockNogService.removeNetworkObjectFromGroupNetworkObjectGroup).toHaveBeenCalledWith({
      networkObjectGroupId: 'group-1',
      networkObjectId: 'no-1',
    });
    expect(getGroupSpy).toHaveBeenCalled();
    expect(getTierSpy).toHaveBeenCalled();
  });

  describe('getData', () => {
    it('should set component properties for Edit mode', () => {
      const dto: NetworkObjectGroupModalDto = {
        ModalMode: ModalMode.Edit,
        TierId: 'tier-1',
        NetworkObjectGroup: MOCK_GROUP,
      };
      (mockNgx.getModalData as jest.Mock).mockReturnValue(dto);
      const getGroupSpy = jest.spyOn(component as any, 'getGroupNetworkObjects');
      const getTierSpy = jest.spyOn(component as any, 'getTierNetworkObjects');

      component.getData();

      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.TierId).toBe('tier-1');
      expect(component.NetworkObjectGroupId).toBe('group-1');
      expect(component.form.get('name').value).toBe('test-group');
      expect(component.form.get('name').disabled).toBe(true);
      expect(getGroupSpy).toHaveBeenCalled();
      expect(getTierSpy).toHaveBeenCalled();
      expect(mockNgx.resetModalData).toHaveBeenCalled();
    });

    it('should set component properties for Create mode', () => {
      const dto: NetworkObjectGroupModalDto = {
        ModalMode: ModalMode.Create,
        TierId: 'tier-1',
        NetworkObjectGroup: null,
      };
      (mockNgx.getModalData as jest.Mock).mockReturnValue(dto);
      component.getData();
      expect(component.ModalMode).toBe(ModalMode.Create);
      expect(component.form.get('name').enabled).toBe(true);
    });
  });

  it('getTierNetworkObjects should filter out objects already in the group and deleted objects', fakeAsync(() => {
    component.TierId = 'tier-1';
    component.networkObjects = [
      { id: 'no-1', name: 'obj1', ipAddress: '1.1.1.1', type: NetworkObjectTypeEnum.IpAddress, tierId: 'tier-1' },
    ]; // Object already in group
    (component as any).getTierNetworkObjects();
    tick();
    // MOCK_TIER_OBJECTS has 3 objects. 'no-1' is already in the group, 'no-3' is deleted. So only 'no-2' should remain.
    expect(component.tierNetworkObjects.length).toBe(1);
    expect(component.tierNetworkObjects[0].id).toBe('no-2');
  }));

  it('getGroupNetworkObjects should fetch and set networkObjects', fakeAsync(() => {
    component.NetworkObjectGroupId = 'group-1';
    (component as any).getGroupNetworkObjects();
    tick();
    expect(mockNogService.getOneNetworkObjectGroup).toHaveBeenCalledWith({ id: 'group-1', join: ['networkObjects'] });
    expect(component.networkObjects).toEqual(MOCK_GROUP.networkObjects);
  }));

  it('reset should clear properties and rebuild form', () => {
    const spy = jest.spyOn(component as any, 'buildForm');
    component.submitted = true;
    component.networkObjects = [{} as NetworkObject];
    component.selectedNetworkObject = {} as NetworkObject;

    component.reset();

    expect(component.submitted).toBe(false);
    expect(component.networkObjects.length).toBe(0);
    expect(component.selectedNetworkObject).toBeNull();
    expect(spy).toHaveBeenCalled();
  });
});
