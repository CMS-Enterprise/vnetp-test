import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { FilterEntryModalComponent } from './filter-entry-modal.component';

describe('FilterEntryModalComponent', () => {
  let component: FilterEntryModalComponent;
  let fixture: ComponentFixture<FilterEntryModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FilterEntryModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule, NgSelectModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEntryModalComponent);
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

  describe('alias', () => {
    it('should have a maximum length of 100', () => {
      const { alias } = component.form.controls;

      alias.setValue('a');
      expect(alias.valid).toBe(true);

      alias.setValue('a'.repeat(101));
      expect(alias.valid).toBe(false);
    });
  });

  describe('description', () => {
    it('should have a maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });

  it('should have correct required and optional fields by default', () => {
    const requiredFields = ['name'];
    const optionalFields = [
      'alias',
      'description',
      'etherType',
      'arpFlag',
      'ipProtocol',
      'matchOnlyFragments',
      'sourceFromPort',
      'sourceToPort',
      'destinationFromPort',
      'destinationToPort',
      'tcpFlags',
      'stateful',
    ];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  describe('sourceFromPort', () => {
    it('it should be minimum of 0 and maximum of 65535', () => {
      const { sourceFromPort } = component.form.controls;

      sourceFromPort.setValue(0);
      expect(sourceFromPort.valid).toBe(true);

      sourceFromPort.setValue(-1);
      expect(sourceFromPort.valid).toBe(false);

      sourceFromPort.setValue(65536);
      expect(sourceFromPort.valid).toBe(false);
    });
  });

  describe('sourceToPort', () => {
    it('it should be minimum of 0 and maximum of 65535', () => {
      const { sourceToPort } = component.form.controls;

      sourceToPort.setValue(0);
      expect(sourceToPort.valid).toBe(true);

      sourceToPort.setValue(-1);
      expect(sourceToPort.valid).toBe(false);

      sourceToPort.setValue(65536);
      expect(sourceToPort.valid).toBe(false);
    });
  });

  describe('destinationFromPort', () => {
    it('it should be minimum of 0 and maximum of 65535', () => {
      const { destinationFromPort } = component.form.controls;

      destinationFromPort.setValue(0);
      expect(destinationFromPort.valid).toBe(true);

      destinationFromPort.setValue(-1);
      expect(destinationFromPort.valid).toBe(false);

      destinationFromPort.setValue(65536);
      expect(destinationFromPort.valid).toBe(false);
    });
  });

  describe('destinationToPort', () => {
    it('it should be minimum of 0 and maximum of 65535', () => {
      const { destinationToPort } = component.form.controls;

      destinationToPort.setValue(0);
      expect(destinationToPort.valid).toBe(true);

      destinationToPort.setValue(-1);
      expect(destinationToPort.valid).toBe(false);

      destinationToPort.setValue(65536);
      expect(destinationToPort.valid).toBe(false);
    });
  });
});
