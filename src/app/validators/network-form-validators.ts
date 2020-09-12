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
  } else if (!isValid) {
    return { invalidIpAny: true };
  }
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
