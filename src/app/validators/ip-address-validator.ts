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

export function ValidateCidrAddress(control: FormControl ) {
    const result = ipService.isValidIPv4CidrNotation(control.value);

    if (!result[0]) {
        return { validIpv4CidrAddress: true};
    }
    return null;
}