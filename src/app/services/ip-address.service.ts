import { Injectable } from '@angular/core';
import * as IpSubnetCalculator from 'ip-subnet-calculator/lib/ip-subnet-calculator.js';

@Injectable({
  providedIn: 'root'
})
export class IpAddressService {

  constructor() {}

   public isIpAddress(ipAddress: string) {
     return IpSubnetCalculator.isIp(ipAddress);
   }

   public calculateSubnetMask(ipAddress: string, prefixSize: number): any {
     return IpSubnetCalculator.calculateSubnetMask(ipAddress, prefixSize);
   }
}
