import { FormControl } from '@angular/forms';

export function NameValidator(control: FormControl) {
  if (!control || !control.value) {
    return null;
  }

  const validRegex = /^[A-Za-z0-9-_:]*$/;

  const isValid = validRegex.test(control.value);

  if (isValid) {
    return null;
  } else if (!isValid) {
    return { invalidName: true };
  }
}
