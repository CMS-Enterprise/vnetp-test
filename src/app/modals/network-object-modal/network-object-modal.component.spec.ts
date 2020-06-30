// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule, HttpClientTestingModule],
      declarations: [NetworkObjectModalComponent, MockTooltipComponent, MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NetworkObjectModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have network object form', () => {
    expect(component.form).toBeTruthy();
  });

  // Initial Form State
  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('type should be required', () => {
    const type = component.form.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it('NAT type should not be required', () => {
    const natType = component.form.controls.natType;
    expect(natType.valid).toBeTruthy();
  });

  it('NAT direction should not be required', () => {
    const natDirection = component.form.controls.natDirection;
    expect(natDirection.valid).toBeTruthy();
  });

  it('hostAddress should not be required', () => {
    const ipAddress = component.form.controls.ipAddress;
    expect(ipAddress.valid).toBeTruthy();
  });

  it('startaddress should not be required', () => {
    const startIpAddress = component.form.controls.startIpAddress;
    expect(startIpAddress.valid).toBeTruthy();
  });

  it('endAddress should not be required', () => {
    const endIpAddress = component.form.controls.endIpAddress;
    expect(endIpAddress.valid).toBeTruthy();
  });

  it('source port should be not required', () => {
    const natSourcePort = component.form.controls.natSourcePort;
    expect(natSourcePort.valid).toBeTruthy();
  });

  it('destination port should not be required', () => {
    const natDestinationPort = component.form.controls.natTranslatedPort;
    expect(natDestinationPort.valid).toBeTruthy();
  });

  // Form State when Type: Host selected
  it('ipAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('IpAddress');
    const ipAddress = component.form.controls.ipAddress;
    expect(ipAddress.valid).toBeFalsy();
  });

  // Form State when Type: Range selected
  it('startAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('Range');
    const startIpAddress = component.form.controls.startIpAddress;
    expect(startIpAddress.valid).toBeFalsy();
  });

  it('endAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('Range');
    const endIpAddress = component.form.controls.endIpAddress;
    expect(endIpAddress.valid).toBeFalsy();
  });

  // Form State when NAT Selected
  it('translated address should be required', () => {
    const nat = component.form.controls.nat;
    nat.setValue(true);

    const translatedIpAddress = component.form.controls.translatedIpAddress;
    expect(translatedIpAddress.valid).toBeFalsy();
  });

  it('NAT type should be required', () => {
    const nat = component.form.controls.nat;
    nat.setValue(true);

    const natType = component.form.controls.natType;
    expect(natType.valid).toBeFalsy();
  });

  it('NAT direction should be required', () => {
    const nat = component.form.controls.nat;
    nat.setValue(true);

    const natDirection = component.form.controls.natDirection;
    expect(natDirection.valid).toBeFalsy();
  });

  // Form State when NAT Service Selected
  it('nat protocol should be required', () => {
    const natService = component.form.controls.natService;
    natService.setValue(true);

    const natProtocol = component.form.controls.natProtocol;
    expect(natProtocol.valid).toBeFalsy();
  });

  it('source port should be required', () => {
    const natService = component.form.controls.natService;
    natService.setValue(true);

    const natSourcePort = component.form.controls.natSourcePort;
    expect(natSourcePort.valid).toBeFalsy();
  });

  it('translated port should be required', () => {
    const natService = component.form.controls.natService;
    natService.setValue(true);

    const natDestinationPort = component.form.controls.natTranslatedPort;
    expect(natDestinationPort.valid).toBeFalsy();
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
