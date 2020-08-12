import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { VirtualServerModalComponent } from './virtual-server-modal.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
} from 'src/test/mock-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockProvider } from 'src/test/mock-providers';

describe('VirtualServerModalComponent', () => {
  let component: VirtualServerModalComponent;
  let fixture: ComponentFixture<VirtualServerModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        VirtualServerModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), FormBuilder, Validators],
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

  // Intial Form State
  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('description should not be required', () => {
    const description = component.form.controls.description;
    expect(description.valid).toBeTruthy();
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

  // Name validity
  it('name should be valid', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(3));
    expect(name.valid).toBeTruthy();
  });

  it('name should be invalid, min length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(2));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, max length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(101));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, invalid characters', () => {
    const name = component.form.controls.name;
    name.setValue('invalid/name!');
    expect(name.valid).toBeFalsy();
  });

  // Description Validity
  it('description should be valid (null)', () => {
    const description = component.form.controls.description;
    description.setValue(null);
    expect(description.valid).toBeTruthy();
  });

  it('description should be valid (minlen)', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(3));
    expect(description.valid).toBeTruthy();
  });

  it('description should be invalid, min length', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(2));
    expect(description.valid).toBeFalsy();
  });

  it('description should be invalid, max length', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(501));
    expect(description.valid).toBeFalsy();
  });
});
