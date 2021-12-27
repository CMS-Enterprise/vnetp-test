import { FormControl, ValidatorFn } from '@angular/forms';
import { DatacenterTierNameValidator, NameValidator } from './name-validator';

describe('NameValidator', () => {
  const createValidator = (validator: ValidatorFn) => {
    const formControl = new FormControl();

    return {
      validate: (value: string) => {
        formControl.setValue(value);
        return validator(formControl);
      },
    };
  };

  it('should be valid name (Name Validator)', () => {
    const { validate } = createValidator(NameValidator());
    expect(validate('Test')).toBeNull();
    expect(validate('TestName')).toBeNull();
    expect(validate('Test:Name')).toBeNull();
    expect(validate('Test-Name')).toBeNull();
    expect(validate('Test_Name')).toBeNull();
    expect(validate('Test99Name')).toBeNull();
    expect(validate('Test99.Name')).toBeNull();
  });

  it('should be valid name (Datacenter Tier Validator Name Validator)', () => {
    const { validate } = createValidator(DatacenterTierNameValidator());
    expect(validate('Test')).toBeNull();
    expect(validate('TestName')).toBeNull();
    expect(validate('Test_Name')).toBeNull();
    expect(validate('Test99Name')).toBeNull();
  });

  it('should be invalid name (Name Validator)', () => {
    const { validate } = createValidator(NameValidator());
    expect(validate('Test/')).toBeTruthy();
    expect(validate('Test  ')).toBeTruthy();
    expect(validate('192.168.10.0/24_test')).toBeTruthy();
    expect(validate('Test(5)')).toBeTruthy();
    expect(validate('Test(%)')).toBeTruthy();
    expect(validate('Test(!)')).toBeTruthy();
    expect(validate('Test Name (!)')).toBeTruthy();
  });

  it('should be invalid name (Datacemter Tier Name Validator)', () => {
    const { validate } = createValidator(DatacenterTierNameValidator());
    expect(validate('Test/')).toBeTruthy();
    expect(validate('Test  ')).toBeTruthy();
    expect(validate('192.168.10.0/24_test')).toBeTruthy();
    expect(validate('Test(5)')).toBeTruthy();
    expect(validate('Test(%)')).toBeTruthy();
    expect(validate('Test(!)')).toBeTruthy();
    expect(validate('Test Name (!)')).toBeTruthy();
    expect(validate('Test:Name')).toBeTruthy();
    expect(validate('Test-Name')).toBeTruthy();
    expect(validate('Test99.Name')).toBeTruthy();
  });
});
