import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { PoolModalComponent } from './pool-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PoolModalComponent', () => {
  let component: PoolModalComponent;
  let fixture: ComponentFixture<PoolModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
      ],
      declarations: [PoolModalComponent, TooltipComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PoolModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should be required', () => {
      const name = component.form.controls.name;
      name.updateValueAndValidity();
      expect(name.errors.required).toBeTruthy();
    });

    it('should be valid when given a valid name', () => {
      const name = component.form.controls.name;
      name.setValue('a'.repeat(3));
      expect(name.valid).toBeTruthy();
    });

    it('should be invalid due to min length', () => {
      const name = component.form.controls.name;
      name.setValue('a'.repeat(2));
      expect(name.valid).toBeFalsy();
    });

    it('name should be invalid due to max length', () => {
      const name = component.form.controls.name;
      name.setValue('a'.repeat(101));
      expect(name.valid).toBeFalsy();
    });

    it('name should be invalid due to invalid characters', () => {
      const name = component.form.controls.name;
      name.setValue('invalid/name!');
      expect(name.valid).toBeFalsy();
    });
  });

  describe('Load Balancing Method', () => {
    it('should be required', () => {
      const loadBalancingMethod = component.form.controls.loadBalancingMethod;
      loadBalancingMethod.updateValueAndValidity();
      expect(loadBalancingMethod.errors.required).toBeTruthy();
    });
  });

  describe('Service Port', () => {
    it('should be required', () => {
      const servicePort = component.form.controls.servicePort;
      servicePort.updateValueAndValidity();
      expect(servicePort.errors.required).toBeTruthy();
    });
  });
});
