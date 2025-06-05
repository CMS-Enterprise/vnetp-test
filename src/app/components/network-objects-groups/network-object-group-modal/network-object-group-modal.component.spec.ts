import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
  MockNgSelectComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkSecurityNetworkObjectGroupsService, V1TiersService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Subscription } from 'rxjs';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';

describe('NetworkObjectGroupModalComponent', () => {
  let component: NetworkObjectGroupModalComponent;
  let fixture: ComponentFixture<NetworkObjectGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        NetworkObjectGroupModalComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgSelectComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1TiersService),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('network object operations', () => {
    it('should add network object to group', () => {
      const service = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);

      const addNetObjSpy = jest.spyOn(service, 'addNetworkObjectToGroupNetworkObjectGroup');
      const getGroupNetworkObjectsSpy = jest.spyOn(component as any, 'getGroupNetworkObjects');
      const getTierNetworkObjectsSpy = jest.spyOn(component as any, 'getTierNetworkObjects');

      component.NetworkObjectGroupId = 'groupId';
      component.selectedNetworkObject = { id: 'objId', name: 'netObj1' } as any;
      component.addNetworkObject();

      expect(addNetObjSpy).toHaveBeenCalledWith({ networkObjectGroupId: 'groupId', networkObjectId: 'objId' });
      expect(getGroupNetworkObjectsSpy).toHaveBeenCalled();
      expect(getTierNetworkObjectsSpy).toHaveBeenCalled();
    });

    it('should remove network object from group', () => {
      const service = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);

      const removeNetObjSpy = jest.spyOn(service, 'removeNetworkObjectFromGroupNetworkObjectGroup');
      const getGroupNetworkObjectsSpy = jest.spyOn(component as any, 'getGroupNetworkObjects');
      const getTierNetworkObjectsSpy = jest.spyOn(component as any, 'getTierNetworkObjects');

      component.NetworkObjectGroupId = 'groupId';
      const netObj = {
        id: 'objId',
        name: 'netObj1',
      } as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        return new Subscription();
      });

      component.removeNetworkObject(netObj);

      expect(removeNetObjSpy).toHaveBeenCalledWith({ networkObjectGroupId: 'groupId', networkObjectId: 'objId' });
      expect(getGroupNetworkObjectsSpy).toHaveBeenCalled();
      expect(getTierNetworkObjectsSpy).toHaveBeenCalled();
    });
  });

  describe('Create', () => {
    it('should create a networkObjectGroup when in create mode', () => {
      const service = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);

      const createNetObjGroupSpy = jest.spyOn(service, 'createOneNetworkObjectGroup');

      component.ModalMode = ModalMode.Create;
      component.form.setValue({
        name: 'net-obj-group1',
        description: '',
      });

      component.TierId = 'tierId';

      component.save();
      expect(createNetObjGroupSpy).toHaveBeenCalledWith({
        networkObjectGroup: {
          name: 'net-obj-group1',
          description: '',
          tierId: 'tierId',
        },
      });
    });

    it('should edit a networkObjectGroup when in edit mode', () => {
      const service = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);

      const updateNetObjGroupSpy = jest.spyOn(service, 'updateOneNetworkObjectGroup');

      component.ModalMode = ModalMode.Edit;
      component.form.setValue({
        name: 'net-obj-group1',
        description: '',
      });

      component.TierId = 'tierId';
      component.NetworkObjectGroupId = 'net-obj-groupId123';

      component.save();
      expect(updateNetObjGroupSpy).toHaveBeenCalledWith({
        networkObjectGroup: {
          name: 'net-obj-group1',
          description: '',
        },
        id: 'net-obj-groupId123',
      });
    });
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  describe('Description', () => {
    it('should be optional', () => {
      const { description } = component.form.controls;

      description.setValue(null);
      expect(description.valid).toBe(true);
    });

    it('should have a minimum length of 3 and maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(false);

      description.setValue('a'.repeat(3));
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    // Access the private ngx member using bracket notation
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const ngx = component['ngx'];

    // Set up the spy on ngx.close
    const ngxSpy = jest.spyOn(ngx, 'close');

    // Call the cancel method
    // eslint-disable-next-line @typescript-eslint/dot-notation
    component['closeModal']();

    // Check if ngx.close has been called with the expected argument
    expect(ngxSpy).toHaveBeenCalledWith('networkObjectGroupModal');
  });

  describe('getData', () => {
    const createNetworkObjectGroupModalDto = (): NetworkObjectGroupModalDto => ({
      TierId: '1',
      NetworkObjectGroup: {
        tierId: '1',
        id: '2',
        name: 'NetworkObjectGroup',
      },
      ModalMode: ModalMode.Edit,
    });
    it('should disable the name when editing a network object group', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createNetworkObjectGroupModalDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
    });
  });
});
