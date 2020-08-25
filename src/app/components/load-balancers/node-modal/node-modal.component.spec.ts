import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NodeModalComponent } from './node-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1LoadBalancerPoolsService, V1LoadBalancerNodesService } from 'api_client';

describe('NodeModalComponent', () => {
  let component: NodeModalComponent;
  let fixture: ComponentFixture<NodeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [NodeModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerPoolsService), MockProvider(V1LoadBalancerNodesService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NodeModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('type should be required', () => {
    const type = component.form.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it('ip address should not be required', () => {
    const ipAddress = component.form.controls.ipAddress;
    expect(ipAddress.valid).toBeTruthy();
  });

  it('fqdn should not be required', () => {
    const fqdn = component.form.controls.fqdn;
    expect(fqdn.valid).toBeTruthy();
  });

  it('auto populate should not be required', () => {
    const autoPopulate = component.form.controls.autoPopulate;
    expect(autoPopulate.valid).toBeTruthy();
  });

  // Form State when Type: FQDN selected
  it('ipaddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('IpAddress');
    const ipAddress = component.form.controls.ipAddress;
    expect(ipAddress.valid).toBeFalsy();
  });

  // Form State when Type: FQDN selected
  it('fqdn should be required', () => {
    const type = component.form.controls.type;
    type.setValue('Fqdn');
    const fqdn = component.form.controls.fqdn;
    expect(fqdn.valid).toBeFalsy();
  });

  describe('Name', () => {
    it('should be required', () => {
      const name = component.form.controls.name;
      expect(name.valid).toBeFalsy();
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
});
