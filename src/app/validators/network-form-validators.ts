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

export function validateWanFormExternalRouteIp(control: FormControl): { invalidExternalRouteIp: boolean } {
  if (!control || !control.value) {
    return null;
  }

  const octets = control.value.split('.');

  if (octets[0] === '10' || (octets[0] === '158' && octets[1] === '73') || (octets[0] === '192' && octets[1] === '168')) {
    return null;
  }

  return { invalidExternalRouteIp: true };
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

export function IpAddressHostNetworkCidrValidator(control: FormControl): { invalidHost: true } {
  if (!control || !control.value) {
    return null;
  }

  if (isCidrValid(control.value)) {
    return null;
  }

  return { invalidHost: true };
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
  const maskValue = parseInt(mask);

  if (maskValue < 0 || maskValue > 32) {
    return false; // invalid mask value
  }

  const octets = ipAddress.split('.').map(octet => parseInt(octet));
  if (octets.some(octet => octet < 0 || octet > 255)) {
    return false; // invalid IP address octet
  }

  const binaryIp = octets.map(octet => octet.toString(2).padStart(8, '0')).join('');

  const networkBits = binaryIp.slice(0, maskValue);
  const hostBits = binaryIp.slice(maskValue);

  if (hostBits !== '0'.repeat(32 - maskValue)) {
    return false; // invalid host bits
  }

  return true;
}
