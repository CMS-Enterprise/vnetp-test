import { Injectable } from '@angular/core';
import { IPv4Range } from 'ip-num/IPv4Range';
import { Validator } from 'ip-num/Validator';
import * as IpSubnetCalculator from 'ip-subnet-calculator/lib/ip-subnet-calculator.js';
import { Subnet } from '../models/d42/subnet';

@Injectable({
  providedIn: 'root'
})
export class IpAddressService {
  constructor() {}

  // Returns a boolean indicating if an IPv4 string is valid.
  public isValidIPv4String(ipAddress: string): [boolean, string[]] {
    return Validator.isValidIPv4String(ipAddress);
  }

  // Returns a boolean indicating if an IPv4 cidr notaion is valid.
  public isValidIPv4CidrNotation(cidr: string): [boolean, string[]] {
    return Validator.isValidIPv4CidrNotation(cidr);
  }

  // Returns an IPv4 range from a cidr formatted IPv4 address.
  public getIpv4Range(cidr: string): IPv4Range {
    return IPv4Range.fromCidr(cidr);
  }

  // Returns a boolen indicating if an IPv4 cidr mask range is less
  // than the supplied number.
  public ipv4MaskLessThan(cidr: string, length: number) {
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    if (+range > length) {
      return false;
    }
    return true;
  }

  // Updates an IPv4 CIDR mask with the supplied value.
  public updateIPv4CidrMask(cidr: string, value: number) {
    const cidrComponents = cidr.split('/');

    if (cidrComponents.length < 2) { return; }

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    return `${ip}/${value}`;
  }

  // Calculates a subnet mask in xxx.xxx.xxx.xxx format
  // from a cidr (xx) mask.
  public calculateIPv4SubnetMask(cidr: string): string {
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    return IpSubnetCalculator.calculateSubnetMask(ip, range).prefixMaskStr;
  }

  // Splits an address in cidr notation and returns the
  // mask value.
  public getIPv4CidrMask(cidr: string): number {
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    return +range;
  }

  // Checks if a supplied subnet overlaps with other subnets in array
  public checkIPv4RangeOverlap(subnet: Subnet, subnets: Subnet[]): [boolean, Subnet] {
    // Create an IPv4 Range from the network to be evaluated.
    const newRange = IPv4Range.fromCidr(`${subnet.network}/${subnet.mask_bits}`);
    for (const s of subnets) {
      const existingRange = IPv4Range.fromCidr(`${s.network}/${s.mask_bits}`);
      // Check that the existing IPv4 range does not include the new IPv4 range.
      if (existingRange.contains(newRange)) {
        return [true, s];
      } else
      // Check that the new IPv4 range does not include the existing IPv4 range.
      if (newRange.contains(existingRange)) {
        return [true, s];
      }
    }
    return [false, null];
  }
}
