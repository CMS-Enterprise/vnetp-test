import { AbstractControl, ValidatorFn } from '@angular/forms';

export default class AsnUtil {
  static readonly MIN_ASN = 65536;
  static readonly MAX_ASN = 4294967294;

  static asPlainToAsdot(asn: number | null | undefined): string {
    if (asn === null || asn === undefined) {
      return '';
    }
    const high = Math.floor(asn / 65536);
    const low = asn % 65536;
    return `${high}.${low}`;
  }

  static asdotToAsPlain(asdot: string): number | null {
    const parts = asdot.split('.');
    if (parts.length !== 2) {
      return null;
    }
    const high = parseInt(parts[0], 10);
    const low = parseInt(parts[1], 10);
    if (isNaN(high) || isNaN(low) || high < 0 || low < 0 || low >= 65536) {
      return null;
    }
    return high * 65536 + low;
  }

  static parseAsnInput(input: string): number | null {
    if (!input || input.trim() === '') {
      return null;
    }
    const trimmed = input.trim();

    if (trimmed.includes('.')) {
      return this.asdotToAsPlain(trimmed);
    }

    const num = parseInt(trimmed, 10);
    if (isNaN(num)) {
      return null;
    }
    return num;
  }

  static asnValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value && control.value !== 0) {
        return { required: true };
      }

      const value = typeof control.value === 'string'
        ? this.parseAsnInput(control.value)
        : control.value;

      if (value === null || value === undefined) {
        return { required: true };
      }

      if (value < this.MIN_ASN) {
        return { min: true };
      }

      if (value > this.MAX_ASN) {
        return { max: true };
      }

      return null;
    };
  }

  static asPlainValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return { required: true };
      }

      const value = Number(control.value);
      if (isNaN(value)) {
        return { invalidFormat: true };
      }

      if (value < this.MIN_ASN) {
        return { min: true };
      }

      if (value > this.MAX_ASN) {
        return { max: true };
      }

      return null;
    };
  }

  static asdotValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value || control.value.trim() === '') {
        return { required: true };
      }

      const trimmed = control.value.trim();
      const parts = trimmed.split('.');
      if (parts.length !== 2) {
        return { invalidFormat: true };
      }

      const high = parseInt(parts[0], 10);
      const low = parseInt(parts[1], 10);

      if (isNaN(high) || isNaN(low)) {
        return { invalidFormat: true };
      }

      // ASdot format: high and low must be non-negative, low must be < 65536
      if (high < 0 || low < 0) {
        return { invalidFormat: true };
      }

      if (low >= 65536) {
        return { invalidFormat: true };
      }

      // ASdot range: 1.0 to 65535.65535 (Cisco 4-byte ASN specification)
      // But converted ASPlain must be within 65536 to 4294967294
      if (high < 1) {
        return { min: true };
      }

      if (high > 65535) {
        return { invalidFormat: true };
      }

      const asPlain = high * 65536 + low;

      // Ensure converted value is within valid ASPlain range
      if (asPlain < this.MIN_ASN) {
        return { min: true };
      }

      if (asPlain > this.MAX_ASN) {
        return { max: true };
      }

      return null;
    };
  }
}

