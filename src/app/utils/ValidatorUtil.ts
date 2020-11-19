import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export default class ValidatorUtil {
  static optionallyRequired(requiredFn: () => boolean): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.parent) {
        return null;
      }

      const isRequired = requiredFn();
      return isRequired ? Validators.required(control) : null;
    };
  }
}
