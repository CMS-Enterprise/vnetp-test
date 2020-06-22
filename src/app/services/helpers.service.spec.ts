import { HelpersService } from './helpers.service';
import { Subnet } from '../models/d42/subnet';
import { Vrf } from '../models/d42/vrf';

describe('HelpersService', () => {
  const service = new HelpersService();

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBooleanCustomField', () => {
    it('should return true when the custom field is "Yes"', () => {
      subnet.custom_fields = [{ key: 'deployed', value: 'Yes', notes: '' }];

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(true);
    });

    it('should return false when the custom field is undefined', () => {
      subnet.custom_fields = [{ key: 'deployed', value: undefined, notes: '' }];

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(false);
    });

    it('should return false when the custom field is empty', () => {
      subnet.custom_fields = [{ key: 'deployed', value: '', notes: '' }];

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(false);
    });

    it('should return false when the custom field is null', () => {
      subnet.custom_fields = [{ key: 'deployed', value: null, notes: '' }];

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(false);
    });

    it('should return false when custom_fields are null', () => {
      subnet.custom_fields = null;

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(false);
    });

    it('should return false when custom_fields is empty', () => {
      subnet.custom_fields = [];

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(false);
    });

    it('should return false when the custom_field does not exist', () => {
      subnet.custom_fields = [{ key: 'wrong_custom_field', value: 'something else', notes: '' }];

      const result = service.getBooleanCustomField(subnet, 'deployed');
      expect(result).toBe(false);
    });
  });

  describe('getNumberCustomField', () => {
    it('should return a number', () => {
      subnet.custom_fields = [{ key: 'number', value: '9001', notes: '' }];

      const result = service.getNumberCustomField(subnet, 'number');
      expect(result).toBe(9001);
    });

    it('should return -1 when custom_field does not exist', () => {
      subnet.custom_fields = [{ key: 'number', value: 'value', notes: '' }];

      const result = service.getNumberCustomField(subnet, 'random123');
      expect(result).toBe(-1);
    });

    it('should return -1 when custom_field is null', () => {
      subnet.custom_fields = [{ key: 'number', value: null, notes: '' }];

      const result = service.getNumberCustomField(subnet, 'number');
      expect(result).toBe(-1);
    });

    it('should return -1 when custom_field is undefined', () => {
      subnet.custom_fields = [{ key: 'number', value: undefined, notes: '' }];

      const result = service.getNumberCustomField(subnet, 'number');
      expect(result).toBe(-1);
    });

    it('should return -1 when custom_field is too large', () => {
      subnet.custom_fields = [{ key: 'number', value: '100000000000000000000', notes: '' }];

      const result = service.getNumberCustomField(subnet, 'number');
      expect(result).toBe(-1);
    });

    it('should return -1 when custom_field is too small', () => {
      subnet.custom_fields = [{ key: 'number', value: '-100000000000000000000', notes: '' }];

      const result = service.getNumberCustomField(subnet, 'number');
      expect(result).toBe(-1);
    });
  });

  describe('getStringCustomField', () => {
    it('should return a string', () => {
      subnet.custom_fields = [{ key: 'string', value: 'value', notes: '' }];

      const result = service.getStringCustomField(subnet, 'string');
      expect(result).toBe('value');
    });

    it('should return an empty string when custom_field does not exist', () => {
      subnet.custom_fields = [{ key: 'string', value: 'value', notes: '' }];

      const result = service.getStringCustomField(subnet, 'random123');
      expect(result).toBe('');
    });

    it('should return an empty string when custom_field is null', () => {
      subnet.custom_fields = [{ key: 'string', value: null, notes: '' }];

      const result = service.getStringCustomField(subnet, 'string');
      expect(result).toBe('');
    });

    it('should return an empty string when custom_field is empty', () => {
      subnet.custom_fields = [{ key: 'string', value: '', notes: '' }];

      const result = service.getStringCustomField(subnet, 'string');
      expect(result).toBe('');
    });

    it('should return an empty string when custom_field is undefined', () => {
      subnet.custom_fields = [{ key: 'string', value: undefined, notes: '' }];

      const result = service.getStringCustomField(subnet, 'string');
      expect(result).toBe('');
    });
  });

  describe('getJsonCustomField', () => {
    const vrf = new Vrf();

    it('should return null when custom_field is null', () => {
      vrf.custom_fields = [{ key: 'json', value: null, notes: '' }];

      const result = service.getJsonCustomField(vrf, 'json');
      expect(result).toBe(null);
    });

    it('should return null when custom_field is undefined', () => {
      vrf.custom_fields = [{ key: 'json', value: undefined, notes: '' }];

      const result = service.getJsonCustomField(vrf, 'json');
      expect(result).toBe(null);
    });

    it('should return null when custom_field is an empty string', () => {
      vrf.custom_fields = [{ key: 'json', value: '', notes: '' }];

      const result = service.getJsonCustomField(vrf, 'json');
      expect(result).toBe(null);
    });

    it('should return null when custom_field does not exist', () => {
      vrf.custom_fields = [];
      const result = service.getJsonCustomField(vrf, 'network_objects');
      expect(result).toBe(null);
    });

    it('should return an object when custom_field is valid json', () => {
      vrf.custom_fields = [{ key: 'json', value: '{ "name": 1 }', notes: '' }];
      const result = service.getJsonCustomField(vrf, 'json');
      expect(result).toEqual({ name: 1 });
    });
  });

  describe('deepCopy', () => {
    it('should throw an error when object is null', () => {
      const throwsError = () => service.deepCopy(null);
      expect(throwsError).toThrowError('Null Object.');
    });

    it('should throw an error when object is undefined', () => {
      const throwsError = () => service.deepCopy(undefined);
      expect(throwsError).toThrowError('Null Object.');
    });

    it('should deep copy', () => {
      const test = { name: 'Test', children: ['Test1', 'Test2'] };
      const testCopy = service.deepCopy(test);
      expect(test).not.toBe(testCopy);
      expect(test).toEqual(testCopy);
    });
  });
});
