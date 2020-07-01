// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { SubnetModalComponent } from './subnet-modal.component';
import { TestUtil } from 'src/test/test.util';
import { By } from '@angular/platform-browser';
import { V1NetworkSubnetsService } from 'api_client';
import { of } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';

describe('SubnetModalComponent', () => {
  let component: SubnetModalComponent;
  let fixture: ComponentFixture<SubnetModalComponent>;
  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    const subnetService = {
      v1NetworkSubnetsIdPut: jest.fn(() => of({})),
      v1NetworkSubnetsPost: jest.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [SubnetModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
        { provide: V1NetworkSubnetsService, useValue: subnetService },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SubnetModalComponent);
        component = fixture.componentInstance;
        component.TierId = '1';
        component.SubnetId = '2';
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should be valid', () => {
      const name = component.form.controls.name;
      name.setValue('a'.repeat(3));
      expect(name.valid).toBeTruthy();
    });

    it('should be invalid, min length', () => {
      const name = component.form.controls.name;
      name.setValue('a'.repeat(2));
      expect(name.valid).toBeFalsy();
    });

    it('should be invalid, max length', () => {
      const name = component.form.controls.name;
      name.setValue('a'.repeat(101));
      expect(name.valid).toBeFalsy();
    });

    it('should be invalid, invalid characters', () => {
      const name = component.form.controls.name;
      name.setValue('invalid/name!');
      expect(name.valid).toBeFalsy();
    });
  });

  it('should require name, network, gateway and vlan', () => {
    const requiredFields = ['name', 'network', 'gateway', 'vlan'];

    requiredFields.forEach(f => {
      expect(TestUtil.isFormControlRequired(component.form.controls[f])).toBe(true);
    });
  });

  it('should not require description', () => {
    const optionalFields = ['description'];

    optionalFields.forEach(f => {
      expect(TestUtil.isFormControlRequired(component.form.controls[f])).toBe(false);
    });
  });

  it('should return form controls', () => {
    expect(component.f['name']).toBeTruthy();
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.name.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.name.value).toBe('');
  });

  it('should not call to create a subnet when the form is invalid', () => {
    const service = TestBed.get(V1NetworkSubnetsService);
    const createSubnetSpy = jest.spyOn(service, 'v1NetworkSubnetsPost').mockImplementation(() => of({}));

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: null,
      description: 'Description',
      network: null,
      gateway: null,
      vlan: null,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createSubnetSpy).not.toHaveBeenCalled();
  });

  it('should call to create a subnet when in create mode', () => {
    const service = TestBed.get(V1NetworkSubnetsService);
    const createSubnetSpy = jest.spyOn(service, 'v1NetworkSubnetsPost').mockImplementation(() => of({}));

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Test',
      description: 'Description',
      network: '255.255.255.255/32',
      gateway: '255.255.255.255',
      vlan: '3',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createSubnetSpy).toHaveBeenCalledWith({
      subnet: {
        name: 'Test',
        tierId: '1',
        description: 'Description',
        network: '255.255.255.255/32',
        gateway: '255.255.255.255',
        vlanId: '3',
      },
    });
  });

  it('should call to edit an existing subnet when in edit mode', () => {
    const service = TestBed.get(V1NetworkSubnetsService);
    const updateSubnetSpy = jest.spyOn(service, 'v1NetworkSubnetsIdPut').mockImplementation(() => of({}));

    component.ModalMode = ModalMode.Edit;
    component.form.setValue({
      name: 'Test',
      description: 'Description stays',
      network: '255.255.255.255/32',
      gateway: '255.255.255.255',
      vlan: '3',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateSubnetSpy).toHaveBeenCalledWith({
      id: '2',
      subnet: {
        name: null,
        tierId: null,
        description: 'Description stays',
        network: null,
        gateway: null,
        vlanId: null,
      },
    });
  });

  describe('getData', () => {
    const createSubnetModalDto = (): SubnetModalDto => {
      return {
        TierId: '1',
        Subnet: {
          id: '2',
          name: 'Subnet',
          network: '255.255.255.255/32',
          gateway: '255.255.255.255',
          vlanId: '3',
          tierId: '1',
        },
        Vlans: [],
        ModalMode: ModalMode.Edit,
      };
    };

    it('should throw an error if the modal mode is not set', () => {
      const dto = createSubnetModalDto();
      dto.ModalMode = null;
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => dto);
      const throwsError = () => component.getData();

      expect(throwsError).toThrowError('Modal Mode not Set.');
    });

    it('should enable the name, gateway, network and vlan when creating a new subnet', () => {
      const dto = createSubnetModalDto();
      dto.Subnet = undefined;
      dto.ModalMode = ModalMode.Create;
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => dto);

      component.getData();

      expect(component.form.controls.name.enabled).toBe(true);
      expect(component.form.controls.gateway.enabled).toBe(true);
      expect(component.form.controls.network.enabled).toBe(true);
      expect(component.form.controls.vlan.enabled).toBe(true);
    });

    it('should disable the name, gateway, network and vlan field when editing an existing subnet', () => {
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createSubnetModalDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
      expect(component.form.controls.gateway.disabled).toBe(true);
      expect(component.form.controls.network.disabled).toBe(true);
      expect(component.form.controls.vlan.disabled).toBe(true);
    });
  });
});
