// TODO: Better error handling.
import { Injectable } from '@angular/core';
import { IPv4Range } from 'ip-num/IPv4Range';
import { Validator } from 'ip-num/Validator';
import * as IpSubnetCalculator from 'ip-subnet-calculator/lib/ip-subnet-calculator.js';
import { Subnet } from '../models/d42/subnet';
import { IPv4 } from 'ip-num/IPv4';

@Injectable({
  providedIn: 'root'
})
export class IpAddressService {
  constructor() {}

  // Returns a boolean indicating if an IPv4 string is valid.
  public isValidIPv4String(ipAddress: string): [boolean, string[]] {
    try {
      return Validator.isValidIPv4String(ipAddress);
    } catch (e) {
      return [false, null];
    }
  }

  // Returns a boolean indicating if an IPv4 cidr notaion is valid.
  public isValidIPv4CidrNotation(cidr: string): [boolean, string[]] {
    try {
      return Validator.isValidIPv4CidrNotation(cidr);
    } catch (e) {
      return [false, null];
    }
  }

  // Returns boolean indicating if start address is smaller than
  // end address.
  public isIpv4LessThan(start: string, end: string): boolean {
    const startIpAddr = new IPv4(start);
    const endIpAddr = new IPv4(end);
    return startIpAddr.isLessThan(endIpAddr);
  }

  // Returns an IPv4 range from a cidr formatted IPv4 address.
  public getIpv4Range(cidr: string): IPv4Range {
    return IPv4Range.fromCidr(cidr);
  }

  // Returns a boolen indicating if an IPv4 cidr mask range is less
  // than the supplied number.
  public ipv4MaskLessThan(cidr: string, length: number): boolean {
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    if (Number(range) > length) {
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
  // Returns a tuple containing a boolean indicating whether the subnet is a overlapped,
  // and the existing Subnet that the provided Subnet overlaps or is overlapped by.
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

  // Check if supplied subnet is a duplicate of another subnet in the array
  // Returns a tuple containing a boolean indicating whether the subnet is a duplicate, a string that indicates
  // what property of the subnet is a duplicate and the existing Subnet that the provided Subnet is a duplicate of.
  public checkIPv4SubnetDuplicate(subnet: Subnet, vlanId: number, subnets: Subnet[]): [boolean, string, Subnet] {
    for (const s of subnets) {
      // Names are case-insensitive, therefore change to lower case before checking.
      if (s.name.toLowerCase() === subnet.name.toLowerCase()) {
        return [true, 'name', s];
      } else
      // Check if same network address.
      if (s.network === subnet.network) {
        return [true, 'network', s];
      } else
      // Check if same VLAN Id.
      if (s.custom_fields.find(c => c.key === 'vlan_number').value === vlanId.toString()) {
        return [true, 'vlan', s];
      }
    }
    return [false, '', null];
  }
}
