import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplianceModalComponent } from './appliance-modal.component';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { Appliance, V1AppliancesService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { of } from 'rxjs';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';

describe('ApplianceModalComponent', () => {
  let component: ApplianceModalComponent;
  let fixture: ComponentFixture<ApplianceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ApplianceModalComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1AppliancesService)],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  describe('save', () => {
    beforeEach(() => {
      component.ModalMode = ModalMode.Create;
      component.DatacenterId = 'datacenter-id';
    });

    it('should return early if the form is invalid', () => {
      // Arrange
      const invalidForm = component.form;
      invalidForm.setErrors({ invalid: true });
      component.form = invalidForm;

      // Act
      component.save();

      // Assert
      expect(component.submitted).toBe(true);
    });

    // it('should create appliance if ModalMode is Create', () => {
    //   // Arrange
    //   component.ModalMode = ModalMode.Create;
    //   component.form.setValue({
    //     name: 'TestAppliance',
    //     description: 'Test Appliance Description',
    //     rackUnits: 1,
    //     serialNumber: '1234',
    //     deliveryDate: '2022-01-01',
    //     localStorageType: 'SSD',
    //     localStorageRequired: 'true',
    //     localStorageSize: 100,
    //     sanType: 'FibreChannel',
    //     sanRequired: 'true',
    //     sanStorageSize: 100,
    //     powerSupplyVoltage: 110,
    //     powerSupplyWattage: 500,
    //     powerSupplyConnectionType: 'C20',
    //     powerSupplyCount: 2,
    //   });

    //   const appliance = {
    //     name: 'TestAppliance',
    //     description: 'Test Appliance Description',
    //     rackUnits: 1,
    //     serialNumber: '1234',
    //     deliveryDate: '2022-01-01',
    //     localStorageType: 'SSD',
    //     localStorageRequired: true,
    //     localStorageSize: 100 * 1024 * 1024 * 1024,
    //     sanType: 'FibreChannel',
    //     sanRequired: true,
    //     sanStorageSize: 100 * 1024 * 1024 * 1024,
    //     powerSupplyVoltage: 110,
    //     powerSupplyWattage: 500,
    //     powerSupplyConnectionType: 'C20',
    //     powerSupplyCount: 2,
    //     datacenterId: 'test-datacenter-id',
    //   };
    //   component.DatacenterId = 'test-datacenter-id';

    //   const applianceServiceSpy = jest
    //     .spyOn(component['applianceService'], 'createOneAppliance')
    //     .mockReturnValue(of(new HttpResponse({ status: 200, body: {} }) as HttpEvent<Appliance>));

    //   // Act
    //   component.save();

    //   // Assert
    //   expect(component.submitted).toBe(true);
    //   expect(component.form.valid).toBe(true);
    //   expect(applianceServiceSpy).toHaveBeenCalledWith({ appliance });
    // });
  });
});
