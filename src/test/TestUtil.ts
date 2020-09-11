import { AbstractControl } from '@angular/forms';

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
}
