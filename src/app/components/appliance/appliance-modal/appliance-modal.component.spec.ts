import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplianceModalComponent } from './appliance-modal.component';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { of } from 'rxjs';
import { V1AppliancesService } from 'api_client';

describe('ApplianceModalComponent', () => {
  let component: ApplianceModalComponent;
  let fixture: ComponentFixture<ApplianceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ApplianceModalComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1AppliancesService)],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  describe('Description', () => {
    it('should be optional', () => {
      const { description } = component.form.controls;

      description.setValue(null);
      expect(description.valid).toBe(true);
    });

    it('should have a minimum length of 3 and maximum length of 500', () => {
      const name = component.form.controls.name;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(501));
      expect(name.valid).toBe(false);
    });
  });
});
