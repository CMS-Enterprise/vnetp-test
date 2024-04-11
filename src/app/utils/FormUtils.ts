import { UntypedFormGroup, UntypedFormArray } from '@angular/forms';

export default class FormUtils {
  /*
       Returns an array of invalid control/group names, or a zero-length array if
       no invalid controls/groups where found
    */
  public findInvalidControlsRecursive(formToInvestigate: UntypedFormGroup | UntypedFormArray): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: UntypedFormGroup | UntypedFormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control.invalid) {
          invalidControls.push(field);
        }
        if (control instanceof UntypedFormGroup) {
          recursiveFunc(control);
        } else if (control instanceof UntypedFormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }
}
