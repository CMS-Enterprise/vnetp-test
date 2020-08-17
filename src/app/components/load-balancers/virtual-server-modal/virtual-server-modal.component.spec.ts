import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualServerModalComponent } from './virtual-server-modal.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1LoadBalancerVirtualServersService, V1TiersService } from 'api_client';

describe('VirtualServerModalComponent', () => {
  let component: VirtualServerModalComponent;
  let fixture: ComponentFixture<VirtualServerModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        VirtualServerModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerVirtualServersService), MockProvider(V1TiersService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(VirtualServerModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

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

  it('type should be required', () => {
    const type = component.form.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it('source address should not be required', () => {
    const sourceAddress = component.form.controls.sourceAddress;
    expect(sourceAddress.valid).toBeTruthy();
  });

  it('destination address should be required', () => {
    const destinationAddress = component.form.controls.destinationAddress;
    expect(destinationAddress.valid).toBeFalsy();
  });

  it('service port should be required', () => {
    const servicePort = component.form.controls.servicePort;
    expect(servicePort.valid).toBeFalsy();
  });
});
