/* tslint:disable */
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';
import { Netmask } from 'netmask';

@Component({
  selector: 'app-nat-rule-packet-tracer',
  templateUrl: './nat-rule-packet-tracer.component.html',
})
export class NatRulePacketTracerComponent implements OnInit {
  @Input() objects;
  form: FormGroup;
  submitted: boolean;
  modalBody;
  modalTitle;

  rulesHit = [];
  filteredRules = [];
  showPartials = false;
  protocolSubscription: Subscription;
  currentPage = 1;
  pageSize = 10;

  filterExact = false;
  filterPartial = false;

  dropdownOpen = false;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.applyFilter();
    this.buildForm();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  isExactMatch(rule): boolean {
    return Object.values(rule.checkList).every(value => value === true);
  }

  isPartialMatch(rule): boolean {
    return Object.values(rule.checkList).some(value => value === true) && !this.isExactMatch(rule);
  }

  applyFilter(): void {
    if (!this.filterExact && !this.filterPartial) {
      this.filteredRules = [...this.rulesHit];
    } else {
      this.filteredRules = this.rulesHit.filter(rule => {
        const isExact = this.isExactMatch(rule);
        const isPartial = this.isPartialMatch(rule);
        return (this.filterExact && isExact) || (this.filterPartial && isPartial);
      });
    }
    this.currentPage = 1;
  }

  resetFilter(): void {
    this.filterExact = false;
    this.filterPartial = false;
  }

