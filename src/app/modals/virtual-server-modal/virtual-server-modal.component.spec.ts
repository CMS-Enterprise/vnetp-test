import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { VirtualServerModalComponent } from './virtual-server-modal.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

describe('VirtualServerModalComponent', () => {
  let component: VirtualServerModalComponent;
  let fixture: ComponentFixture<VirtualServerModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot(), AngularFontAwesomeModule],
      declarations: [ VirtualServerModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(VirtualServerModalComponent);
      component = fixture.componentInstance;
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualServerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  it('pool should be required', () => {
    const pool = component.form.controls.pool;
    expect(pool.valid).toBeFalsy();
  });
});
