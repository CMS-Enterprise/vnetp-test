/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
  MockNgSelectComponent,
} from 'src/test/mock-components';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal.component';
import { MockProvider } from 'src/test/mock-providers';
import { ServiceObjectGroupTypeEnum, V1NetworkSecurityServiceObjectGroupsService, V1TiersService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { of, Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ServiceObjectGroupModalDto } from 'src/app/models/service-objects/service-object-group-modal-dto';

describe('ServiceObjectGroupModalComponent', () => {
  let component: ServiceObjectGroupModalComponent;
  let fixture: ComponentFixture<ServiceObjectGroupModalComponent>;
  let onConfirm: jest.Mock;
  let subscriptionUtilSubscribeToYesNoModalSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        ServiceObjectGroupModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
        MockNgSelectComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        MockProvider(V1TiersService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ServiceObjectGroupModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });
  beforeEach(() => {
    onConfirm = jest.fn();
    subscriptionUtilSubscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockReturnValue(new Subscription());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Initial Form State
  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('type should be required', () => {
    const type = component.form.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it('description should not be required', () => {
    const description = component.form.controls.description;
    expect(description.valid).toBeTruthy();
  });

  // Name validity
  it('name should be valid', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(3));
    expect(name.valid).toBeTruthy();
  });

  it('name should be invalid, min length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(2));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, max length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(101));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, invalid characters', () => {
    const name = component.form.controls.name;
    name.setValue('invalid/name!');
    expect(name.valid).toBeFalsy();
  });

  // Description Validity
  it('description should be valid (null)', () => {
    const description = component.form.controls.description;
    description.setValue(null);
    expect(description.valid).toBeTruthy();
  });

  it('description should be valid (minlen)', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(3));
    expect(description.valid).toBeTruthy();
  });

  it('description should be invalid, min length', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(2));
    expect(description.valid).toBeFalsy();
  });

  it('description should be invalid, max length', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(501));
    expect(description.valid).toBeFalsy();
  });

  describe('save', () => {
    it('should set submitted to true', () => {
      component.submitted = false;

      component.save();

      expect(component.submitted).toBeTruthy();
    });

    it('should do nothing if the form is invalid', () => {
      component.form.setErrors({ error: true });
      jest.spyOn(component['serviceObjectGroupService'], 'createOneServiceObjectGroup');
      jest.spyOn(component['serviceObjectGroupService'], 'updateOneServiceObjectGroup');

      component.save();

      expect(component['serviceObjectGroupService'].createOneServiceObjectGroup).not.toHaveBeenCalled();
      expect(component['serviceObjectGroupService'].updateOneServiceObjectGroup).not.toHaveBeenCalled();
    });

    describe('create mode', () => {
      beforeEach(() => {
        component.ModalMode = ModalMode.Create;
        component.form.setValue({ name: 'test', description: 'test', type: 'test' });
      });

      it('should create a new service object group', () => {
        component.save();

        expect(component['serviceObjectGroupService'].createOneServiceObjectGroup).toHaveBeenCalledWith({
          serviceObjectGroup: {
            name: 'test',
            description: 'test',
            type: 'test',
            tierId: component.TierId,
          },
        });
      });
    });

    describe('update mode', () => {
      beforeEach(() => {
        component.ModalMode = ModalMode.Edit;
        component.ServiceObjectGroupId = 'test-id';
        component.form.setValue({ name: 'test', description: 'test', type: 'test' });
      });

      it('should update an existing service object group', () => {
        component.save();

        expect(component['serviceObjectGroupService'].updateOneServiceObjectGroup).toHaveBeenCalledWith({
          id: 'test-id',
          serviceObjectGroup: {
            description: 'test',
          },
        });
      });
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
    expect(ngxSpy).toHaveBeenCalledWith('serviceObjectGroupModal');
  });

  it('should return correct form data', () => {
    const res = component.f;
    expect(res).toEqual(component.form.controls);
  });

  it('should call addServiceObjectToGroupServiceObjectGroupServiceObject', () => {
    component.ServiceObjectGroupId = 'test-id';
    component.selectedServiceObject = 'test-id' as any;
    jest
      .spyOn(component['serviceObjectGroupService'], 'addServiceObjectToGroupServiceObjectGroup')
      .mockReturnValue(of({ serviceObjects: [] } as any));

    component.addServiceObject();
    expect(component['serviceObjectGroupService'].addServiceObjectToGroupServiceObjectGroup).toHaveBeenCalled();
  });

  describe('service object operations', () => {
    it('should add service object to group', () => {
      const service = TestBed.inject(V1NetworkSecurityServiceObjectGroupsService);

      const addNetObjSpy = jest.spyOn(service, 'addServiceObjectToGroupServiceObjectGroup');
      const getGroupServiceObjectsSpy = jest.spyOn(component as any, 'getGroupServiceObjects');
      const getTierServiceObjectsSpy = jest.spyOn(component as any, 'getTierServiceObjects');

      component.ServiceObjectGroupId = 'groupId';
      component.selectedServiceObject = { id: 'objId', name: 'netObj1' } as any;
      component.addServiceObject();

      expect(addNetObjSpy).toHaveBeenCalledWith({ serviceObjectGroupId: 'groupId', serviceObjectId: 'objId' });
      expect(getGroupServiceObjectsSpy).toHaveBeenCalled();
      expect(getTierServiceObjectsSpy).toHaveBeenCalled();
    });

    it('should remove service object from group', () => {
      const service = TestBed.inject(V1NetworkSecurityServiceObjectGroupsService);

      const removeNetObjSpy = jest.spyOn(service, 'removeServiceObjectFromGroupServiceObjectGroup');
      const getGroupServiceObjectsSpy = jest.spyOn(component as any, 'getGroupServiceObjects');
      const getTierServiceObjectsSpy = jest.spyOn(component as any, 'getTierServiceObjects');

      component.ServiceObjectGroupId = 'groupId';
      const netObj = {
        id: 'objId',
        name: 'netObj1',
      } as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        return new Subscription();
      });

      component.removeServiceObject(netObj);

      expect(removeNetObjSpy).toHaveBeenCalledWith({ serviceObjectGroupId: 'groupId', serviceObjectId: 'objId' });
      expect(getGroupServiceObjectsSpy).toHaveBeenCalled();
      expect(getTierServiceObjectsSpy).toHaveBeenCalled();
    });
  });

  describe('getData', () => {
    const createServiceObjectGroupModalDto = (): ServiceObjectGroupModalDto => ({
      TierId: '1',
      ServiceObjectGroup: {
        tierId: '1',
        id: '2',
        name: 'ServiceObjectGroup',
        type: ServiceObjectGroupTypeEnum.Tcpudp,
      },
      ModalMode: ModalMode.Edit,
    });
    it('should disable the name when editing a service object group', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createServiceObjectGroupModalDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
    });
  });
});
