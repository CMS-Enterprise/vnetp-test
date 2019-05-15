import { TestBed } from '@angular/core/testing';

import { HelpersService } from './helpers.service';
import { Subnet } from '../models/d42/subnet';
import { isUndefined } from 'util';
import { CustomFieldsObject } from '../models/custom-fields-object.interface';
import { Vrf } from '../models/d42/vrf';

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
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: 'Yes', notes: ''}]
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeTruthy();
  });

  it('should not be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: 'no', notes: ''}]
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });


  it('should not be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: '', notes: ''}]
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });


  it('should not be deployed', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'deployed', value: null, notes: ''}]
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should handle null custom fields', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: null
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should handle empty custom fields', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: []
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should handle empty custom fields', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'wrong_custom_field', value: 'something else', notes: ''}]
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should return number', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'number', value: '9001', notes: ''}]
    };

    const result = service.getNumberCustomField(subnet, 'number');
    expect(result > 9000).toBeTruthy();
    expect(result === 9001).toBeTruthy();
  });

  it('should return string', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'string', value: 'value', notes: ''}]
    };

    const result = service.getStringCustomField(subnet, 'string');
    expect(result === 'value').toBeTruthy();
  });

  it('should return empty string when custom_field empty', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'string', value: '', notes: ''}]
    };

    const result = service.getStringCustomField(subnet, 'string');
    expect(result === '').toBeTruthy();
  });

  it('should return empty string when custom_field not present', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{key: 'string', value: 'value', notes: ''}]
    };

    const result = service.getStringCustomField(subnet, 'random123');
    expect(result === '').toBeTruthy();
  });

  it('should return null when custom_field not present', () => {
    const service: HelpersService = TestBed.get(HelpersService);

    const vrf = new Vrf();

    const result = service.getJsonCustomField(vrf, 'network_objects');
    expect(result).toBeFalsy();
  });
});
