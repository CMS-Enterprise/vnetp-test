import { FormControl } from '@angular/forms';


export function ValidateIpv4CidrAddress(control: FormControl) {
    if (!control || !control.value) {
        return { validIpv4Address: true };
    }
    const valueArray = control.value.split('/');

    if (valueArray.length !== 2) {
        return {validIpv4Address: true };
    } else  if (!isValidIpAddress(valueArray[0]) ||
    !isValidNetMask(Number(valueArray[1]))) {
        return { validIpv4Address: true };
    }
    return null;
}

export function ValidateIpv4Address(control: FormControl) {
    if (!control || !control.value) {
        return { validIpv4Address: true };
    }
    const valueArray = control.value.split('/');

    if (valueArray.length !== 1) {
        return {validIpv4Address: true };
    } else if
         (!isValidIpAddress(valueArray[0])) {
            return { validIpv4Address : true };
        }
    return null;
}

export function ValidatePortRange(control: FormControl) {
    if (!control || !control.value) {
        return { validPortNumber : true };
    }

    const value = control.value;
    const valueArray = value.split('-');

    if (valueArray.length === 1) {
        // Single Number
        if (!isValidPortNumber(Number(valueArray[0]))) {
            return { validPortNumber : true };
        }

    } else if (valueArray.length === 2) {
        // Range
        if (!isValidPortNumber(Number(valueArray[0])) ||
        !isValidPortNumber(Number(valueArray[1]))) {
            return { validPortNumber: true };
        }
    }
    return null;
}

function isValidPortNumber(portNumber: number): boolean {
   return (portNumber > 0 && portNumber <= 65535);
}

function isValidIpAddress(ipAddress: string): boolean {
    const ipAddressArray = ipAddress.split('.');

    if (ipAddressArray.length < 4) {
        return false;
    }

    for (const o of ipAddressArray) {
        if (!o || o === '') {
            return false;
        }

        const octet = Number(o);
        if (octet < 0 || octet > 255) {
            return false;
        }
    }
    return true;
}

function isValidNetMask(netMask: number): boolean {
    return (netMask > 0 && netMask <= 32);
}
