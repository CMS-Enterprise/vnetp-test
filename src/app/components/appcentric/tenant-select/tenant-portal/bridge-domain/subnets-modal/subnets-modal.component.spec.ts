import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { SubnetsModalComponent } from './subnets-modal.component';

describe('SubnetsModalComponent', () => {
  let component: SubnetsModalComponent;
  let fixture: ComponentFixture<SubnetsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubnetsModalComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubnetsModalComponent);
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
    const requiredFields = ['name', 'gatewayIp'];
    const optionalFields = [
      'alias',
      'description',
      'treatAsVirtualIpAddress',
      'primaryIpAddress',
      'advertisedExternally',
      'preferred',
      'sharedBetweenVrfs',
      'ipDataPlaneLearning',
    ];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  describe('gatewayIp', () => {
    it('should have proper IP CIDR notation', () => {
      const { gatewayIp } = component.form.controls;

      gatewayIp.setValue('192.168.1.0/24');
      expect(gatewayIp.valid).toBe(true);

      gatewayIp.setValue('192.168.1.0/abc');
      expect(gatewayIp.valid).toBe(false);

      gatewayIp.setValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334/64');
      expect(gatewayIp.valid).toBe(true);

      gatewayIp.setValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334/xyz');
      expect(gatewayIp.valid).toBe(false);
    });
  });
});
