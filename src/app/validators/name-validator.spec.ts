import { FormControl } from '@angular/forms';
import { NameValidator } from './name-validator';

describe('NameValidator', () => {
  const createValidator = (validator: (fc: FormControl) => object) => {
    const formControl = new FormControl();

    return {
      validate: (value: string) => {
        formControl.setValue(value);
        return validator(formControl);
      },
    };
  };

  const { validate } = createValidator(NameValidator);

  it('should be valid name', () => {
    expect(validate('Test')).toBeNull();
    expect(validate('TestName')).toBeNull();
    expect(validate('Test:Name')).toBeNull();
    expect(validate('Test-Name')).toBeNull();
    expect(validate('Test_Name')).toBeNull();
    expect(validate('Test99Name')).toBeNull();
    expect(validate('Test99.Name')).toBeNull();
  });

  it('should be invalid name', () => {
    expect(validate('Test/')).toBeTruthy();
    expect(validate('Test  ')).toBeTruthy();
    expect(validate('192.168.10.0/24_test')).toBeTruthy();
    expect(validate('Test(5)')).toBeTruthy();
    expect(validate('Test(%)')).toBeTruthy();
    expect(validate('Test(!)')).toBeTruthy();
    expect(validate('Test Name (!)')).toBeTruthy();
  });
});
