import { TestBed } from '@angular/core/testing';

import { IpAddressService } from './ip-address.service';
import { Subnet } from '../models/d42/subnet';

describe('IpAddressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    expect(service).toBeTruthy();
  });

  // isValidIPv4String
  // Valid
  it('ip address should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const result = service.isValidIPv4CidrNotation('10.102.34.5');
    expect(result[0]).toBeTruthy();
  });

  // Invalid
  it('ip address should not be valid', () => {
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

// getIpv4Range Tests
  it('should be a valid ip range', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.getIpv4Range(cidr);
  expect(`${result.getFirst()}` === '192.168.1.0');
  expect(`${result.getLast()}` === '192.168.1.255');
});

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
  const result = service.updateIPv4CidrMask(cidr, 30).split('/');
  expect(result[1] === '30').toBeTruthy();
  });

  it('mask should not be changed', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.updateIPv4CidrMask(cidr, 24).split('/');
  expect(result[1] === '24').toBeTruthy();
  });

  // calculateSubnetMask Tests
  it('mask should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const cidr = '192.168.1.0/24';
    const result = service.calculateIPv4SubnetMask(cidr);
    expect(result === '255.255.255.0').toBeTruthy();
  });

  // getCidrMask Tests
  it('cidr mask should be valid', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const cidr = '192.168.1.0/24';
    const result = service.getIPv4CidrMask(cidr);
    expect(result === 24).toBeTruthy();
  });

  // checkOverlap Tests
  it('should overlap', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const subnet: Subnet = {
      subnet_id: 0,
      name: 'subnet',
      network: '192.168.0.0',
      gateway: '192.168.0.1',
      subnet_mask: '255.255.0.0',
      mask_bits: 16,
    };

    const subnets = new Array<Subnet>();

    const subnet1: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      network: '192.168.1.0',
      gateway: '192.168.1.1',
      subnet_mask: '255.255.255.0',
      mask_bits: 24,
    };

    subnets.push(subnet1);

    const result = service.checkIPv4RangeOverlap(subnet, subnets);

    expect(result[0]).toBeTruthy();
    expect(result[1].subnet_id === 100).toBeTruthy();
  });

  it('should not overlap', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    const subnet: Subnet = {
      subnet_id: 0,
      name: 'subnet',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
    };

    const subnets = new Array<Subnet>();

    const subnet1: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      network: '192.168.1.0',
      gateway: '192.168.1.1',
      subnet_mask: '255.255.255.0',
      mask_bits: 24,
    };

    subnets.push(subnet1);

    const result = service.checkIPv4RangeOverlap(subnet, subnets);

    expect(result[0]).toBeFalsy();
    expect(result[1]).toBeNull();
  });
});
