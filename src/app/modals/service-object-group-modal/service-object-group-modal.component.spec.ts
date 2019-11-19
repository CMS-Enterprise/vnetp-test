import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal.component';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';

describe('ServiceObjectGroupModalComponent', () => {
  let component: ServiceObjectGroupModalComponent;
  let fixture: ComponentFixture<ServiceObjectGroupModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        NgxSmartModalModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ServiceObjectGroupModalComponent, TooltipComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have service object group form', () => {
    expect(component.form).toBeTruthy();
  });

  it('save should set ngxModal data', () => {
    component.form.controls.name.setValue('Name');
    component.form.controls.description.setValue('Description');
    component.form.controls.type.setValue(true);
    component.serviceObjects.push({ Name: 'Test' } as ServiceObject);
    expect(component.form.valid).toBeTruthy();
    component.save();

    // Get Data from the modal service
    const modal = ngx.getModal('serviceObjectGroupModal');
    const data = modal.getData() as ServiceObjectGroup;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Name').toBeTruthy();
    expect(data.Description === 'Description').toBeTruthy();
    expect(data.ServiceObjects[0].Name === 'Test').toBeTruthy();
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

  it('description should not be required', () => {
    const description = component.form.controls.description;
    expect(description.valid).toBeTruthy();
  });
});
