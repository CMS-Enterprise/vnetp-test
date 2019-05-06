import { FormControl } from '@angular/forms';


/** Validates an IPv4 address in either address (x.x.x.x) or
 *  CIDR (x.x.x.x/y) format, also accepts 'any'.
 */
export function ValidateIpv4Any(control: FormControl) {
    if (!control || !control.value) {
        return null;
    }

    if (control.value === 'any') {
        return null;
    }

    const ipArray = control.value.split('/');
    if (ipArray.length < 1 || ipArray.length > 2) {
        return { validIpv4Any: true };
    }

    let result;
    if (ipArray.length === 1) {
        result = ValidateIpv4Address(control);
    } else if (ipArray.length === 2) {
        result = ValidateIpv4CidrAddress(control);
    } 

    if (!result) {
        return null;
    } else if (result) {
        return { validIpv4Any: true };
    }
}

export function ValidateIpv4CidrAddress(control: FormControl) {
    if (!control || !control.value) {
       return null;
    }
    const valueArray = control.value.split('/');

    if (valueArray.length !== 2) {
        return {validIpv4Address: true };
    } else if (!isValidIpAddress(valueArray[0]) ||
    !isValidNetMask(Number(valueArray[1]))) {
        return { validIpv4Address: true };
    }
    return null;
}

export function ValidateIpv4Address(control: FormControl) {
    if (!control || !control.value) {
        return null;
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
        return null;
    }

    const value = control.value;
    const valueArray = value.split('-');

    if (valueArray.length < 1 || valueArray.length > 2){
        return { validPortNumber: true };
    }

    if (valueArray.length === 1) {
        // Single Number
        if (!isValidPortNumber(Number(valueArray[0]))) {
            return { validPortNumber : true };
        }

    } else if (valueArray.length === 2) {
        // Range
        const startPort = Number(valueArray[0]);
        const endPort = Number(valueArray[1]);

        if (isNaN(startPort) || isNaN(endPort)) {
            return { validPortNumber: true };
        }

        if (startPort > endPort) {
            return { validPortRange: true };
        }

        if (!isValidPortNumber(startPort) ||
        !isValidPortNumber(endPort)) {
            return { validPortNumber: true };
        }
    }
    return null;
}

function isValidPortNumber(portNumber: number): boolean {
   return (!isNaN(portNumber) && portNumber > 0 && portNumber <= 65535);
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
        if (isNaN(octet) || octet < 0 || octet > 255) {
            return false;
        }
    }
    return true;
}

function isValidNetMask(netMask: number): boolean {
    return (!isNaN(netMask) && netMask >= 0 && netMask <= 32);
}
