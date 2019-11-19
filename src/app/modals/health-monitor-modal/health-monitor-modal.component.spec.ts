import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { HealthMonitorModalComponent } from './health-monitor-modal.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';

describe('HealthMonitorModalComponent', () => {
  let component: HealthMonitorModalComponent;
  let fixture: ComponentFixture<HealthMonitorModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
      ],
      declarations: [HealthMonitorModalComponent, TooltipComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
      ],
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
});
