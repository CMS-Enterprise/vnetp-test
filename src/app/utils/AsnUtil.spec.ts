import AsnUtil from './AsnUtil';
import { FormControl } from '@angular/forms';

describe('AsnUtil', () => {
  describe('asPlainToAsdot', () => {
    it('should convert 65536 to 1.0', () => {
      expect(AsnUtil.asPlainToAsdot(65536)).toBe('1.0');
    });

    it('should convert 65636 to 1.100', () => {
      expect(AsnUtil.asPlainToAsdot(65636)).toBe('1.100');
    });

    it('should convert 4200000000 to 64086.59904', () => {
      expect(AsnUtil.asPlainToAsdot(4200000000)).toBe('64086.59904');
    });

    it('should convert 16417714 to 250.33714', () => {
      expect(AsnUtil.asPlainToAsdot(16417714)).toBe('250.33714');
    });

    it('should convert 4294967294 to 65535.65534', () => {
      expect(AsnUtil.asPlainToAsdot(4294967294)).toBe('65535.65534');
    });

    it('should return empty string for null', () => {
      expect(AsnUtil.asPlainToAsdot(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(AsnUtil.asPlainToAsdot(undefined)).toBe('');
    });
  });

  describe('asdotToAsPlain', () => {
    it('should convert 1.0 to 65536', () => {
      expect(AsnUtil.asdotToAsPlain('1.0')).toBe(65536);
    });

    it('should convert 1.100 to 65636', () => {
      expect(AsnUtil.asdotToAsPlain('1.100')).toBe(65636);
    });

    it('should convert 64125.0 to 4202496000', () => {
      expect(AsnUtil.asdotToAsPlain('64125.0')).toBe(4202496000);
    });

    it('should convert 250.1234 to 16385234', () => {
      expect(AsnUtil.asdotToAsPlain('250.1234')).toBe(16385234);
    });

    it('should convert 65535.65534 to 4294967294', () => {
      expect(AsnUtil.asdotToAsPlain('65535.65534')).toBe(4294967294);
    });

    it('should return null for invalid format - single number', () => {
      expect(AsnUtil.asdotToAsPlain('65536')).toBeNull();
    });

    it('should return null for invalid format - no dot', () => {
      expect(AsnUtil.asdotToAsPlain('1')).toBeNull();
    });

    it('should return null for invalid format - multiple dots', () => {
      expect(AsnUtil.asdotToAsPlain('1.0.0')).toBeNull();
    });

    it('should return null for invalid format - non-numeric high', () => {
      expect(AsnUtil.asdotToAsPlain('abc.0')).toBeNull();
    });

    it('should return null for invalid format - non-numeric low', () => {
      expect(AsnUtil.asdotToAsPlain('1.abc')).toBeNull();
    });

    it('should return null for negative high', () => {
      expect(AsnUtil.asdotToAsPlain('-1.0')).toBeNull();
    });

    it('should return null for negative low', () => {
      expect(AsnUtil.asdotToAsPlain('1.-100')).toBeNull();
    });

    it('should return null for low >= 65536', () => {
      expect(AsnUtil.asdotToAsPlain('1.65536')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(AsnUtil.asdotToAsPlain('')).toBeNull();
    });
  });

  describe('parseAsnInput', () => {
    it('should parse ASPlain format', () => {
      expect(AsnUtil.parseAsnInput('65536')).toBe(65536);
    });

    it('should parse ASdot format', () => {
      expect(AsnUtil.parseAsnInput('1.0')).toBe(65536);
    });

    it('should parse large ASPlain number', () => {
      expect(AsnUtil.parseAsnInput('4294967294')).toBe(4294967294);
    });

    it('should parse large ASdot number', () => {
      expect(AsnUtil.parseAsnInput('65535.65534')).toBe(4294967294);
    });

    it('should handle whitespace in ASPlain', () => {
      expect(AsnUtil.parseAsnInput('  65536  ')).toBe(65536);
    });

    it('should handle whitespace in ASdot', () => {
      expect(AsnUtil.parseAsnInput('  1.0  ')).toBe(65536);
    });

    it('should return null for empty string', () => {
      expect(AsnUtil.parseAsnInput('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(AsnUtil.parseAsnInput('   ')).toBeNull();
    });

    it('should return null for invalid ASPlain', () => {
      expect(AsnUtil.parseAsnInput('abc')).toBeNull();
    });

    it('should return null for invalid ASdot', () => {
      expect(AsnUtil.parseAsnInput('abc.def')).toBeNull();
    });
  });

  describe('asnValidator', () => {
    let validator: any;
    let control: FormControl;

    beforeEach(() => {
      validator = AsnUtil.asnValidator();
      control = new FormControl(null);
    });

    it('should return required error for null value', () => {
      control.setValue(null);
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error for undefined value', () => {
      control.setValue(undefined);
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error for empty string', () => {
      control.setValue('');
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should return null for valid ASPlain number', () => {
      control.setValue(65536);
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for valid ASPlain number at max', () => {
      control.setValue(4294967294);
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for valid ASdot string', () => {
      control.setValue('1.0');
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return min error for value less than 65536', () => {
      control.setValue(65535);
      const result = validator(control);
      expect(result).toEqual({ min: true });
    });

    it('should return min error for ASPlain string less than 65536', () => {
      control.setValue('65535');
      const result = validator(control);
      expect(result).toEqual({ min: true });
    });

    it('should return max error for value greater than 4294967294', () => {
      control.setValue(4294967295);
      const result = validator(control);
      expect(result).toEqual({ max: true });
    });

    it('should return required error for invalid ASdot string', () => {
      control.setValue('invalid.asdot');
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should return required error for invalid ASPlain string', () => {
      control.setValue('notanumber');
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should accept zero as a value (for required check)', () => {
      control.setValue(0);
      const result = validator(control);
      expect(result).toEqual({ min: true });
    });
  });
});

