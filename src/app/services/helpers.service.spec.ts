import { TestBed } from '@angular/core/testing';

import { HelpersService } from './helpers.service';
import { Subnet } from '../models/d42/subnet';

describe('HelpersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HelpersService = TestBed.get(HelpersService);
    expect(service).toBeTruthy();
  });

  it('should be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: 'yes', notes: ''}]
    };

    const result = service.getDeployedState(subnet);
    expect(result).toBeTruthy();
  });

  it('should not be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: 'no', notes: ''}]
    };

    const result = service.getDeployedState(subnet);
    expect(result).toBeFalsy();
  });


  it('should not be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: '', notes: ''}]
    };

    const result = service.getDeployedState(subnet);
    expect(result).toBeFalsy();
  });


  it('should not be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: null, notes: ''}]
    };

    const result = service.getDeployedState(subnet);
    expect(result).toBeFalsy();
  });
});
