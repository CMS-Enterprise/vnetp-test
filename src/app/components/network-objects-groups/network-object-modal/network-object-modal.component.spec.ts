import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockProvider } from 'src/test/mock-providers';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [NetworkObjectModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NetworkObjectModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

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
    it('should be valid', () => {
      const name = getFormControl('name');
      name.setValue('a'.repeat(3));
      expect(name.valid).toBeTruthy();
    });

    it('should be invalid, min length', () => {
      const name = getFormControl('name');
      name.setValue('a'.repeat(2));
      expect(name.valid).toBeFalsy();
    });

    it('should be invalid, max length', () => {
      const name = getFormControl('name');
      name.setValue('a'.repeat(101));
      expect(name.valid).toBeFalsy();
    });

    it('should be invalid, invalid characters', () => {
      const name = getFormControl('name');
      name.setValue('invalid/name!');
      expect(name.valid).toBeFalsy();
    });
  });

  it('should have correct required and optional fields by default', () => {
    const requiredFields = ['name', 'type'];
    const optionalFields = ['natType', 'natDirection', 'ipAddress', 'startIpAddress', 'endIpAddress', 'natSourcePort', 'natTranslatedPort'];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  it('should require ip address when type is set to "IpAddress"', () => {
    const type = getFormControl('type');
    type.setValue('IpAddress');

    expect(isRequired('ipAddress')).toBe(true);
  });

  it('should require starting and ending ip address when type is set to "Range"', () => {
    const type = getFormControl('type');
    type.setValue('Range');

    expect(isRequired('startIpAddress')).toBe(true);
    expect(isRequired('endIpAddress')).toBe(true);
  });

  it('should require translated ip address, nat type and nat direction when nat is set to "true"', () => {
    const nat = getFormControl('nat');
    nat.setValue(true);

    expect(isRequired('translatedIpAddress')).toBe(true);
    expect(isRequired('natType')).toBe(true);
    expect(isRequired('natDirection')).toBe(true);
  });

  it('should require nat protocol, nat source port and nat translated port when nat service is set to "true"', () => {
    const natService = getFormControl('natService');
    natService.setValue(true);

    expect(isRequired('natProtocol')).toBe(true);
    expect(isRequired('natSourcePort')).toBe(true);
    expect(isRequired('natTranslatedPort')).toBe(true);
  });
});
