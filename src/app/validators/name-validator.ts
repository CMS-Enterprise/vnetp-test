import { FormControl, Validators } from '@angular/forms';

function ValidName(control: FormControl): { invalidName: boolean } | null {
  if (!control || !control.value) {
    return null;
  }

  const validRegex = /^[A-Za-z0-9-_:.]*$/;
  const isValid = validRegex.test(control.value);

  if (isValid) {
    return null;
  }
  return { invalidName: true };
}

export const NameValidator = (minLength = 3, maxLength = 100) => {
  return Validators.compose([Validators.required, Validators.minLength(minLength), Validators.maxLength(maxLength), ValidName]);
};
