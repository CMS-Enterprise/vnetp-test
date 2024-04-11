import { UntypedFormGroup } from '@angular/forms';

export default class FormUtil {
  public static findInvalidControls(form: UntypedFormGroup) {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
}
