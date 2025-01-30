import { FormControl, UntypedFormControl } from '@angular/forms';
import { isFQDN, isIP, isMACAddress } from 'validator';

export function IpAddressAnyValidator(control: UntypedFormControl): { invalidIpAny: boolean } {
  if (!control?.value) {
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

export function validateWanFormExternalRouteIp(control: FormControl): { invalidExternalRouteIp: boolean } {
  if (!control?.value) {
    return null;
  }

  const octets = control.value.split('.');

  if (octets[0] === '10' || (octets[0] === '158' && octets[1] === '73') || (octets[0] === '192' && octets[1] === '168')) {
    return null;
  }

  return { invalidExternalRouteIp: true };
}

export function IpAddressCidrValidator(control: UntypedFormControl): { invalidIpCidr: boolean } {
  if (!control?.value) {
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

export function IpAddressHostNetworkCidrValidator(control: FormControl): { invalidHost: true } {
  if (!control?.value) {
    return null;
  }

  if (isCidrValid(control.value)) {
    return null;
  }

  return { invalidHost: true };
}

export function IsIpV4NoSubnetValidator(control: UntypedFormControl): { invalidIpNoSubnet: boolean } | { invalidIp: boolean } {
  if (!control?.value) {
    return null;
  }

  if (control.value.includes('/')) {
    return { invalidIpNoSubnet: true };
  }

  const isValid = isIP(control.value, 4);

  if (isValid) {
    return null;
  }

  return { invalidIp: true };
}

export function IsIpV6NoSubnetValidator(control: UntypedFormControl): { invalidIpNoSubnet: boolean } | { invalidIp: boolean } {
  if (!control?.value) {
    return null;
  }

  if (control.value.includes('/')) {
    return { invalidIpNoSubnet: true };
  }

  const isValid = isIP(control.value, 6);

  if (isValid) {
    return null;
  }

  return { invalidIp: true };
}

export function IsIpNoSubnet(control: UntypedFormControl): { invalidIpNoSubnet: boolean } | { invalidIp: boolean } {
  if (!control?.value) {
    return null;
  }

  if (control.value.includes('/')) {
    return { invalidIpNoSubnet: true };
  }
  const value = control.value;

  if (isIP(value, 4)) {
    return IsIpV4NoSubnetValidator(control);
  }
  if (isIP(value, 6)) {
    return IsIpV6NoSubnetValidator(control);
  }
}

export function IpAddressIpValidator(control: UntypedFormControl): { invalidIpAddress: boolean } {
  if (!control?.value) {
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

export function FqdnValidator(control: UntypedFormControl): { invalidFqdn: boolean } {
  if (!control?.value) {
    return null;
  }

  const isValid = isFQDN(control.value);

  if (isValid) {
    return null;
  }
  return { invalidFqdn: true };
}

export function MacAddressValidator(control: UntypedFormControl): { invalidMacAddress: boolean } {
  if (!control?.value) {
    return null;
  }

  const isValid = isMACAddress(control.value);

  if (isValid) {
    return null;
  }
  return { invalidMacAddress: true };
}

export function ValidatePortRange(control: UntypedFormControl): { invalidPortNumber: boolean } | { invalidPortRange: boolean } {
  if (control.value?.includes(' ')) {
    return { invalidPortNumber: true };
  }
  if (!control?.value) {
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

export function ValidatePortNumber(control: UntypedFormControl): { invalidPortNumber: boolean } | { portRangeNotAllowed: boolean } {
  if (!control?.value) {
    return null;
  }

  if (control.value === 'any') {
    return null;
  }

  if (control.value.includes('-')) {
    return { portRangeNotAllowed: true };
  }

  if (!isValidPortNumber(Number(control.value))) {
    return { invalidPortNumber: true };
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

  if (isIP(ipAddress, 4)) {
    return ValidateNetMask(Number(netMask), 4);
  }
  if (isIP(ipAddress, 6)) {
    return ValidateNetMask(Number(netMask), 6);
  }
  return false;
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

function isCidrValid(cidr: string): boolean {
  const [ipAddress, mask] = cidr.split('/');
  const maskValue = parseInt(mask, 10);

  if (maskValue < 0 || maskValue > 32) {
    return false; // invalid mask value
  }

  const octets = ipAddress.split('.').map(octet => parseInt(octet, 10));
  if (octets.some(octet => octet < 0 || octet > 255)) {
    return false; // invalid IP address octet
  }

  const binaryIp = octets.map(octet => octet.toString(2).padStart(8, '0')).join('');

  const hostBits = binaryIp.slice(maskValue);

  if (hostBits !== '0'.repeat(32 - maskValue)) {
    return false; // invalid host bits
  }

  return true;
}
