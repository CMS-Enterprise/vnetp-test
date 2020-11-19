import ConversionUtil from './ConversionUtil';

describe('ConversionUtil', () => {
  describe('convertBytesToGb', () => {
    it('should convert correctly', () => {
      expect(ConversionUtil.convertBytesToGb(1000000000)).toBe(1);
    });
  });

  describe('convertGbToBytes', () => {
    it('should convert correctly', () => {
      expect(ConversionUtil.convertGbToBytes(1)).toBe(1000000000);
    });
  });

  describe('convertStringToBoolean', () => {
    it('should convert "true" to true', () => {
      expect(ConversionUtil.convertStringToBoolean('true')).toBe(true);
    });

    it('should convert "false" to false', () => {
      expect(ConversionUtil.convertStringToBoolean('false')).toBe(false);
    });

    it('should convert "truthyvalue" to true', () => {
      expect(ConversionUtil.convertStringToBoolean('truthyvalue')).toBe(true);
    });
  });
});
