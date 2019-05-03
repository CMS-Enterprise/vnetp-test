import { FormControl, FormGroup } from '@angular/forms';
import { IpAddressService } from '../services/ip-address.service';

const ipService = new IpAddressService();


export function ValidateIpAddress(control: FormControl) {
    const result = ipService.isValidIPv4String(control.value);

    if (!result[0]) {
        return { validIpv4Address: true };
    }
    return null;
}

export function ValidatePortRange(control: FormControl) {
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

function isValidPortNumber(portNumber: number) {
   return (portNumber <= 0 || portNumber > 65535) ? false : true;
}
