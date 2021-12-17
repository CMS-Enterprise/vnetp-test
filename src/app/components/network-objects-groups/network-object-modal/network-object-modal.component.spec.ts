import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkSecurityNetworkObjectsService } from 'client';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [NetworkObjectModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSecurityNetworkObjectsService)],
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

  it('should require fqdn when type is set to "Fqdn"', () => {
    const type = getFormControl('type');
    type.setValue('Fqdn');

    expect(isRequired('fqdn')).toBe(true);
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
