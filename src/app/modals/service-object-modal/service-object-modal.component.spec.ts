// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { NgxMaskModule } from 'ngx-mask';
import { ServiceObjectModalComponent } from '../service-object-modal/service-object-modal.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';

describe('ServiceObjectModalComponent', () => {
  let component: ServiceObjectModalComponent;
  let fixture: ComponentFixture<ServiceObjectModalComponent>;

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
      declarations: [ServiceObjectModalComponent, TooltipComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ServiceObjectModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceObjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have service object form', () => {
    expect(component.form).toBeTruthy();
  });

  it('should read service object from service', () => {
    const modal = ngx.getModal('serviceObjectModal');
    const serviceObject = new ServiceObject();
    serviceObject.Name = 'Test';
    serviceObject.Type = 'tcp';
    serviceObject.SourcePort = '80';
    serviceObject.DestinationPort = '80';

    modal.setData(serviceObject);
    modal.open(); // FIXME: Isn't firing onOpen.

    expect(component.form).toBeTruthy();
  });

  it('save should set ngxModal data (Range)', () => {
    component.form.controls.name.setValue('Test');
    component.form.controls.type.setValue('tcp');
    component.form.controls.sourcePort.setValue('80');
    component.form.controls.destinationPort.setValue('80');
    expect(component.form.valid).toBeTruthy();
    component.save();

    // Get Data from the modal service
    const modal = ngx.getModal('serviceObjectModal');
    const data = modal.getData() as ServiceObject;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Test').toBeTruthy();
    expect(data.Type === 'tcp').toBeTruthy();
    expect(data.SourcePort === '80').toBeTruthy();
    expect(data.DestinationPort === '80').toBeTruthy();
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

  it('destinationPort should be required', () => {
    const destinationPort = component.form.controls.destinationPort;
    expect(destinationPort.valid).toBeFalsy();
  });

  it('sourcePort should be required', () => {
    const sourcePort = component.form.controls.sourcePort;
    expect(sourcePort.valid).toBeFalsy();
  });
});
