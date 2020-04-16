import { TestBed } from '@angular/core/testing';
import {
  IpAddressIpValidator,
  IpAddressCidrValidator,
  ValidatePortRange,
  IpAddressAnyValidator,
  FqdnValidator,
} from './network-form-validators';
import { FormControl } from '@angular/forms';

describe('Network Form Validators', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be valid ip addresses (any)', () => {
    const formControl = new FormControl();

    formControl.setValue('255.255.255.255');
    expect(IpAddressAnyValidator(formControl)).toBeNull();

    formControl.setValue('1.1.1.1');
    expect(IpAddressAnyValidator(formControl)).toBeNull();

    formControl.setValue('255.255.255.255/32');
    expect(IpAddressAnyValidator(formControl)).toBeNull();

    formControl.setValue('0.0.0.0/0');
    expect(IpAddressAnyValidator(formControl)).toBeNull();

    formControl.setValue('fe80::7ccc:2a54:aed2:2180/128');
    expect(IpAddressAnyValidator(formControl)).toBeNull();

    formControl.setValue('fe80::7ccc:2a54:aed2:2180');
    expect(IpAddressAnyValidator(formControl)).toBeNull();

    formControl.setValue('::/0');
    expect(IpAddressAnyValidator(formControl)).toBeNull();
  });

  it('should be invalid ip addresses (any)', () => {
    const formControl = new FormControl();

    formControl.setValue('all');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();

    formControl.setValue('-1.1.1.1');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();

    formControl.setValue('255.255.255.255/33');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();

    formControl.setValue('0.0.0.0/-1');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();

    formControl.setValue('fe80::7ccc:2a54:aed2:2180/129');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();

    formControl.setValue('fe80::::://');
    expect(IpAddressAnyValidator(formControl)).toBeTruthy();
  });

  it('should be valid ip addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('255.255.255.255');
    expect(IpAddressIpValidator(formControl)).toBeNull();

    formControl.setValue('1.1.1.1');
    expect(IpAddressIpValidator(formControl)).toBeNull();

    formControl.setValue('192.168.10.0');
    expect(IpAddressIpValidator(formControl)).toBeNull();

    formControl.setValue('fe80::7ccc:2a54:aed2:2180');
    expect(IpAddressIpValidator(formControl)).toBeNull();
  });

  it('should be invalid ip addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('1.1.1.');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1.1');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();

    formControl.setValue('-1.1.1.1');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();

    formControl.setValue('one.two.three.four');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();

    formControl.setValue('1.2.three.four');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1///24');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();

    formControl.setValue('fe80:::::');
    expect(IpAddressIpValidator(formControl)).toBeTruthy();
  });

  it('should be valid cidr addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('255.255.255.255/32');
    expect(IpAddressCidrValidator(formControl)).toBeNull();

    formControl.setValue('1.1.1.1/32');
    expect(IpAddressCidrValidator(formControl)).toBeNull();

    formControl.setValue('192.168.10.0/24');
    expect(IpAddressCidrValidator(formControl)).toBeNull();

    formControl.setValue('127.0.0.1/20');
    expect(IpAddressCidrValidator(formControl)).toBeNull();

    formControl.setValue('fe80::7ccc:2a54:aed2:2180/128');
    expect(IpAddressCidrValidator(formControl)).toBeNull();

    formControl.setValue('::/0');
    expect(IpAddressCidrValidator(formControl)).toBeNull();
  });

  it('should be invalid cidr addresses', () => {
    const formControl = new FormControl();
    formControl.setValue('1.1.1/24');
    expect(IpAddressCidrValidator(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1//24');
    expect(IpAddressCidrValidator(formControl)).toBeTruthy();

    formControl.setValue('1.1.1.1/-24');
    expect(IpAddressCidrValidator(formControl)).toBeTruthy();

    formControl.setValue('one.two.three.four/five');
    expect(IpAddressCidrValidator(formControl)).toBeTruthy();

    formControl.setValue('1.2.three.four//');
    expect(IpAddressCidrValidator(formControl)).toBeTruthy();

    formControl.setValue('fe80::7ccc:2a54:aed2:2180/129');
    expect(IpAddressCidrValidator(formControl)).toBeTruthy();
  });

  it('should be valid fqdn', () => {
    const formControl = new FormControl();

    formControl.setValue('google.com');
    expect(FqdnValidator(formControl)).toBeNull();

    formControl.setValue('healthcare.gov');
    expect(FqdnValidator(formControl)).toBeNull();

    formControl.setValue('test.com');
    expect(FqdnValidator(formControl)).toBeNull();

    formControl.setValue('test.local');
    expect(FqdnValidator(formControl)).toBeNull();

    formControl.setValue('test.dev');
    expect(FqdnValidator(formControl)).toBeNull();
  });

  it('should be invalid fqdn', () => {
    const formControl = new FormControl();

    formControl.setValue('192.168.10.10');
    expect(FqdnValidator(formControl)).toBeTruthy();

    formControl.setValue('.test.com');
    expect(FqdnValidator(formControl)).toBeTruthy();

    formControl.setValue('test.com.');
    expect(FqdnValidator(formControl)).toBeTruthy();
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

    formControl.setValue('any');
    expect(ValidatePortRange(formControl)).toBeNull();
  });

  it('should be invalid port/port range', () => {
    const formControl = new FormControl();
    formControl.setValue('-1');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('500-50');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('500-500');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('500--50');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('999999');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('one');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('one-twenty');
    expect(ValidatePortRange(formControl)).toBeTruthy();

    formControl.setValue('any ');
    expect(ValidatePortRange(formControl)).toBeTruthy();
  });
});
