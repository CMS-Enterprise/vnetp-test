// TODO: Given a valid input, IP service should return a network object.

import { Injectable } from '@angular/core';
import { IPv4 } from 'ip-num/IPv4';
import { IPv6 } from 'ip-num/IPv6';
import { IPv4Range } from 'ip-num/IPv4Range';
import { Validator } from 'ip-num/Validator';
import * as IpSubnetCalculator from 'ip-subnet-calculator/lib/ip-subnet-calculator.js';
import { Network } from '../models/network';

@Injectable({
  providedIn: 'root'
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
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    if (+range > length) {
      return false;
    }
    return true;
  }

  public updateCidrMask(cidr: string, value: number) {
    const cidrComponents = cidr.split('/');

    if (cidrComponents.length < 2) { return; }

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    return `${ip}/${value}`;
  }

  public calculateSubnetMask(cidr: string): string {
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    return IpSubnetCalculator.calculateSubnetMask(ip, range).prefixMaskStr;
  }

  public getCidrMask(cidr: string): number {
    const cidrComponents = cidr.split('/');

    const ip = cidrComponents[0];
    const range = cidrComponents[1];

    return +range;
  }

  // TODO: Initialize and return network object
  public getNetworkFromCidr(cidr: string): Network {
    let network = new Network();
    throw new Error('Not Implemented');
    return network;
  }
}
