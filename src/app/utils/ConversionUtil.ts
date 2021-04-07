export default class ConversionUtil {
  static bytesInGb = 1000000000;

  static convertBytesToGb(val: number): number {
    return val / ConversionUtil.bytesInGb;
  }

  static convertGbToBytes(val: number): number {
    return val * ConversionUtil.bytesInGb;
  }

  static convertStringToBoolean(str: string): boolean {
    if (str === 'true') {
      return true;
    }
    if (str === 'false') {
      return false;
    }
    return Boolean(str);
  }
}
