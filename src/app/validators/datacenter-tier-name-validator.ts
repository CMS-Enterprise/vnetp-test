import { FormControl, Validators } from '@angular/forms';

function ValidDatacenterTierName(control: FormControl): { invalidName: boolean } | null {
  return ValidateName(control, /^[A-Za-z0-9_]*$/);
}

function ValidateName(control: FormControl, regex) {
  if (!control || !control.value) {
    return null;
  }

  const isValid = regex.test(control.value);

  if (isValid) {
    return null;
  }
  return { invalidName: true };
}

export const DatacenterTierNameValidator = (minLength = 3, maxLength = 100) =>
  Validators.compose([Validators.required, Validators.minLength(minLength), Validators.maxLength(maxLength), ValidDatacenterTierName]);
