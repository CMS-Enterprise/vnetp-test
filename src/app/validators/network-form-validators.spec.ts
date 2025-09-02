import {
  IpAddressIpValidator,
  IpAddressCidrValidator,
  ValidatePortRange,
  IpAddressAnyValidator,
  FqdnValidator,
  MacAddressValidator,
  IsIpV4NoSubnetValidator,
  ValidatePortNumber,
  IpAddressHostNetworkCidrValidator,
} from './network-form-validators';
import { FormControl } from '@angular/forms';

describe('NetworkFormValidators', () => {
  const createValidator = (validator: (fc: FormControl) => object) => {
    const formControl = new FormControl();

    return {
      validate: (value: string) => {
        formControl.setValue(value);
        return validator(formControl);
      },
    };
  };

  describe('IpAddressAnyValidator', () => {
    const { validate } = createValidator(IpAddressAnyValidator);

    it('should allow valid ip addresses (any type)', () => {
      expect(validate('255.255.255.255')).toBeNull();
      expect(validate('1.1.1.1')).toBeNull();
      expect(validate('255.255.255.255/32')).toBeNull();
      expect(validate('0.0.0.0/0')).toBeNull();
      expect(validate('fe80::7ccc:2a54:aed2:2180/128')).toBeNull();
      expect(validate('fe80::7ccc:2a54:aed2:2180')).toBeNull();
      expect(validate('::/0')).toBeNull();
    });

    it('should not allow invalid ip addresses (any type)', () => {
      expect(validate('all')).toEqual({ invalidIpAny: true });
      expect(validate('1.1.1.')).toEqual({ invalidIpAny: true });
      expect(validate('-1.1.1.1')).toEqual({ invalidIpAny: true });
      expect(validate('255.255.255.255/33')).toEqual({ invalidIpAny: true });
      expect(validate('0.0.0.0/-1')).toEqual({ invalidIpAny: true });
      expect(validate('fe80::7ccc:2a54:aed2:2180/129')).toEqual({ invalidIpAny: true });
      expect(validate('fe80::::://')).toEqual({ invalidIpAny: true });
    });
  });

  describe('IpAddressIpValidator', () => {
    const { validate } = createValidator(IpAddressIpValidator);

    it('should allow valid ip addresses', () => {
      expect(validate('255.255.255.255')).toBeNull();
      expect(validate('1.1.1.1')).toBeNull();
      expect(validate('192.168.10.0')).toBeNull();
      expect(validate('fe80::7ccc:2a54:aed2:2180')).toBeNull();
    });

    it('should not allow invalid ip addresses', () => {
      expect(validate('1.1.1.')).toEqual({ invalidIpAddress: true });
      expect(validate('1.1.1.1.1')).toEqual({ invalidIpAddress: true });
      expect(validate('-1.1.1.1')).toEqual({ invalidIpAddress: true });
      expect(validate('one.two.three.four')).toEqual({ invalidIpAddress: true });
      expect(validate('1.1.1.1///24')).toEqual({ invalidIpAddress: true });
      expect(validate('fe80:::::')).toEqual({ invalidIpAddress: true });
      expect(validate('fe80::::://')).toEqual({ invalidIpAddress: true });
    });
  });

  describe('IpAddressCidrValidator', () => {
    const { validate } = createValidator(IpAddressCidrValidator);

    it('should allow valid cidr addresses', () => {
      expect(validate('255.255.255.255/32')).toBeNull();
      expect(validate('1.1.1.1/32')).toBeNull();
      expect(validate('192.168.10.0/24')).toBeNull();
      expect(validate('127.0.0.1/20')).toBeNull();
      expect(validate('fe80::7ccc:2a54:aed2:2180/128')).toBeNull();
      expect(validate('::/0')).toBeNull();
    });

    it('should not allow invalid cidr addresses', () => {
      expect(validate('1.1.1/24')).toEqual({ invalidIpCidr: true });
      expect(validate('1.1.1.1//24')).toEqual({ invalidIpCidr: true });
      expect(validate('1.1.1.1/-24')).toEqual({ invalidIpCidr: true });
      expect(validate('one.two.three.four/five')).toEqual({ invalidIpCidr: true });
      expect(validate('1.2.three.four//')).toEqual({ invalidIpCidr: true });
      expect(validate('fe80::7ccc:2a54:aed2:2180/129')).toEqual({ invalidIpCidr: true });
    });
  });

  describe('FqdnValidator', () => {
    const { validate } = createValidator(FqdnValidator);

    it('should allow valid fqdn addresses', () => {
      expect(validate('google.com')).toBeNull();
      expect(validate('healthcare.gov')).toBeNull();
      expect(validate('test.com')).toBeNull();
      expect(validate('test.local')).toBeNull();
      expect(validate('test.dev')).toBeNull();
    });

    it('should not allow invalid fqdn addresses', () => {
      expect(validate('192.168.10.10')).toEqual({ invalidFqdn: true });
      expect(validate('.test.com')).toEqual({ invalidFqdn: true });
      expect(validate('test.com.')).toEqual({ invalidFqdn: true });
    });
  });

  describe('MacAddressValidator', () => {
    const { validate } = createValidator(MacAddressValidator);

    it('should allow valid mac addresses', () => {
      expect(validate('00:50:56:8c:d3:4e')).toBeNull();
      expect(validate('00:50:56:8c:53:f9')).toBeNull();
      expect(validate(null)).toBeNull();
    });

    it('should not allow invalid mac addresses', () => {
      expect(validate('ma:ca:dd:re:ss')).toEqual({ invalidMacAddress: true });
      expect(validate('invalid')).toEqual({ invalidMacAddress: true });
    });
  });

  describe('ValidatePortRange', () => {
    const { validate } = createValidator(ValidatePortRange);

    it('should allow valid ports/port ranges', () => {
      expect(validate('1')).toBeNull();
      expect(validate('1-100')).toBeNull();
      expect(validate('90-500')).toBeNull();
      expect(validate('1-65535')).toBeNull();
      expect(validate('any')).toBeNull();
    });

    it('should not allow invalid ports/port ranges', () => {
      expect(validate('-1')).toEqual({ invalidPortNumber: true });
      expect(validate(' 1')).toEqual({ invalidPortNumber: true });
      expect(validate('1 ')).toEqual({ invalidPortNumber: true });
      expect(validate(' 1 ')).toEqual({ invalidPortNumber: true });
      expect(validate(' 1 1 ')).toEqual({ invalidPortNumber: true });
      expect(validate('1 1')).toEqual({ invalidPortNumber: true });
      expect(validate(' 1 1')).toEqual({ invalidPortNumber: true });
      expect(validate('1 1 ')).toEqual({ invalidPortNumber: true });
      expect(validate('1- 2')).toEqual({ invalidPortNumber: true });
      expect(validate('1 -2')).toEqual({ invalidPortNumber: true });
      expect(validate('500-50')).toEqual({ invalidPortRange: true });
      expect(validate('500-500')).toEqual({ invalidPortRange: true });
      expect(validate('500--50')).toEqual({ invalidPortNumber: true });
      expect(validate('999999')).toEqual({ invalidPortNumber: true });
      expect(validate('one')).toEqual({ invalidPortNumber: true });
      expect(validate('one-twenty')).toEqual({ invalidPortNumber: true });
      expect(validate(' any ')).toEqual({ invalidPortNumber: true });
    });
  });

  describe('IsIpV4NoSubnetValidator', () => {
    const { validate } = createValidator(IsIpV4NoSubnetValidator);

    it('should allow valid ip addresses', () => {
      expect(validate('255.255.255.255')).toBeNull();
      expect(validate('1.1.1.1')).toBeNull();
      expect(validate('192.168.10.0')).toBeNull();
    });

    it('should not allow invalid ip addresses', () => {
      // expect(validate('1.1.1.')).toEqual({ invalidIp: true });
      // expect(validate('not an ip')).toEqual({ invalidIp: true });
    });

    it('should not allow ip addresses with subnet', () => {
      expect(validate('192.168.10.0/24')).toEqual({ invalidIpNoSubnet: true });
    });

    it('should not allow ipV6 addresses', () => {
      // expect(validate('fe80::7ccc:2a54:aed2:2180')).toEqual({ invalidIp: true });
      expect(validate('fe80::7ccc:2a54:aed2:2180/128')).toEqual({ invalidIpNoSubnet: true });
    });
  });

  describe('validatePortNumber', () => {
    const { validate } = createValidator(ValidatePortNumber);

    it('should allow valid port numbers', () => {
      expect(validate('1')).toBeNull();
      expect(validate('65535')).toBeNull();
    });

    it('should not allow invalid port numbers', () => {
      expect(validate('0')).toEqual({ invalidPortNumber: true });
      expect(validate('65536')).toEqual({ invalidPortNumber: true });
      expect(validate('one')).toEqual({ invalidPortNumber: true });
    });

    it('should not allow port ranges', () => {
      expect(validate('1-100')).toEqual({ portRangeNotAllowed: true });
      expect(validate('90-500')).toEqual({ portRangeNotAllowed: true });
      expect(validate('1-65535')).toEqual({ portRangeNotAllowed: true });
    });
  });

  describe('IpAddressHostNetworkCidrValidator', () => {
    it('should return null when given a valid CIDR', () => {
      const control = { value: '192.168.0.0/16' } as FormControl;
      const result = IpAddressHostNetworkCidrValidator(control);
      expect(result).toBeNull();
    });

    it('should return { invalidHost: true } when given an invalid CIDR', () => {
      const control = { value: '10.10.10.10/16' } as FormControl;
      const result = IpAddressHostNetworkCidrValidator(control);
      expect(result).toEqual({ invalidHost: true });
    });

    it('should return null when given null or undefined control', () => {
      let control: FormControl = null;
      let result = IpAddressHostNetworkCidrValidator(control);
      expect(result).toBeNull();

      control = undefined;
      result = IpAddressHostNetworkCidrValidator(control);
      expect(result).toBeNull();
    });

    it('should return { invalidHost: true } when given a valid IPv4 address without a CIDR', () => {
      const control = { value: '192.168.0.1' } as FormControl;
      const result = IpAddressHostNetworkCidrValidator(control);
      expect(result).toEqual({ invalidHost: true });
    });

    it('should return { invalidHost: true } when given an invalid IPv4 address without a CIDR', () => {
      const control = { value: '10.10.10.256' } as FormControl;
      const result = IpAddressHostNetworkCidrValidator(control);
      expect(result).toEqual({ invalidHost: true });
    });
  });
});
