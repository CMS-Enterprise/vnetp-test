import { ValidatorFn, Validators } from '@angular/forms';

export function RangeValidator(min: number, max: number): ValidatorFn {
  return Validators.compose([Validators.min(min), Validators.max(max)]);
}
