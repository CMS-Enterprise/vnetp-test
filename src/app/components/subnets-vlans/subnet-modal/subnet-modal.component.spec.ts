import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockNgSelectComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { SubnetModalComponent } from './subnet-modal.component';
import TestUtil from 'src/test/TestUtil';
import { By } from '@angular/platform-browser';
import { V1NetworkSubnetsService, V1NetworkVlansService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { NgSelectModule } from '@ng-select/ng-select';

describe('SubnetModalComponent', () => {
  let component: SubnetModalComponent;
  let fixture: ComponentFixture<SubnetModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule],
      declarations: [SubnetModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSubnetsService), MockProvider(V1NetworkVlansService)],
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
    expect(component.f.name).toBeTruthy();
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.name.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.name.value).toBe('');
  });

  it('should not call to create a subnet when the form is invalid', () => {
    const service = TestBed.inject(V1NetworkSubnetsService);
    const createSubnetSpy = jest.spyOn(service, 'createOneSubnet');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: null,
      description: 'Description',
      network: null,
      gateway: null,
      vlan: null,
      sharedBetweenVrfs: null,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createSubnetSpy).not.toHaveBeenCalled();
  });

  it('should call to create a subnet when in create mode', () => {
    const service = TestBed.inject(V1NetworkSubnetsService);
    const createSubnetSpy = jest.spyOn(service, 'createOneSubnet');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Test',
      description: 'Description',
      network: '255.255.255.255/32',
      gateway: '255.255.255.255',
      vlan: '3',
      sharedBetweenVrfs: true,
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
        sharedBetweenVrfs: true,
      },
    });
  });

  it('should call to edit an existing subnet when in edit mode', () => {
    const service = TestBed.inject(V1NetworkSubnetsService);
    const updateSubnetSpy = jest.spyOn(service, 'updateOneSubnet');

    component.ModalMode = ModalMode.Edit;
    component.form.setValue({
      name: 'Test',
      description: 'Description stays',
      network: '255.255.255.255/32',
      gateway: '255.255.255.255',
      vlan: '3',
      sharedBetweenVrfs: null,
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
        sharedBetweenVrfs: null,
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
          sharedBetweenVrfs: false,
        },
        Vlans: { data: [], count: 0, total: 0, page: 0, pageCount: 0 },
        ModalMode: ModalMode.Edit,
      };
    };

    it('should enable the name, gateway, network and vlan when creating a new subnet', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
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
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createSubnetModalDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
      expect(component.form.controls.gateway.disabled).toBe(true);
      expect(component.form.controls.network.disabled).toBe(true);
      expect(component.form.controls.vlan.disabled).toBe(true);
    });
  });
});
