import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ServiceObjectGroupModalComponent } from './service-object-group-modal.component';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ServiceObjectGroupModalComponent', () => {
  let component: ServiceObjectGroupModalComponent;
  let fixture: ComponentFixture<ServiceObjectGroupModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ServiceObjectGroupModalComponent, TooltipComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
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
