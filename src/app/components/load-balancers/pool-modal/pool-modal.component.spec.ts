import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PoolModalComponent } from './pool-modal.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
} from 'src/test/mock-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockProvider } from 'src/test/mock-providers';

describe('PoolModalComponent', () => {
  let component: PoolModalComponent;
  let fixture: ComponentFixture<PoolModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        PoolModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PoolModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  describe('Load Balancing Method', () => {
    it('should be required', () => {
      const loadBalancingMethod = component.form.controls.loadBalancingMethod;
      loadBalancingMethod.updateValueAndValidity();
      expect(loadBalancingMethod.errors.required).toBeTruthy();
    });
  });
});
