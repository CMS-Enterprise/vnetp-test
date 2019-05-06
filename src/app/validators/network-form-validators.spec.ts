import { TestBed } from '@angular/core/testing';
import { ValidateIpv4Address, ValidateIpv4CidrAddress, ValidatePortRange, ValidateIpv4Any } from './network-form-validators';
import { FormControl } from '@angular/forms';

describe('Network Form Validators', () => {
  beforeEach(() => TestBed.configureTestingModule({}));


  it('should be valid ip addresses (any)', () => {
    const formControl = new FormControl();

    formControl.setValue('any');
    expect(ValidateIpv4Any(formControl)).toBeNull();

    formControl.setValue('255.255.255.255');
    expect(ValidateIpv4Any(formControl)).toBeNull();

    formControl.setValue('1.1.1.1');
    expect(ValidateIpv4Any(formControl)).toBeNull();

    formControl.setValue('255.255.255.255/32');
    expect(ValidateIpv4Any(formControl)).toBeNull();

    formControl.setValue('0.0.0.0/0');
    expect(ValidateIpv4Any(formControl)).toBeNull();
  });

  it('should be invalid ip addresses (any)', () => {
    const formControl = new FormControl();

    formControl.setValue('all');
    expect(ValidateIpv4Any(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.');
    expect(ValidateIpv4Any(formControl)).toBeTruthy();

    formControl.setValue('-1.1.1.1');
    expect(ValidateIpv4Any(formControl)).toBeTruthy();

    formControl.setValue('255.255.255.255/33');
    expect(ValidateIpv4Any(formControl)).toBeTruthy();

    formControl.setValue('0.0.0.0/-1');
    expect(ValidateIpv4Any(formControl)).toBeTruthy();
  });

  it('should be valid ip addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('255.255.255.255');
    expect(ValidateIpv4Address(formControl)).toBeNull();

    formControl.setValue('1.1.1.1');
    expect(ValidateIpv4Address(formControl)).toBeNull();

    formControl.setValue('192.168.10.0');
    expect(ValidateIpv4Address(formControl)).toBeNull();

    formControl.setValue('127.0.0.1');
    expect(ValidateIpv4Address(formControl)).toBeNull();
  });

  it('should be invalid ip addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('1.1.1.');
    expect(ValidateIpv4Address(formControl)).toBeTruthy();

    formControl.setValue('-1.1.1.1');
    expect(ValidateIpv4Address(formControl)).toBeTruthy();

    formControl.setValue('one.two.three.four');
    expect(ValidateIpv4Address(formControl)).toBeTruthy();

    formControl.setValue('1.2.three.four');
    expect(ValidateIpv4Address(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1///24');
    expect(ValidateIpv4Address(formControl)).toBeTruthy();
  });

  it('should be valid cidr addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('255.255.255.255/32');
    expect(ValidateIpv4CidrAddress(formControl)).toBeNull();

    formControl.setValue('1.1.1.1/32');
    expect(ValidateIpv4CidrAddress(formControl)).toBeNull();

    formControl.setValue('192.168.10.0/24');
    expect(ValidateIpv4CidrAddress(formControl)).toBeNull();

    formControl.setValue('127.0.0.1/20');
    expect(ValidateIpv4CidrAddress(formControl)).toBeNull();
  });

  it('should be invalid cidr addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('1.1.1/24');
    expect(ValidateIpv4CidrAddress(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1//24');
    expect(ValidateIpv4CidrAddress(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1/-24');
    expect(ValidateIpv4CidrAddress(formControl)).toBeTruthy();

    formControl.setValue('one.two.three.four/five');
    expect(ValidateIpv4CidrAddress(formControl)).toBeTruthy();

    formControl.setValue('1.2.three.four//');
    expect(ValidateIpv4CidrAddress(formControl)).toBeTruthy();
  });

  it('should be valid port/port range', () => {
    const formControl = new FormControl();
    formControl.setValue('1');
    expect(ValidatePortRange(formControl)).toBeNull();

    formControl.setValue('1-100');
    expect(ValidatePortRange(formControl)).toBeNull();

    formControl.setValue('90-500');
    expect(ValidatePortRange(formControl)).toBeNull();

    formControl.setValue('1-65535');
    expect(ValidatePortRange(formControl)).toBeNull();
  });

  it('should be invalid port/port range', () => {
    const formControl = new FormControl();
    formControl.setValue('-1');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('500-50');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('500--50');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('999999');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('one');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('one-twenty');
    expect(ValidatePortRange(formControl)).toBeTruthy();
  });
});
