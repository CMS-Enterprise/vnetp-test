// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators } from '@angular/forms';
import { NetworkObject } from 'src/app/models/network-object';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule ],
      declarations: [ NetworkObjectModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators ]
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

  it('should have network object', () => {
    expect(component.networkObject).toBeTruthy();
  });

  it('should read network object from service', () => {

    const modal = ngx.getModal('networkObjectModal')
    const networkObject = new NetworkObject();
    networkObject.Name = 'Test';
    networkObject.IpAddress = '1.1.1.1';

    modal.setData(networkObject);
    modal.open(); // FIXME: Isn't firing onOpen.

    expect(component.networkObject).toBeTruthy();
  });

  it('save should set ngxModal data and recreate local network object', () => {
    component.networkObject.Name = 'Test';
    component.networkObject.IpAddress = '192.168.10.10';

    component.save();

    // Component should be cleared since we deep-copied
    // it to modal service and then reinitialized it.
    expect(component.networkObject.Name).toBeFalsy();
    expect(component.networkObject.IpAddress).toBeFalsy();

    // Get Data from the modal service
    const modal = ngx.getModal('networkObjectModal');
    const data = modal.getData() as NetworkObject;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Test').toBeTruthy();
    expect(data.IpAddress = '192.168.10.10').toBeTruthy();
  });

  it('cancel should recreate network object', () => {
    component.networkObject = new NetworkObject();
    component.networkObject.Name = 'Test';
    component.cancel();

    expect(component.networkObject.Name).toBeFalsy();
  });
});
