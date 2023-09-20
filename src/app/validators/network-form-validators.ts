import { FormControl } from '@angular/forms';
import { isFQDN, isIP, isMACAddress } from 'validator';

export function IpAddressAnyValidator(control: FormControl): { invalidIpAny: boolean } {
  if (!control || !control.value) {
    return null;
  }

  const ipArray = control.value.split('/');

  let isValid = false;

  if (ipArray.length === 1) {
    isValid = ValidateIpAddress(ipArray[0]);
  } else if (ipArray.length === 2) {
    isValid = ValidateCidrAddress(ipArray);
  }

  if (isValid) {
    return null;
  }
  return { invalidIpAny: true };
}

export function IpAddressCidrValidator(control: FormControl): { invalidIpCidr: boolean } {
  if (!control || !control.value) {
    return null;
  }
  const valueArray = control.value.split('/');

  let isValid = false;

  if (valueArray.length === 2) {
    isValid = ValidateCidrAddress(valueArray);
  }

  if (isValid) {
    return null;
  }
  return { invalidIpCidr: true };
}

export function IpAddressIpValidator(control: FormControl): { invalidIpAddress: boolean } {
  if (!control || !control.value) {
    return null;
  }
  const valueArray = control.value.split('/');

  let isValid = false;

  if (valueArray.length === 1) {
    isValid = ValidateIpAddress(control.value);
  }

  if (isValid) {
    return null;
  }
  return { invalidIpAddress: true };
}

export function FqdnValidator(control: FormControl): { invalidFqdn: boolean } {
  if (!control || !control.value) {
    return null;
  }

  const isValid = isFQDN(control.value);

  if (isValid) {
    return null;
  }
  return { invalidFqdn: true };
}

export function MacAddressValidator(control: FormControl): { invalidMacAddress: boolean } {
  if (!control || !control.value) {
    return null;
  }

  const isValid = isMACAddress(control.value);

  if (isValid) {
    return null;
  }
  return { invalidMacAddress: true };
}

export function ValidatePortRange(control: FormControl): { invalidPortNumber: boolean } | { invalidPortRange: boolean } {
  if (!control || !control.value) {
    return null;
  }

  if (control.value === 'any') {
    return null;
  }

  const value = control.value;
  const valueArray = value.split('-');

  if (valueArray.length < 1 || valueArray.length > 2) {
    return { invalidPortNumber: true };
  }

  if (valueArray.length === 1) {
    // Single Number
    if (!isValidPortNumber(Number(valueArray[0]))) {
      return { invalidPortNumber: true };
    }
  } else if (valueArray.length === 2) {
    // Range
    const startPort = Number(valueArray[0]);
    const endPort = Number(valueArray[1]);

    if (Number.isNaN(startPort) || Number.isNaN(endPort)) {
      return { invalidPortNumber: true };
    }

    if (startPort > endPort || startPort === endPort) {
      return { invalidPortRange: true };
    }

    if (!isValidPortNumber(startPort) || !isValidPortNumber(endPort)) {
      return { invalidPortNumber: true };
    }
  }
  return null;
}

function isValidPortNumber(portNumber: number): boolean {
  return !Number.isNaN(portNumber) && portNumber > 0 && portNumber <= 65535;
}

function ValidateIpAddress(ipAddress: string): boolean {
  return isIP(ipAddress, 4) || isIP(ipAddress, 6);
}

function ValidateCidrAddress(ipArray: string[]): boolean {
  // If IP portion after subnet mask is empty.
  const [ipAddress, netMask] = ipArray;
  if (!netMask) {
    return false;
  }

  const netMaskNumber = Number(netMask);

  let valid = false;

  if (isIP(ipAddress, 4)) {
    valid = ValidateNetMask(netMaskNumber, 4);
    if (valid) {
      valid = checkHostBitsSet([ipArray[0], netMaskNumber], 4);
    }
  } else if (isIP(ipAddress, 6)) {
    valid = ValidateNetMask(netMaskNumber, 6);
    if (valid) {
      valid = checkHostBitsSet([ipArray[0], netMaskNumber], 6);
    }
  }
  return valid;
}

function expandIPv6Address(address: string): string {
  const emptyGroups = 8 - (address.split(':').length - 1);
  return address.replace('::', ':' + '0:'.repeat(emptyGroups)).replace(/^:|:$/g, '');
}

function toBinaryIPv6(s: string): string {
  const expandedAddress = expandIPv6Address(s);
  return expandedAddress
    .split(':')
    .map(hex =>
      parseInt(hex, 16)
        .toString(2)
        .padStart(16, '0'),
    )
    .join('');
}

function checkHostBitsSet(ipData: [string, number], ipVersion: 4 | 6): boolean {
  const toBinaryIPv4 = (s: string) =>
    s
      .split('.')
      .map(octet =>
        parseInt(octet, 10)
          .toString(2)
          .padStart(8, '0'),
      )
      .join('');

  const createMask = (length: number, addressTotalBits: number) => '1'.repeat(length) + '0'.repeat(addressTotalBits - length);

  const ip = ipData[0];
  const maskLength = ipData[1];
  const totalLength = ipVersion === 4 ? 32 : 128;

  const maskBinary = createMask(maskLength, totalLength);
  const toBinary = ipVersion === 4 ? toBinaryIPv4 : toBinaryIPv6;

  const ipBinary = toBinary(ip);

  const valid = !Array.from(maskBinary).some((bit, i) => bit === '0' && ipBinary[i] === '1');
  return valid;
}

function ValidateNetMask(netMask: number, ipVersion: number): boolean {
  if (netMask < 0) {
    return false;
  }

  if (ipVersion === 4) {
    return netMask <= 32;
  }
  return netMask <= 128;
}
