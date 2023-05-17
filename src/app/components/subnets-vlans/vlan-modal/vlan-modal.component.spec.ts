import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { VlanModalComponent } from './vlan-modal.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import TestUtil from 'src/test/TestUtil';
import { By } from '@angular/platform-browser';
import { V1NetworkVlansService, VlanVcdVlanTypeEnum } from 'client';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';

describe('VlanModalComponent', () => {
  let component: VlanModalComponent;
  let fixture: ComponentFixture<VlanModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [VlanModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
        providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkVlansService)],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(VlanModalComponent);
          component = fixture.componentInstance;
          component.TierId = '1';
          component.VlanId = '2';
          fixture.detectChanges();
        });
    }),
  );

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

  it('should require name and vlan number', () => {
    const requiredFields = ['name', 'vlanNumber'];

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

  describe('save', () => {
    const clickSaveButton = () => fixture.debugElement.query(By.css('.btn.btn-success')).nativeElement.click();

    it('should not create a vlan when the form is invalid', () => {
      const service = TestBed.inject(V1NetworkVlansService);
      const createVlanSpy = jest.spyOn(service, 'createOneVlan');

      component.ModalMode = ModalMode.Create;
      component.form.setValue({
        name: null,
        description: 'Description',
        vlanNumber: null,
        vcdVlanType: '3',
      });

      clickSaveButton();

      expect(createVlanSpy).not.toHaveBeenCalled();
    });

    it('should create a vlan when in create mode', () => {
      const service = TestBed.inject(V1NetworkVlansService);
      const createVlanSpy = jest.spyOn(service, 'createOneVlan');

      component.ModalMode = ModalMode.Create;
      component.form.setValue({
        name: 'Test',
        description: 'Description',
        vlanNumber: 400,
        vcdVlanType: VlanVcdVlanTypeEnum.Dev,
      });

      clickSaveButton();

      expect(createVlanSpy).toHaveBeenCalledWith({
        vlan: {
          name: 'Test',
          tierId: '1',
          description: 'Description',
          vlanNumber: 400,
          vcdVlanType: VlanVcdVlanTypeEnum.Dev,
        },
      });
    });

    it('should edit an existing vlan when in edit mode', () => {
      const service = TestBed.inject(V1NetworkVlansService) as any;
      const updateVlanSpy = jest.spyOn(service, 'updateOneVlan');

      component.ModalMode = ModalMode.Edit;
      component.form.setValue({
        name: 'Test2',
        description: 'Description stays',
        vlanNumber: 401,
        vcdVlanType: 'Dev',
      });

      clickSaveButton();

      expect(updateVlanSpy).toHaveBeenCalledWith({
        id: '2',
        vlan: {
          name: null,
          vlanNumber: null,
          description: 'Description stays',
          vcdVlanType: 'Dev',
        },
      });
    });
  });

  describe('getData', () => {
    const createDto = (): VlanModalDto => {
      return {
        TierId: '1',
        Vlan: {
          tierId: '1',
          id: '2',
          name: 'Vlan',
          vlanNumber: 400,
          vcdVlanType: VlanVcdVlanTypeEnum.Dev,
          description: 'Optional!',
        },
        ModalMode: ModalMode.Edit,
      };
    };

    it('should enable the name and vlan number when creating a new vlan', () => {
      const service = TestBed.inject(NgxSmartModalService);
      const dto = createDto();
      dto.Vlan = undefined;
      dto.ModalMode = ModalMode.Create;
      jest.spyOn(service, 'getModalData').mockImplementation(() => dto);

      component.getData();

      expect(component.form.controls.name.enabled).toBe(true);
      expect(component.form.controls.vlanNumber.enabled).toBe(true);
    });

    it('should disable the name and vlan number when editing an existing vlan', () => {
      const service = TestBed.inject(NgxSmartModalService);
      jest.spyOn(service, 'getModalData').mockImplementation(() => createDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
      expect(component.form.controls.vlanNumber.disabled).toBe(true);
    });
  });
});
