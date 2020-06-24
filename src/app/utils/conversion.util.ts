export namespace ConversionUtil {
  const bytesInGb = 1000000000;

  export function convertBytesToGb(val: number): number {
    return val / bytesInGb;
  }

  export function convertGbToBytes(val: number): number {
    return val * bytesInGb;
  }

  export function convertStringToBoolean(str: string): boolean {
    if (str === 'true') {
      return true;
    }
    if (str === 'false') {
      return false;
    }
    return Boolean(str);
  }
}
