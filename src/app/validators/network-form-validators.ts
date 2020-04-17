import { FormControl } from '@angular/forms';
import * as validator from 'validator';

export function IpAddressAnyValidator(control: FormControl) {
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

export function IpAddressCidrValidator(control: FormControl) {
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
  } else if (!isValid) {
    return { invalidIpCidr: true };
  }
}

export function IpAddressIpValidator(control: FormControl) {
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
  } else if (!isValid) {
    return { invalidIpAddress: true };
  }
}

export function FqdnValidator(control: FormControl) {
  if (!control || !control.value) {
    return null;
  }

  const isValid = validator.isFQDN(control.value);

  if (isValid) {
    return null;
  } else if (!isValid) {
    return { invalidFqdn: true };
  }
}

export function MacAddressValidator(control: FormControl) {
  if (!control || !control.value) {
    return null;
  }

  const isValid = validator.isMACAddress(control.value);

  if (isValid) {
    return null;
  } else if (!isValid) {
    return { invalidMacAddress: true };
  }
}

export function ValidatePortRange(control: FormControl) {
  if (!control || !control.value) {
    return null;
  }

  if (control.value === 'any') {
    return null;
  }

  const value = control.value;
  const valueArray = value.split('-');

  if (valueArray.length < 1 || valueArray.length > 2) {
    return { validPortNumber: true };
  }

  if (valueArray.length === 1) {
    // Single Number
    if (!isValidPortNumber(Number(valueArray[0]))) {
      return { validPortNumber: true };
    }
  } else if (valueArray.length === 2) {
    // Range
    const startPort = Number(valueArray[0]);
    const endPort = Number(valueArray[1]);

    if (isNaN(startPort) || isNaN(endPort)) {
      return { validPortNumber: true };
    }

    if (startPort > endPort || startPort === endPort) {
      return { validPortRange: true };
    }

    if (!isValidPortNumber(startPort) || !isValidPortNumber(endPort)) {
      return { validPortNumber: true };
    }
  }
  return null;
}

function isValidPortNumber(portNumber: number): boolean {
  return !isNaN(portNumber) && portNumber > 0 && portNumber <= 65535;
}

function ValidateIpAddress(ipAddress: string) {
  return validator.isIP(ipAddress, 4) || validator.isIP(ipAddress, 6);
}

function ValidateCidrAddress(ipArray: string[]) {
  // If IP portion after subnet mask is empty.
  if (!ipArray[1] || !ipArray[1].length) {
    return false;
  }

  if (validator.isIP(ipArray[0], 4)) {
    return ValidateNetMask(Number(ipArray[1]), 4);
  } else if (validator.isIP(ipArray[0], 6)) {
    return ValidateNetMask(Number(ipArray[1]), 6);
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
