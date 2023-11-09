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
import { V1NetworkSecurityServiceObjectGroupsService, V1TiersService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { of, Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

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
            name: 'test',
            description: 'test',
            type: null,
          },
        });
      });
    });
  });

  it('should call the reset function when the cancelled', () => {
    jest.spyOn(component, 'reset');
    component.cancel();
    expect(component.reset).toHaveBeenCalled();
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
});
