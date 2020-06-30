import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { HealthMonitorModalComponent } from './health-monitor-modal.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HealthMonitorModalComponent', () => {
  let component: HealthMonitorModalComponent;
  let fixture: ComponentFixture<HealthMonitorModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot(), HttpClientTestingModule],
      declarations: [HealthMonitorModalComponent, TooltipComponent, MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HealthMonitorModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthMonitorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('service port should be required', () => {
    const servicePort = component.form.controls.servicePort;
    expect(servicePort.valid).toBeFalsy();
  });

  it('interval should be required', () => {
    const interval = component.form.controls.interval;
    expect(interval.valid).toBeFalsy();
  });

  it('timeout should be required', () => {
    const timeout = component.form.controls.timeout;
    expect(timeout.valid).toBeFalsy();
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
