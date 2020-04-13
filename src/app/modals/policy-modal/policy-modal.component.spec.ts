import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { PolicyModalComponent } from './policy-modal.component';

describe('PolicyModalComponent', () => {
  let component: PolicyModalComponent;
  let fixture: ComponentFixture<PolicyModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule, FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
      declarations: [PolicyModalComponent, TooltipComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PolicyModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyModalComponent);
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
});
