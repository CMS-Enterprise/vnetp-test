import { UntypedFormControl, Validators } from '@angular/forms';

function ValidChangeRequest(control: UntypedFormControl): { invalidName: boolean } | null {
  //   return ValidateChangeRequest(control, /^[A-Za-z0-9-_:.]*$/);
  return ValidateChangeRequest(control, /^[CHG0-9.]*$/);
}

function ValidateChangeRequest(control: UntypedFormControl, regex) {
  //   console.log('controle',control)
  //   console.log('regex',regex)
  if (!control || !control.value) {
    return null;
  }

  const isValid = regex.test(control.value);
  //   console.log('isValid',isValid)

  if (isValid) {
    return null;
  }
  return { invalidName: true };
}

export const ChangeRequestValidator = (minLength = 10, maxLength = 10) =>
  Validators.compose([Validators.required, Validators.minLength(minLength), Validators.maxLength(maxLength), ValidChangeRequest]);
