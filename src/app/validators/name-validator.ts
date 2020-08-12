import { FormControl } from '@angular/forms';

export function NameValidator(control: FormControl): { invalidName: boolean } {
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