  get paginatedRules() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRules.slice(startIndex, startIndex + this.pageSize);
  }

  handleInRange(
    rule,
    location: 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination',
    control: AbstractControl,
  ) {
    let lookupType;

    switch (location) {
      case 'originalSource':
        lookupType = rule.originalSourceAddressType;
        break;
      case 'originalDestination':
        lookupType = rule.originalDestinationAddressType;
        break;
      case 'translatedSource':
        lookupType = rule.translatedSourceAddressType;
        break;
      case 'translatedDestination':
        lookupType = rule.translatedDestinationAddressType;
        break;
    }
    if (lookupType === 'NetworkObject') {
      return this.networkObjectLookup(rule, location, control);
    } else if (lookupType === 'NetworkObjectGroup') {
      return this.networkObjectGroupLookup(rule, location, control);
    }
  }

  networkObjectLookup(
    rule,
    location: 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination',
    control: AbstractControl,
  ) {
    const formIpValue = control.value;
    let ruleNetworkObject;
    switch (location) {
      case 'originalSource':
        ruleNetworkObject = rule.originalSourceNetworkObject;
        break;
      case 'originalDestination':
        ruleNetworkObject = rule.originalDestinationNetworkObject;
        break;
      case 'translatedSource':
        ruleNetworkObject = rule.translatedSourceNetworkObject;
        break;
      case 'translatedDestination':
        ruleNetworkObject = rule.translatedDestinationNetworkObject;
        break;
    }

    // Check if ruleNetworkObject is an IP/Subnet
    if (ruleNetworkObject.type === 'IpAddress') {
      const ruleSourceIp = ruleNetworkObject.ipAddress;
      try {
        const block = new Netmask(ruleSourceIp);
        if (block.contains(formIpValue)) {
          return true; // The form IP is within the rule's IP range
        }
      } catch (error) {}
    }
    // Handle if networkObject is a range of IPs
    else if (ruleNetworkObject.type === 'Range') {
      const startIpNum = this.dot2num(ruleNetworkObject.startIpAddress);
      const endIpNum = this.dot2num(ruleNetworkObject.endIpAddress);
      const searchIpNum = this.dot2num(formIpValue);

      // Check if the searchIpNum is within the range
      if (startIpNum <= searchIpNum && searchIpNum <= endIpNum) {
        return true;
      }
    }

    return false;
  }

  networkObjectGroupLookup(
    rule,
    location: 'originalSource' | 'originalDestination' | 'translatedSource' | 'translatedDestination',
    control: AbstractControl,
  ) {
    const formIpValue = control.value;
    let ruleNetworkObjectGroupId;

    switch (location) {
      case 'originalSource':
        ruleNetworkObjectGroupId = rule.originalSourceNetworkObjectGroupId;
        break;
      case 'originalDestination':
        ruleNetworkObjectGroupId = rule.originalDestinationNetworkObjectGroupId;
        break;
      case 'translatedSource':
        ruleNetworkObjectGroupId = rule.translatedSourceNetworkObjectGroupId;
        break;
      case 'translatedDestination':
        ruleNetworkObjectGroupId = rule.translatedDestinationNetworkObjectGroupId;
        break;
    }
    const ruleNetworkObjectGroup = this.getNetworkObjectGroup(ruleNetworkObjectGroupId);

    const networkObjectMembers = ruleNetworkObjectGroup.networkObjects;

    return networkObjectMembers.some(sourceMember => {
      if (sourceMember.type === 'IpAddress') {
        const sourceMemberIp = sourceMember.ipAddress;
        try {
          const block = new Netmask(sourceMemberIp);
          if (block.contains(formIpValue)) {
            // If the form IP is within the rule's IP range or matches the IP
            return true;
          }
        } catch (error) {}
      } else if (sourceMember.type === 'Range') {
        const startIpNum = this.dot2num(sourceMember.startIpAddress);
        const endIpNum = this.dot2num(sourceMember.endIpAddress);
        const searchIpNum = this.dot2num(formIpValue);

        // Check if the searchIpNum falls within the specified range
        if (startIpNum <= searchIpNum && searchIpNum <= endIpNum) {
          return true;
        }
      }

      // Continue checking other members if no match found yet
      return false;
    });
  }

  getNetworkObjectGroup(id) {
    return this.objects.networkObjectGroups.find(obj => obj.id === id);
  }

  serviceObjectPortMatch(rule, location: 'source' | 'destination', control: AbstractControl): boolean {
    const serviceObjectPortValue = location === 'source' ? rule.serviceObject.sourcePorts : rule.serviceObject.destinationPorts;
    return control.value === serviceObjectPortValue;
  }

  // takes an ipAddress to search for and another IP Subnet and determines if the ip to search
  // falls within range
  calculateSubnet(ipToSearch, ipAddress) {
    const split = ipAddress.split('/');
    // determine if there is a CIDR
    const [ip, cidr] = split;

    // converts all IP addresses into decimal format
    const ipNumber = this.dot2num(ip);
    const ipToSearchNum = this.dot2num(ipToSearch);

    // sends all parameters to function that determins the range of IPs
    return this.ipToRange(ipToSearchNum, ipNumber, cidr);

    // // if we ever want to display all subnets
    // const subnets = [];
    // for (let i = 32; i >= 0; i--) {
    //   subnets.push(this.num2dot(2 ** 32 - 2 ** i));
    // }

    // return ipToRange;
  }

  cidrSize(cidrSlash): number {
    return Math.pow(2, 32 - cidrSlash);
  }

  // caluculates whether an IP falls within a subnet or not
  ipToRange(ipToSearchNum, ip, cidr) {
    const size = this.cidrSize(cidr);
    const startIpNum = ip - (ip % size);
    const endIpNum = startIpNum + size - 1;
    let inRange = false;

    // if ipToCheck is inbetween our startIp and endIp
    // we know that ipToCheck falls within range
    if (startIpNum <= ipToSearchNum && endIpNum >= ipToSearchNum) {
      inRange = true;
    }

    // converts back to IP addresses
    const ipToCheckStr = this.num2dot(ipToSearchNum);
    const startIpStr = this.num2dot(startIpNum);
    const endIpStr = this.num2dot(endIpNum);
    return {
      ipToCheckStr,
      cidr,
      size,
      startIpStr,
      endIpStr,
      inRange,
    };
  }

  // converts decimal IPs back to octect format
  num2dot(num) {
    let d: any = num % 256;
    for (let i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      d = (num % 256) + '.' + d;
    }
    return d;
  }

  // converts octect IPs to decimals
  dot2num(dot): number {
    const d = dot.split('.');
    return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
  }

  // // TO DO : IPv6
  // convertIpv6(ipv6): void {
  //   // const ipv6Subnet = '2001:db8:0:0:8d3::/64';
  //   // simulate your address.binaryZeroPad(); method
  //   const parts = [];
  //   ipv6.split(':').forEach(it => {
  //     let bin = parseInt(it, 16).toString(2);
  //     while (bin.length < 16) {
  //       bin = '0' + bin;
  //     }
  //     parts.push(bin);
  //   });
  //   const bin = parts.join('');

  //   // Use BigInteger library
  //   // var dec = BigInt(bin).toString()
  //   // var dec2 = parseInt(dec, 2)
  //   // var dec3 = BigInt(dec2)
  //   console.log(bin);
  // }

  // TO DO : IPv6 Searches
  async search() {
    this.rulesHit = [];
    this.showPartials = false;
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    const searchDto = {
      directionLookup: this.form.controls.direction.value,
      biDirectionalLookup: this.form.controls.biDirectional.value,
      enabledLookup: this.form.controls.enabled.value,

      originalSourceIpLookup: this.form.controls.originalSourceIp.value,
      originalDestIpLookup: this.form.controls.originalDestinationIp.value,
      originalPortLookup: this.form.controls.originalPort.value,

      translatedSourceIpLookup: this.form.controls.translatedSourceIp.value,
      translatedDestIpLookup: this.form.controls.translatedDestinationIp.value,
      translatedPortLookup: this.form.controls.translatedPort.value,
    };

    this.objects.natRules.forEach(rule => {
      const checkList = {
        originalSourceInRange: this.handleInRange(rule, 'originalSource', this.form.controls.originalSourceIp),
        originalDestInRange: this.handleInRange(rule, 'originalDestination', this.form.controls.originalDestinationIp),
        translatedSourceInRange: this.handleInRange(rule, 'translatedSource', this.form.controls.translatedSourceIp),
        translatedDestInRange: this.handleInRange(rule, 'translatedDestination', this.form.controls.translatedDestinationIp),
      };
      this.rulesHit.push({ checkList, name: rule.name });
    });
    this.resetFilter();
    this.applyFilter();
    return this.rulesHit;

    // await Promise.all(
    //   this.objects.natRules.map(async rule => {
    //     const checkList = {
    //       originalSourceInRange: false,
    //       originalDestInRange: false,
    //       originalPortMatch: false,

    //       translatedSourceInRange: false,
    //       translatedDestInRange: false,
    //       translatedPortMatch: false,

    //       directionMatch: false,
    //       biDirectionalMatch: false,
    //       enabledMatch: false,
    //     };

    //     // if rule source is network object
    //     if (rule.originalSourceAddressType === 'NetworkObject') {
    //       const originalSourceNetworkObject = rule.originalSourceNetworkObject;
    //       // if networkObject is an IP/Subnet
    //       if (originalSourceNetworkObject.type === 'IpAddress') {
    //         // get networkObjectIP
    //         const originalSourceIp = originalSourceNetworkObject.ipAddress;
    //         const split = originalSourceIp.split('/');

    //         // see if networkObjectIP is a subnet
    //         if (split.length > 1) {
    //           const sourceSubnetInfo = this.calculateSubnet(searchDto.originalSourceIpLookup, originalSourceIp);
    //           if (sourceSubnetInfo.inRange) {
    //             checkList.originalSourceInRange = true;
    //           }
    //         }

    //         // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //         else {
    //           if (searchDto.originalSourceIpLookup === originalSourceIp) {
    //             checkList.originalSourceInRange = true;
    //           }
    //         }
    //       }

    //       // if networkObject is a range of IPs
    //       else if (originalSourceNetworkObject.type === 'Range') {
    //         // convert the start and end IPs to numbers
    //         const startIpNum = this.dot2num(originalSourceNetworkObject.startIpAddress);
    //         const endIpNum = this.dot2num(originalSourceNetworkObject.endIpAddress);

    //         // convert the sourceIP to a number
    //         const searchIpNum = this.dot2num(searchDto.originalSourceIpLookup);

    //         // if the searchIpNum falls in between the startIpNum and endIpNum
    //         // we know it is within the range provided
    //         if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //           checkList.originalSourceInRange = true;
    //         }
    //       }
    //     } else if (rule.originalSourceAddressType === 'NetworkObjectGroup') {
    //       const originalSourceNetworkObjectGroup = rule.originalSourceNetworkObjectGroup;
    //       const networkObjectMembers = originalSourceNetworkObjectGroup.networkObjects;
    //       networkObjectMembers.map(originalSourceMember => {
    //         if (originalSourceMember.type === 'IpAddress') {
    //           // get networkObjectIP
    //           const originalSourceMemberIp = originalSourceMember.ipAddress;
    //           const split = originalSourceMemberIp.split('/');

    //           // see if networkObjectIP is a subnet
    //           if (split.length > 1) {
    //             const sourceSubnetInfo = this.calculateSubnet(searchDto.originalSourceIpLookup, originalSourceMemberIp);
    //             if (sourceSubnetInfo.inRange) {
    //               checkList.originalSourceInRange = true;
    //             }
    //           }

    //           // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //           else {
    //             if (searchDto.originalSourceIpLookup === originalSourceMemberIp) {
    //               checkList.originalSourceInRange = true;
    //             }
    //           }
    //         }

    //         // if networkObject is a range of IPs
    //         else if (originalSourceMember.type === 'Range') {
    //           // convert the start and end IPs to numbers
    //           const startIpNum = this.dot2num(originalSourceMember.startIpAddress);
    //           const endIpNum = this.dot2num(originalSourceMember.endIpAddress);

    //           // convert the sourceIP to a number
    //           const searchIpNum = this.dot2num(searchDto.originalSourceIpLookup);

    //           // if the searchIpNum falls in between the startIpNum and endIpNum
    //           // we know it is within the range provided
    //           if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //             checkList.originalSourceInRange = true;
    //           }
    //         }
    //       });
    //     }
    //     // if rule destination is a network object
    //     if (rule.originalDestinationAddressType === 'NetworkObject') {
    //       const originalDestNetworkObject = rule.originalDestinationNetworkObject;
    //       // if destNetworkObject is an IP/subnet
    //       if (originalDestNetworkObject.type === 'IpAddress') {
    //         const ruleDestIp = originalDestNetworkObject.ipAddress;
    //         const split = ruleDestIp.split('/');

    //         // if it is a subnet, calculate the range and see if the destIpLookup falls within the subnet
    //         if (split.length > 1) {
    //           const destSubnetInfo = this.calculateSubnet(searchDto.originalDestIpLookup, ruleDestIp);
    //           if (destSubnetInfo.inRange) {
    //             checkList.originalDestInRange = true;
    //           }
    //         }
    //         // if destNetworkObject is an IP and not a subnet, just check for a complete match
    //         else {
    //           if (searchDto.originalDestIpLookup === ruleDestIp) {
    //             checkList.originalDestInRange = true;
    //           }
    //         }
    //       }

    //       // if networkObject is a range of IPs
    //       else if (originalDestNetworkObject.type === 'Range') {
    //         // convert the start and end IPs to numbers
    //         const startIpNum = this.dot2num(originalDestNetworkObject.startIpAddress);
    //         const endIpNum = this.dot2num(originalDestNetworkObject.endIpAddress);

    //         // convert the searchIpNum to a number
    //         const searchIpNum = this.dot2num(searchDto.originalDestIpLookup);

    //         // if the searchIpNum falls in between the startIpNum and endIpNum
    //         // we know it is within the range provided
    //         if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //           checkList.originalDestInRange = true;
    //         }
    //       }
    //     }
    //     if (rule.originalDestinationAddressType === 'NetworkObjectGroup') {
    //       const originalDestinationNetworkObjectGroup = rule.originalDestinationNetworkObjectGroup;
    //       const networkObjectMembers = originalDestinationNetworkObjectGroup.networkObjects;
    //       networkObjectMembers.map(originalDestMember => {
    //         if (originalDestMember.type === 'IpAddress') {
    //           // get networkObjectIP
    //           const originalDestMemberIp = originalDestMember.ipAddress;
    //           const split = originalDestMemberIp.split('/');

    //           // see if networkObjectIP is a subnet
    //           if (split.length > 1) {
    //             const destSubnetInfo = this.calculateSubnet(searchDto.originalDestIpLookup, originalDestMember);
    //             if (destSubnetInfo.inRange) {
    //               checkList.originalDestInRange = true;
    //             }
    //           }

    //           // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //           else {
    //             if (searchDto.originalDestIpLookup === originalDestMemberIp) {
    //               checkList.originalDestInRange = true;
    //             }
    //           }
    //         }

    //         // if networkObject is a range of IPs
    //         else if (originalDestMember.type === 'Range') {
    //           // convert the start and end IPs to numbers
    //           const startIpNum = this.dot2num(originalDestMember.startIpAddress);
    //           const endIpNum = this.dot2num(originalDestMember.endIpAddress);

    //           // convert the sourceIP to a number
    //           const searchIpNum = this.dot2num(searchDto.originalDestIpLookup);

    //           // if the searchIpNum falls in between the startIpNum and endIpNum
    //           // we know it is within the range provided
    //           if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //             checkList.originalDestInRange = true;
    //           }
    //         }
    //       });
    //     }

    //     if (rule.translatedSourceAddressType === 'NetworkObject') {
    //       const translatedSourceNetworkObject = rule.translatedSourceNetworkObject;
    //       // if networkObject is an IP/Subnet
    //       if (translatedSourceNetworkObject.type === 'IpAddress') {
    //         // get networkObjectIP
    //         const translatedSourceIp = translatedSourceNetworkObject.ipAddress;
    //         const split = translatedSourceIp.split('/');

    //         // see if networkObjectIP is a subnet
    //         if (split.length > 1) {
    //           const sourceSubnetInfo = this.calculateSubnet(searchDto.translatedSourceIpLookup, translatedSourceIp);
    //           if (sourceSubnetInfo.inRange) {
    //             checkList.translatedSourceInRange = true;
    //           }
    //         }

    //         // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //         else {
    //           if (searchDto.translatedSourceIpLookup === translatedSourceIp) {
    //             checkList.translatedSourceInRange = true;
    //           }
    //         }
    //       }

    //       // if networkObject is a range of IPs
    //       else if (translatedSourceNetworkObject.type === 'Range') {
    //         // convert the start and end IPs to numbers
    //         const startIpNum = this.dot2num(translatedSourceNetworkObject.startIpAddress);
    //         const endIpNum = this.dot2num(translatedSourceNetworkObject.endIpAddress);

    //         // convert the sourceIP to a number
    //         const searchIpNum = this.dot2num(searchDto.translatedSourceIpLookup);

    //         // if the searchIpNum falls in between the startIpNum and endIpNum
    //         // we know it is within the range provided
    //         if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //           checkList.translatedSourceInRange = true;
    //         }
    //       }
    //     }

    //     if (rule.translatedSourceAddressType === 'NetworkObjectGroup') {
    //       const translatedSourceNetworkObjectGroup = rule.translatedSourceNetworkObjectGroup;
    //       const networkObjectMembers = translatedSourceNetworkObjectGroup.networkObjects;
    //       networkObjectMembers.map(translatedSourceMember => {
    //         if (translatedSourceMember.type === 'IpAddress') {
    //           // get networkObjectIP
    //           const translatedSourceMemberIp = translatedSourceMember.ipAddress;
    //           const split = translatedSourceMemberIp.split('/');

    //           // see if networkObjectIP is a subnet
    //           if (split.length > 1) {
    //             const destSubnetInfo = this.calculateSubnet(searchDto.translatedSourceIpLookup, translatedSourceMember);
    //             if (destSubnetInfo.inRange) {
    //               checkList.originalDestInRange = true;
    //             }
    //           }

    //           // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //           else {
    //             if (searchDto.translatedSourceIpLookup === translatedSourceMemberIp) {
    //               checkList.translatedSourceInRange = true;
    //             }
    //           }
    //         }

    //         // if networkObject is a range of IPs
    //         else if (translatedSourceMember.type === 'Range') {
    //           // convert the start and end IPs to numbers
    //           const startIpNum = this.dot2num(translatedSourceMember.startIpAddress);
    //           const endIpNum = this.dot2num(translatedSourceMember.endIpAddress);

    //           // convert the sourceIP to a number
    //           const searchIpNum = this.dot2num(searchDto.translatedSourceIpLookup);

    //           // if the searchIpNum falls in between the startIpNum and endIpNum
    //           // we know it is within the range provided
    //           if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //             checkList.translatedSourceInRange = true;
    //           }
    //         }
    //       });
    //     }
    //     if (rule.translatedDestinationAddressType === 'NetworkObject') {
    //       const translatedDestinationNetworkObject = rule.translatedDestinationNetworkObject;
    //       // if networkObject is an IP/Subnet
    //       if (translatedDestinationNetworkObject.type === 'IpAddress') {
    //         // get networkObjectIP
    //         const translatedDestIp = translatedDestinationNetworkObject.ipAddress;
    //         const split = translatedDestIp.split('/');

    //         // see if networkObjectIP is a subnet
    //         if (split.length > 1) {
    //           const sourceSubnetInfo = this.calculateSubnet(searchDto.translatedDestIpLookup, translatedDestIp);
    //           if (sourceSubnetInfo.inRange) {
    //             checkList.translatedDestInRange = true;
    //           }
    //         }

    //         // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //         else {
    //           if (searchDto.translatedDestIpLookup === translatedDestIp) {
    //             checkList.translatedDestInRange = true;
    //           }
    //         }
    //       }

    //       // if networkObject is a range of IPs
    //       else if (translatedDestinationNetworkObject.type === 'Range') {
    //         // convert the start and end IPs to numbers
    //         const startIpNum = this.dot2num(translatedDestinationNetworkObject.startIpAddress);
    //         const endIpNum = this.dot2num(translatedDestinationNetworkObject.endIpAddress);

    //         // convert the sourceIP to a number
    //         const searchIpNum = this.dot2num(searchDto.translatedDestIpLookup);

    //         // if the searchIpNum falls in between the startIpNum and endIpNum
    //         // we know it is within the range provided
    //         if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //           checkList.translatedDestInRange = true;
    //         }
    //       }
    //     }

    //     if (rule.translatedDestinationAddressType === 'NetworkObjectGroup') {
    //       const translatedDestinationNetworkObjectGroup = rule.translatedDestinationNetworkObjectGroup;
    //       const networkObjectMembers = translatedDestinationNetworkObjectGroup.networkObjects;
    //       networkObjectMembers.map(translatedDestMember => {
    //         if (translatedDestMember.type === 'IpAddress') {
    //           // get networkObjectIP
    //           const translatedDestMemberIp = translatedDestMember.ipAddress;
    //           const split = translatedDestMemberIp.split('/');

    //           // see if networkObjectIP is a subnet
    //           if (split.length > 1) {
    //             const destSubnetInfo = this.calculateSubnet(searchDto.translatedDestIpLookup, translatedDestMember);
    //             if (destSubnetInfo.inRange) {
    //               checkList.translatedDestInRange = true;
    //             }
    //           }

    //           // if networkObjectIP is an IP and not a subnet, just check for a complete match
    //           else {
    //             if (searchDto.translatedDestIpLookup === translatedDestMemberIp) {
    //               checkList.translatedDestInRange = true;
    //             }
    //           }
    //         }

    //         // if networkObject is a range of IPs
    //         else if (translatedDestMember.type === 'Range') {
    //           // convert the start and end IPs to numbers
    //           const startIpNum = this.dot2num(translatedDestMember.startIpAddress);
    //           const endIpNum = this.dot2num(translatedDestMember.endIpAddress);

    //           // convert the sourceIP to a number
    //           const searchIpNum = this.dot2num(searchDto.translatedDestIpLookup);

    //           // if the searchIpNum falls in between the startIpNum and endIpNum
    //           // we know it is within the range provided
    //           if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
    //             checkList.translatedDestInRange = true;
    //           }
    //         }
    //       });
    //     }
    //     // if the source port contains a dash
    //     // set an error on the form field as we do not allow searching for a range of IPs
    //     if (searchDto.originalPortLookup.includes('-')) {
    //       this.form.controls.sourcePorts.setErrors({ portRangeNotAllowed: true });
    //     }

    //     // if the dest port contains a dash
    //     // set an error on the form field as we do not allow searching for a range of IPs
    //     if (searchDto.translatedPortLookup.includes('-')) {
    //       this.form.controls.destinationPorts.setErrors({ portRangeNotAllowed: true });
    //     }

    //     if (rule.originalServiceType === 'ServiceObject') {
    //       const originalServiceObject = rule.originalServiceObject;
    //       if (originalServiceObject.sourcePorts === searchDto.originalPortLookup) {
    //         checkList.originalPortMatch = true;
    //       }
    //     }

    //     if (rule.translatedServiceType === 'ServiceObject') {
    //       const translatedServiceObject = rule.translatedServiceObject;
    //       if (translatedServiceObject.sourcePorts === searchDto.translatedPortLookup) {
    //         checkList.translatedPortMatch = true;
    //       }
    //     }

    //     // evaluate if direction matches
    //     if (searchDto.directionLookup === rule.direction) {
    //       checkList.directionMatch = true;
    //     }

    //     // evaluate if direction matches
    //     if (searchDto.biDirectionalLookup === rule.biDirectional) {
    //       checkList.biDirectionalMatch = true;
    //     }

    //     if (searchDto.enabledLookup === rule.enabled) {
    //       checkList.enabledMatch = true;
    //     }

    //     // final check list
    //     // if all conditions are true, the rule is a hit
    //     if (
    //       checkList.originalDestInRange &&
    //       checkList.directionMatch &&
    //       checkList.originalSourceInRange &&
    //       checkList.translatedSourceInRange &&
    //       checkList.translatedDestInRange &&
    //       checkList.biDirectionalMatch
    //     ) {
    //       this.rulesHit.push(rule.name);
    //     } else if (
    //       checkList.originalSourceInRange ||
    //       checkList.originalDestInRange ||
    //       checkList.originalPortMatch ||
    //       checkList.translatedSourceInRange ||
    //       checkList.translatedDestInRange ||
    //       checkList.translatedPortMatch
    //     ) {
    //       // this.partialMatches.push({ checkList, name: rule.name });
    //     }
    //   }),
    // );
  }

  get f() {
    return this.form.controls;
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      direction: [''],
      biDirectional: [''],
      enabled: [true],

      originalSourceIp: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      originalDestinationIp: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      originalPort: ['', ValidatePortRange],

      translatedSourceIp: ['', IpAddressAnyValidator],
      translatedDestinationIp: ['', IpAddressAnyValidator],
      translatedPort: ['', ValidatePortRange],

      //   translationType: [''],
    });
  }

  reset(): void {
    this.submitted = false;
    this.rulesHit = [];
    this.showPartials = false;
    this.form.reset();
    this.ngx.resetModalData('natRulePacketTracer');
    this.buildForm();
  }

  close(): void {
    this.reset();
    this.ngx.close('natRulePacketTracer');
  }
}
