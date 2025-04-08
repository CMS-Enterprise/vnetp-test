/* eslint-disable */
import { MockComponent, MockFontAwesomeComponent, MockImportExportComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { SelectorModalComponent } from './selector-modal.component';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V2AppCentricEndpointSecurityGroupsService, V2AppCentricSelectorsService } from 'client';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockProvider } from 'src/test/mock-providers';
import { By } from '@angular/platform-browser';

describe('SelectorModalComponent', () => {
  let component: SelectorModalComponent;
  let fixture: ComponentFixture<SelectorModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockComponent({ selector: 'app-tabs', inputs: ['tabs'] }),
        SelectorModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockImportExportComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({ selector: 'app-selector-modal', inputs: ['tenantId', 'endpointSecurityGroupId'] }),
      ],
      providers: [
        { provide: FormBuilder, useValue: jest.fn() },
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricSelectorsService),
        { provide: V2AppCentricEndpointSecurityGroupsService, useValue: jest.fn() },
        MockProvider(V2AppCentricSelectorsService),
      ],
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule, HttpClientModule, RouterModule.forRoot([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form field validation', () => {
    it('should require tagKey, valueOperator, and tagValue when navIndex is 0, all others should be false', () => {
      component.navIndex = 0;
      component.setFormValidators();

      // expectations
      expect(isRequired('tagKey')).toBe(true);
      expect(isRequired('valueOperator')).toBe(true);
      expect(isRequired('tagValue')).toBe(true);

      expect(isRequired('epgId')).toBe(false);
      expect(isRequired('IpSubnet')).toBe(false);
      expect(isRequired('description')).toBe(false);
    });

    it('should require epgId when navIndex is 1, all others should be false', () => {
      component.navIndex = 1;
      component.setFormValidators();

      // expectations
      expect(isRequired('epgId')).toBe(true);
      expect(isRequired('tagKey')).toBe(false);
      expect(isRequired('valueOperator')).toBe(false);
      expect(isRequired('tagValue')).toBe(false);
      expect(isRequired('IpSubnet')).toBe(false);
      expect(isRequired('description')).toBe(false);
    });

    it('should require IpSubnet when navIndex is 2, all others should be false', () => {
      component.navIndex = 2;
      component.setFormValidators();

      // expectations
      expect(isRequired('IpSubnet')).toBe(true);
      expect(isRequired('tagKey')).toBe(false);
      expect(isRequired('valueOperator')).toBe(false);
      expect(isRequired('tagValue')).toBe(false);
      expect(isRequired('epgId')).toBe(false);
      expect(isRequired('description')).toBe(false);
    });
  });

  describe('closing modal functions', () => {
    it('should call ngx.close with the correct argument when cancelled', () => {
      const ngx = component['ngx'];

      const ngxSpy = jest.spyOn(ngx, 'close');

      component['reset']();

      expect(ngxSpy).toHaveBeenCalledWith('selectorModal');
    });

    it('should reset the form when closing the modal', () => {
      component.form.controls.description.setValue('Test');

      jest.spyOn(component, 'reset');
      const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
      cancelButton.nativeElement.click();

      expect(component.form.controls.description.value).toBe(null);
      expect(component.reset).toHaveBeenCalled();
    });
  });

  describe('create different Selectors', () => {
    it('should save form and call to create to create an EPG Selector', () => {
      component.endpointSecurityGroupId = '123';
      component.selector = { selectorType: 'Tag' };
      const createSelectorSpy = jest.spyOn(component.selectorService, 'createOneSelector');
      jest.spyOn(component, 'reset');
      const getOneEpg = jest.spyOn(component['endpointGroupService'], 'getOneEndpointGroup');

      component.navIndex = 1;
      component.selector = { selectorType: 'EPG' };
      component.setFormValidators();

      const { epgId } = component.form.controls;
      epgId.setValue('epgId-123');

      component.save();
      expect(component.selector.epgId).toBe('epgId-123');

      expect(createSelectorSpy).toHaveBeenCalledWith({ selector: component.selector });
      expect(component.reset).toHaveBeenCalled();
    });

    it('should save form and call to create a Tag Selector', () => {
      component.endpointSecurityGroupId = '123';
      component.selector = { selectorType: 'Tag' };
      const { tagKey, valueOperator, tagValue } = component.form.controls;
      const createSelectorSpy = jest.spyOn(component.selectorService, 'createOneSelector');

      component.navIndex = 0;

      component.setFormValidators();

      tagKey.setValue('someTagKey');
      valueOperator.setValue('Contains');
      tagValue.setValue('someTagValue');

      component.selector = { selectorType: 'IpSubnet' };
      jest.spyOn(component, 'reset');

      component.save();

      // expectations
      expect(component.selector.selectorType).toBe('Tag');
      expect(component.selector.valueOperator).toBe('Contains');
      expect(component.selector.tagValue).toBe('someTagValue');
      expect(createSelectorSpy).toHaveBeenCalledWith({ selector: component.selector });
      expect(component.reset).toHaveBeenCalled();
    });
  });

  describe('getData', () => {
    const createSelectorDto = () => ({
      selector: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createSelectorDto());
      jest.spyOn(component, 'getEndpointGroups');

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
      expect(component.getEndpointGroups).toHaveBeenCalled();
    });
  });
});
