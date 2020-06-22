import { HelpersService } from './helpers.service';
import { Subnet } from '../models/d42/subnet';
import { Vrf } from '../models/d42/vrf';

describe('HelpersService', () => {
  const service = new HelpersService();

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be deployed', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'deployed', value: 'Yes', notes: '' }],
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeTruthy();
  });

  it('should not be deployed', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'deployed', value: 'no', notes: '' }],
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should not be deployed', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'deployed', value: '', notes: '' }],
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should not be deployed', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'deployed', value: null, notes: '' }],
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should handle null custom fields', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: null,
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should handle empty custom fields', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [],
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should handle empty custom fields', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'wrong_custom_field', value: 'something else', notes: '' }],
    };

    const result = service.getBooleanCustomField(subnet, 'deployed');
    expect(result).toBeFalsy();
  });

  it('should return a number', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'number', value: '9001', notes: '' }],
    };

    const result = service.getNumberCustomField(subnet, 'number');
    expect(result > 9000).toBeTruthy();
    expect(result === 9001).toBeTruthy();
  });

  it('should return a string', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'string', value: 'value', notes: '' }],
    };

    const result = service.getStringCustomField(subnet, 'string');
    expect(result === 'value').toBeTruthy();
  });

  it('should return an empty string when custom_field empty', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'string', value: '', notes: '' }],
    };

    const result = service.getStringCustomField(subnet, 'string');
    expect(result === '').toBeTruthy();
  });

  it('should return an empty string when custom_field not present', () => {
    const subnet: Subnet = {
      subnet_id: 100,
      name: 'subnet',
      description: '',
      network: '10.0.0.0',
      gateway: '10.0.0.1',
      subnet_mask: '255.0.0.0',
      mask_bits: 8,
      custom_fields: [{ key: 'string', value: 'value', notes: '' }],
    };

    const result = service.getStringCustomField(subnet, 'random123');
    expect(result === '').toBeTruthy();
  });

  it('should return null when custom_field not present', () => {
    const vrf = new Vrf();
    const result = service.getJsonCustomField(vrf, 'network_objects');
    expect(result).toBeFalsy();
  });

  it('should deep copy', () => {
    const test = { Name: 'Test', Children: ['Test1', 'Test2'] };
    const testCopy = service.deepCopy(test);

    testCopy.Children.splice(0, 1);

    expect(test.Children.length === 2).toBeTruthy();
  });
});
