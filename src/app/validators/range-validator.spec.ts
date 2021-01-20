import { FormControl } from '@angular/forms';
import { RangeValidator } from './range-validator';

describe('RangeValidator', () => {
  const validate = (options: { num: number; min: number; max: number }) => {
    const { num, min, max } = options;
    const formControl = new FormControl(null, RangeValidator(min, max));
    formControl.setValue(num);
    return formControl.errors;
  };

  it('should be valid', () => {
    expect(
      validate({
        num: 1,
        min: 1,
        max: 10,
      }),
    ).toBeNull();
    expect(
      validate({
        num: 10,
        min: 1,
        max: 10,
      }),
    ).toBeNull();
    expect(
      validate({
        num: 5,
        min: 1,
        max: 10,
      }),
    ).toBeNull();
  });

  it('should be invalid', () => {
    expect(
      validate({
        num: 0,
        min: 1,
        max: 10,
      }),
    ).toBeTruthy();

    expect(
      validate({
        num: 100,
        min: 1,
        max: 10,
      }),
    ).toBeTruthy();
  });
});
