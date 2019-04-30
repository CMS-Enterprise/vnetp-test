// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectModalComponent } from './network-object-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule } from '@angular/forms';
import { NetworkObject } from 'src/app/models/network-object';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule ],
      declarations: [ NetworkObjectModalComponent ],
      providers: [ NgxSmartModalService]
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
    // FIXME: Set modal data in smart modal service and ensure that
    // component reads it.
    expect(component.networkObject).toBeTruthy();
  });

  it('save should set ngxModal data and recreate local network object', () => {
    component.networkObject.Name = 'Test';
    component.networkObject.IpAddress = '192.168.10.10';
    // FIXME: Check ngx smart modal service to ensure data was set.
    component.save();

    expect(component.networkObject.Name).toBeFalsy();
  });

  it('cancel should recreate network object', () => {
    component.networkObject = new NetworkObject();
    component.networkObject.Name = 'Test';
    component.cancel();

    expect(component.networkObject.Name).toBeFalsy();
  });
});
