// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { PoolMemberModalComponent } from './pool-member-modal.component';

describe('PoolMemberModalComponent', () => {
  let component: PoolMemberModalComponent;
  let fixture: ComponentFixture<PoolMemberModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
      declarations: [ PoolMemberModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(PoolMemberModalComponent);
      component = fixture.componentInstance;
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolMemberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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
  it ('ipaddress should be required', () => {
    const type = component.form.controls.type;
    type.setValue('ipaddress');
    const ipAddress = component.form.controls.ipAddress;
    expect(ipAddress.valid).toBeFalsy();
  });

  // Form State when Type: FQDN selected
  it ('fqdn should be required', () => {
    const type = component.form.controls.type;
    type.setValue('fqdn');
    const fqdn = component.form.controls.fqdn;
    expect(fqdn.valid).toBeFalsy();
  });
});
