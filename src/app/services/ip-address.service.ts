import { Injectable } from "@angular/core";
import { IPv4 } from "ip-num/IPv4";
import { IPv6 } from "ip-num/IPv6";
import { IPv4Range } from "ip-num/IPv4Range";
import { Validator } from "ip-num/Validator";
import * as IpSubnetCalculator from "ip-subnet-calculator/lib/ip-subnet-calculator.js";

@Injectable({
  providedIn: "root"
})
export class IpAddressService {
  constructor() {}

  public isValidIPv4String(ipAddress: string): [boolean, string[]] {
    return Validator.isValidIPv4String(ipAddress);
  }

  public isValidIPv4CidrNotation(cidr: string): [boolean, string[]] {
    return Validator.isValidIPv4CidrNotation(cidr);
  }

  public getIpv4Range(cidr: string): IPv4Range {
    return IPv4Range.fromCidr(cidr);
  }

  public ipv4MaskLessThan(cidr: string, length: number) {
    let cidrComponents = cidr.split('/');

    let ip = cidrComponents[0];
    let range = cidrComponents[1];

    if (+range > length) {
      return false;
    }
    return true;
  }

  public updateCidrMask(cidr: string, value: number) {
    let cidrComponents = cidr.split('/');

    let ip = cidrComponents[0];
    let range = cidrComponents[1];

    return `${ip}/${value}`;
  }

  public calculateSubnetMask(cidr: string): string{
    let cidrComponents = cidr.split('/');

    let ip = cidrComponents[0];
    let range = cidrComponents[1];

    return IpSubnetCalculator.calculateSubnetMask(ip, range).prefixMaskStr;
  }

  public getCidrMask(cidr: string): number {
    let cidrComponents = cidr.split('/');

    let ip = cidrComponents[0];
    let range = cidrComponents[1];

    return +range;
  }
}
