// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NetworkObject } from 'src/app/models/network-object';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule, ReactiveFormsModule],
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
    expect(component.networkObjectForm).toBeTruthy();
  });

  it('should read network object from service', () => {
    const modal = ngx.getModal('networkObjectModal')
    const networkObject = new NetworkObject();
    networkObject.Name = 'Test';
    networkObject.Type = 'host';
    networkObject.HostAddress = '1.1.1.1';

    modal.setData(networkObject);
    modal.open(); // FIXME: Isn't firing onOpen.

    expect(component.networkObjectForm).toBeTruthy();
  });

  it('save should set ngxModal data (Host)', () => {
    component.networkObjectForm.controls.name.setValue('Test');
    component.networkObjectForm.controls.type.setValue('host');
    component.networkObjectForm.controls.hostAddress.setValue('192.168.10.10/32');
    expect(component.networkObjectForm.valid).toBeTruthy();
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
    component.networkObjectForm.controls.name.setValue('Test');
    component.networkObjectForm.controls.type.setValue('range');
    component.networkObjectForm.controls.startAddress.setValue('192.168.10.10');
    component.networkObjectForm.controls.endAddress.setValue('192.168.10.11');
    expect(component.networkObjectForm.valid).toBeTruthy();
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
    component.networkObjectForm.controls.name.setValue('Test');
    component.networkObjectForm.controls.type.setValue('network');
    component.networkObjectForm.controls.cidrAddress.setValue('192.168.10.0/24');
    expect(component.networkObjectForm.valid).toBeTruthy();
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
    const name = component.networkObjectForm.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it ('type should be required', () =>  {
    const type = component.networkObjectForm.controls.type;
    expect(type.valid).toBeFalsy();
  });

  it ('hostAddress should not be required', () =>  {
    const hostAddress = component.networkObjectForm.controls.hostAddress;
    expect(hostAddress.valid).toBeTruthy();
  });

  it ('cidrAddress should not be required', () =>  {
    const cidrAddress = component.networkObjectForm.controls.cidrAddress;
    expect(cidrAddress.valid).toBeTruthy();
  });

  it ('startaddress should not be required', () =>  {
    const startAddress = component.networkObjectForm.controls.startAddress;
    expect(startAddress.valid).toBeTruthy();
  });

  it ('endAddress should not be required', () =>  {
    const endAddress = component.networkObjectForm.controls.endAddress;
    expect(endAddress.valid).toBeTruthy();
  });

  // Form State when Type: Host selected
  it ('hostAddress should be required', () => {
    const type = component.networkObjectForm.controls.type;
    type.setValue('host');
    const hostAddress = component.networkObjectForm.controls.hostAddress;
    expect(hostAddress.valid).toBeFalsy();
  });

  // Form State when Type: Range selected
  it ('startAddress should be required', () => {
    const type = component.networkObjectForm.controls.type;
    type.setValue('range');
    const startAddress = component.networkObjectForm.controls.startAddress;
    expect(startAddress.valid).toBeFalsy();
  });

  it ('endAddress should be required', () => {
    const type = component.networkObjectForm.controls.type;
    type.setValue('range');
    const endAddress = component.networkObjectForm.controls.endAddress;
    expect(endAddress.valid).toBeFalsy();
  });

  // Form State when Type: Network selected
  it ('cidrAddress should be required', () => {
    const type = component.networkObjectForm.controls.type;
    type.setValue('network');
    const cidrAddress = component.networkObjectForm.controls.cidrAddress;
    expect(cidrAddress.valid).toBeFalsy();
  });
});
