import { TestBed } from '@angular/core/testing';

import { IpAddressService } from './ip-address.service';

describe('IpAddressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    expect(service).toBeTruthy();
  });

  // isValidIPv4String
  // Valid
  it('ip address shoudl be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const result = service.isValidIPv4CidrNotation('10.102.34.5');
    expect(result[0]).toBeTruthy();
  });

  // Invalid
  it('ip address shoudl not be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const result = service.isValidIPv4CidrNotation('302.23.434.51');
    expect(result[0]).toBeFalsy();
  });

  // isValidIPv4CidrNotation Tests
  // Valid
  it('cidr notation should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const result0 = service.isValidIPv4CidrNotation('10.0.0.0/8');
    expect(result0[0]).toBeTruthy();
    const result1 = service.isValidIPv4CidrNotation('172.20.74.253/24');
    expect(result1[0]).toBeTruthy();
    const result2 = service.isValidIPv4CidrNotation('192.168.74.253/24');
    expect(result2[0]).toBeTruthy();
  });

  // Invalid
  it('cidr notation should not be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const result0 = service.isValidIPv4CidrNotation('10.0.0.0/33');
    expect(result0[0]).toBeFalsy();
    const result1 = service.isValidIPv4CidrNotation('372.20.74.253/24');
    expect(result1[0]).toBeFalsy();
    const result2 = service.isValidIPv4CidrNotation('192.168.741.253/24');
    expect(result2[0]).toBeFalsy();
  });

// TODO: getIpv4Range Tests
// ipv4MaskLessThan Tests
  it('mask should be less than', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.ipv4MaskLessThan(cidr, 25);
  expect(result[1]).toBeTruthy();
});

  it('mask should not be less than', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.ipv4MaskLessThan(cidr, 25);
  expect(result[1]).toBeFalsy();
});

// updateCidrMask Tests
  it('mask should be changed to 30', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.updateCidrMask(cidr, 30).split('/');
  expect(result[1] === '30').toBeTruthy();
  });

  it('mask should not be changed', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.updateCidrMask(cidr, 24).split('/');
  expect(result[1] === '24').toBeTruthy();
  });

  // calculateSubnetMask Tests
  it('mask should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const cidr = '192.168.1.0/24';
    const result = service.calculateSubnetMask(cidr);
    expect(result === '255.255.255.0').toBeTruthy();
  });

  // getCidrMask Tests
  it('cidr mask should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const cidr = '192.168.1.0/24';
    const result = service.getCidrMask(cidr);
    expect(result === 24).toBeTruthy();
  });

  // getNetworkFromCidr Tests
  it('network should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const cidr = '192.168.1.0/24';
    const result = service.getNetworkFromCidr(cidr);
    expect(result.SubnetMask === '255.255.255.0');
  });
});
