// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { NgxMaskModule } from 'ngx-mask';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule],
      declarations: [ NetworkObjectModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators]
    })
    .compileComponents().then(() => {
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

  it('should read network object from service', () => {
    const modal = ngx.getModal('networkObjectModal');
    const networkObject = new NetworkObject();
    networkObject.Name = 'Test';
    networkObject.Type = 'host';
    networkObject.HostAddress = '1.1.1.1';

    modal.setData(networkObject);
    modal.open(); // FIXME: Isn't firing onOpen.

    expect(component.form).toBeTruthy();
  });

  it('save should set ngxModal data (Host)', () => {
    component.form.controls.name.setValue('Test');
    component.form.controls.type.setValue('host');
    component.form.controls.hostAddress.setValue('192.168.10.10');
    expect(component.form.valid).toBeTruthy();
    component.save();

    // Get Data from the modal service
    const modal = ngx.getModal('networkObjectModal');
    const data = modal.getData() as NetworkObject;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Test').toBeTruthy();
    expect(data.Type === 'host').toBeTruthy();
    expect(data.HostAddress = '192.168.10.10').toBeTruthy();
  });

  it('save should set ngxModal data (Range)', () => {
    component.form.controls.name.setValue('Test');
    component.form.controls.type.setValue('range');
    component.form.controls.startAddress.setValue('192.168.10.10');
    component.form.controls.endAddress.setValue('192.168.10.11');
    expect(component.form.valid).toBeTruthy();
    component.save();

    // Get Data from the modal service
    const modal = ngx.getModal('networkObjectModal');
    const data = modal.getData() as NetworkObject;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Test').toBeTruthy();
    expect(data.Type === 'range').toBeTruthy();
    expect(data.EndAddress = '192.168.10.10').toBeTruthy();
    expect(data.StartAddress = '192.168.10.11').toBeTruthy();
  });

  it('save should set ngxModal data (Network)', () => {
    component.form.controls.name.setValue('Test');
    component.form.controls.type.setValue('network');
    component.form.controls.cidrAddress.setValue('192.168.10.0/24');
    expect(component.form.valid).toBeTruthy();
    component.save();

    // Get Data from the modal service
    const modal = ngx.getModal('networkObjectModal');
    const data = modal.getData() as NetworkObject;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Test').toBeTruthy();
    expect(data.Type === 'network').toBeTruthy();
    expect(data.CidrAddress = '192.168.10.0/24').toBeTruthy();
  });

  // Initial Form State
  it ('name should be required', () =>  {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it ('type should be required', () =>  {
    const type = component.form.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it ('source subnet should be required', () => {
    const sourceSubnet = component.form.controls.sourceSubnet;
    expect(sourceSubnet.valid).toBeFalsy();
  });

  it ('destination subnet should not be required', () => {
    const destinationSubnet = component.form.controls.destinationSubnet;
    expect(destinationSubnet.valid).toBeTruthy();
  });

  it ('hostAddress should not be required', () =>  {
    const hostAddress = component.form.controls.hostAddress;
    expect(hostAddress.valid).toBeTruthy();
  });

  it ('cidrAddress should not be required', () =>  {
    const cidrAddress = component.form.controls.cidrAddress;
    expect(cidrAddress.valid).toBeTruthy();
  });

  it ('startaddress should not be required', () =>  {
    const startAddress = component.form.controls.startAddress;
    expect(startAddress.valid).toBeTruthy();
  });

  it ('endAddress should not be required', () =>  {
    const endAddress = component.form.controls.endAddress;
    expect(endAddress.valid).toBeTruthy();
  });

  // Form State when Type: Host selected
  it ('hostAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('host');
    const hostAddress = component.form.controls.hostAddress;
    expect(hostAddress.valid).toBeFalsy();
  });

  // Form State when Type: Range selected
  it ('startAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('range');
    const startAddress = component.form.controls.startAddress;
    expect(startAddress.valid).toBeFalsy();
  });

  it ('endAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('range');
    const endAddress = component.form.controls.endAddress;
    expect(endAddress.valid).toBeFalsy();
  });

  // Form State when Type: Subnet selected
  it ('cidrAddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('subnet');
    const cidrAddress = component.form.controls.cidrAddress;
    expect(cidrAddress.valid).toBeFalsy();
  });

  // Form State when NAT Selected
  it('translated address should be required', () => {
    const nat = component.form.controls.nat;
    nat.setValue(true);

    const translatedAddress = component.form.controls.translatedIp;
    expect(translatedAddress.valid).toBeFalsy();
  });

  it('destination subnet should be required', () => {
  const nat = component.form.controls.nat;
  nat.setValue(true);

  const destinationSubnet = component.form.controls.destinationSubnet;
  expect(destinationSubnet.valid).toBeFalsy();
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

    const sourcePort = component.form.controls.sourcePort;
    expect(sourcePort.valid).toBeFalsy();
  });

  it('translated port should be required', () => {
    const natService = component.form.controls.natService;
    natService.setValue(true);

    const translatedPort = component.form.controls.translatedPort;
    expect(translatedPort.valid).toBeFalsy();
  });
});
