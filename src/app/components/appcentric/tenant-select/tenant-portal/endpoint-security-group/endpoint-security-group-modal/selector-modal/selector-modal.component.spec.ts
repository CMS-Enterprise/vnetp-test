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

describe('SelectorModalComponent', () => {
  let component: SelectorModalComponent;
  let fixture: ComponentFixture<SelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
        { provide: NgxSmartModalService, useValue: jest.fn() },
        // { provide: V2AppCentricSelectorsService, useValue: jest.fn() },
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

  // const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  // const isRequired = (prop: string): boolean => {
  //   const fc = getFormControl(prop);
  //   fc.setValue(null);
  //   return !!fc.errors && !!fc.errors.required;
  // };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should require tagKey, valueOperator, and tagValue when navIndex is 0, all others should be false', () => {
  //   component.navIndex = 0;
  //   component.setFormValidators();

  //   expect(isRequired('tagKey')).toBe(true);
  //   expect(isRequired('valueOperator')).toBe(true);
  //   expect(isRequired('tagValue')).toBe(true);

  //   expect(isRequired('epgId')).toBe(false);
  //   expect(isRequired('IpSubnet')).toBe(false);
  //   expect(isRequired('description')).toBe(false);
  // });

  // it('should require epgId when navIndex is 1, all others should be false', () => {
  //   component.navIndex = 1;
  //   component.setFormValidators();

  //   expect(isRequired('epgId')).toBe(true);

  //   expect(isRequired('tagKey')).toBe(false);
  //   expect(isRequired('valueOperator')).toBe(false);
  //   expect(isRequired('tagValue')).toBe(false);
  //   expect(isRequired('IpSubnet')).toBe(false);
  //   expect(isRequired('description')).toBe(false);
  // });

  // it('should require IpSubnet when navIndex is 2, all others should be false', () => {
  //   component.navIndex = 2;
  //   component.setFormValidators();

  //   expect(isRequired('IpSubnet')).toBe(true);

  //   expect(isRequired('tagKey')).toBe(false);
  //   expect(isRequired('valueOperator')).toBe(false);
  //   expect(isRequired('tagValue')).toBe(false);
  //   expect(isRequired('epgId')).toBe(false);
  //   expect(isRequired('description')).toBe(false);
  // });

  // it('should save the form and set correct values', () => {
  //   component.endpointSecurityGroupId = '123';

  //   const { tagKey, valueOperator, tagValue } = component.form.controls;

  //   const createSelectorSpy = jest.spyOn(component.selectorService, 'createOneSelector');
  //   component.navIndex = 0;

  //   component.setFormValidators();
  //   tagKey.setValue('someTagKey');
  //   valueOperator.setValue('Contains');
  //   tagValue.setValue('someTagValue');

  //   component.save();
  //   expect(component.selector.selectorType).toBe('Tag');
  //   expect(component.selector.valueOperator).toBe('Contains');
  //   expect(component.selector.tagValue).toBe('someTagValue');

  //   expect(createSelectorSpy).toHaveBeenCalledWith({ selector: component.selector });
  // });
});
