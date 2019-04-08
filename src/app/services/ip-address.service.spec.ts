import { TestBed } from '@angular/core/testing';

import { IpAddressService } from './ip-address.service';

describe('IpAddressService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IpAddressService = TestBed.get(IpAddressService);
    expect(service).toBeTruthy();
  });

// updateCidrMask Tests
  it('should be changed to 30', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.updateCidrMask(cidr, 30).split('/');
  expect(result[1] === '30').toBeTruthy();
  });

  it('should not be changed', () => {
  const service: IpAddressService = TestBed.get(IpAddressService);
  const cidr = '192.168.1.0/24';
  const result = service.updateCidrMask(cidr, 24).split('/');
  expect(result[1] === '24').toBeTruthy();
  });
});
