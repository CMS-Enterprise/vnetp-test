import { FormControl } from '@angular/forms';
import { NameValidator } from './name-validator';
import { TestBed } from '@angular/core/testing';

describe('Network Form Validators', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be valid name', () => {
    expect(NameValidator(fcSetter('Test'))).toBeNull();
    expect(NameValidator(fcSetter('TestName'))).toBeNull();
    expect(NameValidator(fcSetter('Test:Name'))).toBeNull();
    expect(NameValidator(fcSetter('Test-Name'))).toBeNull();
    expect(NameValidator(fcSetter('Test_Name'))).toBeNull();
    expect(NameValidator(fcSetter('Test99Name'))).toBeNull();
    expect(NameValidator(fcSetter('Test99.Name'))).toBeNull();
  });

  it('should be invalid name', () => {
    expect(NameValidator(fcSetter('Test/'))).toBeTruthy();
    expect(NameValidator(fcSetter('Test  '))).toBeTruthy();
    expect(NameValidator(fcSetter('192.168.10.0/24_test'))).toBeTruthy();
    expect(NameValidator(fcSetter('Test(5)'))).toBeTruthy();
    expect(NameValidator(fcSetter('Test(%)'))).toBeTruthy();
    expect(NameValidator(fcSetter('Test(!)'))).toBeTruthy();
    expect(NameValidator(fcSetter('Test Name (!)'))).toBeTruthy();
  });
});

function fcSetter(value: string) {
  const formControl = new FormControl();

  formControl.setValue(value);

  return formControl;
}
