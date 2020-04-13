// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VlanModalComponent } from './vlan-modal.component';

describe('VlanModalComponent', () => {
  let component: VlanModalComponent;
  let fixture: ComponentFixture<VlanModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
      ],
      declarations: [VlanModalComponent, TooltipComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(VlanModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have service object form', () => {
    expect(component.form).toBeTruthy();
  });

  // Initial Form State
  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('vlan number should be required', () => {
    const vlanNumber = component.form.controls.vlanNumber;
    expect(vlanNumber.valid).toBeFalsy();
  });
});
