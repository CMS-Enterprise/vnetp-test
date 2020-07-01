import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NodeModalComponent } from './node-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NodeModalComponent', () => {
  let component: NodeModalComponent;
  let fixture: ComponentFixture<NodeModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [NodeModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NodeModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  // Initial Form State
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
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

  it('service port should be required', () => {
    const servicePort = component.form.controls.servicePort;
    expect(servicePort.valid).toBeFalsy();
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
});
