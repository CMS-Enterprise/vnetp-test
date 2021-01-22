import { AbstractControl, FormGroup } from '@angular/forms';

export default class TestUtil {
  static isFormControlRequired(control: AbstractControl): boolean {
    if (!control) {
      return false;
    }
    control.setValue(null);
    const { errors } = control;
    if (!errors) {
      return false;
    }
    return !!errors.required;
  }

  static areRequiredFields(form: FormGroup, fields: string[]): boolean {
    return fields.map(f => form.controls[f]).every(control => TestUtil.isFormControlRequired(control));
  }

  static areOptionalFields(form: FormGroup, fields: string[]): boolean {
    return fields.map(f => form.controls[f]).every(control => !TestUtil.isFormControlRequired(control));
  }

  static hasNameValidator(control: AbstractControl): boolean {
    const errorValues = [
      'A', // too short
      'A'.repeat(1000), // too long
      'A*A*A', // Invalid characters
      '', // required
    ];

    const validValues = ['AAA', 'AAAAAA'];

    errorValues.forEach(v => {
      control.setValue(v);
      control.updateValueAndValidity();
      if (!control.errors) {
        return false;
      }
    });

    validValues.forEach(v => {
      control.setValue(v);
      control.updateValueAndValidity();
      if (control.errors) {
        return false;
      }
    });

    return true;
  }
}
