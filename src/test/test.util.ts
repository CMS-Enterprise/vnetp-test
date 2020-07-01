import { AbstractControl } from '@angular/forms';

export namespace TestUtil {
  export function isFormControlRequired(control: AbstractControl): boolean {
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
