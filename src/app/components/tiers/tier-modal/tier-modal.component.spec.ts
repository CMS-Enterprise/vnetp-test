import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { TierModalComponent } from './tier-modal.component';
import TestUtil from 'src/test/TestUtil';
import { V1TiersService, V1TierGroupsService, TierGroup } from 'api_client';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';

describe('TierModalComponent', () => {
  let component: TierModalComponent;
  let fixture: ComponentFixture<TierModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [TierModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1TiersService), MockProvider(V1TierGroupsService)],
    });
    fixture = TestBed.createComponent(TierModalComponent);
    component = fixture.componentInstance;
    component.DatacenterId = '1';
    component.TierId = '2';
    component.ModalMode = ModalMode.Edit;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should be required', () => {
      expect(TestUtil.isFormControlRequired(component.form.controls.name)).toBe(true);
    });

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

  it('should return form controls', () => {
    expect(component.f.name).toBeTruthy();
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.name.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.name.value).toBe('');
  });

  it('should not call to create a tier when the form is invalid', () => {
    const service = TestBed.get(V1TiersService);
    const createTierSpy = jest.spyOn(service, 'v1TiersPost');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: '',
      description: 'Description',
      tierGroup: '2',
      tierType: 'Presentation',
      tierClass: 'Production',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createTierSpy).not.toHaveBeenCalled();
  });

  it('should call to create a tier when in create mode', () => {
    const service = TestBed.get(V1TiersService);
    const createTierSpy = jest.spyOn(service, 'v1TiersPost');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Test',
      description: 'Description',
      tierGroup: '2',
      tierType: 'Presentation',
      tierClass: 'Production',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createTierSpy).toHaveBeenCalledWith({
      tier: {
        name: 'Test',
        datacenterId: '1',
        description: 'Description',
        tierGroupId: '2',
        tierType: 'Presentation',
        tierClass: 'Production',
      },
    });
  });

  it('should call to edit an existing tier when in edit mode', () => {
    const service = TestBed.get(V1TiersService);
    const updateTierSpy = jest.spyOn(service, 'v1TiersIdPut');

    component.ModalMode = ModalMode.Edit;
    component.form.setValue({
      name: 'Test',
      description: 'Description',
      tierGroup: '2',
      tierType: 'Presentation',
      tierClass: 'Production',
    });

    const updateTierButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    updateTierButton.nativeElement.click();

    expect(updateTierSpy).toHaveBeenCalledWith({
      id: '2',
      tier: {
        name: null,
        datacenterId: null,
        description: 'Description',
        tierGroupId: '2',
        tierType: 'Presentation',
        tierClass: 'Production',
      },
    });
  });

  describe('getData', () => {
    const createTierModalDto = (): TierModalDto => {
      return {
        DatacenterId: '1',
        Tier: {
          id: '2',
          name: 'Tier',
          datacenterId: '1',
        },
        ModalMode: ModalMode.Edit,
      };
    };

    it('should enable the name field when creating a new tier', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      const dto = createTierModalDto();
      dto.Tier = undefined;
      dto.ModalMode = ModalMode.Create;
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => dto);

      component.getData();

      expect(component.form.controls.name.enabled).toBe(true);
    });

    it('should disable the name field when editing an existing tier', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createTierModalDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
    });

    it('should load tier groups when opening the modal', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createTierModalDto());
      const tierGroupsService = TestBed.get(V1TierGroupsService);
      const loadTierGroupsSpy = jest.spyOn(tierGroupsService, 'v1TierGroupsGet').mockImplementation(() => of([] as TierGroup[]));

      component.getData();

      expect(loadTierGroupsSpy).toHaveBeenCalledWith({
        filter: 'datacenterId||eq||1',
      });
    });
  });
});
