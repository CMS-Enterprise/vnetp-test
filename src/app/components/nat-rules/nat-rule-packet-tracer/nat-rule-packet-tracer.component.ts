import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';

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
  partialMatches = [];
  showPartials = false;
  protocolSubscription: Subscription;
  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
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

  // TO DO : IPv6
  convertIpv6(ipv6): void {
    // const ipv6Subnet = '2001:db8:0:0:8d3::/64';
    // simulate your address.binaryZeroPad(); method
    const parts = [];
    ipv6.split(':').forEach(it => {
      let bin = parseInt(it, 16).toString(2);
      while (bin.length < 16) {
        bin = '0' + bin;
      }
      parts.push(bin);
    });
    const bin = parts.join('');

    // Use BigInteger library
    // var dec = BigInt(bin).toString()
    // var dec2 = parseInt(dec, 2)
    // var dec3 = BigInt(dec2)
    console.log(bin);
  }

  // TO DO : IPv6 Searches
  async search() {
    this.partialMatches = [];
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
    await Promise.all(
      this.objects.natRules.map(async rule => {
        const checkList = {
          originalSourceInRange: false,
          originalDestInRange: false,
          originalPortMatch: false,

          translatedSourceInRange: false,
          translatedDestInRange: false,
          translatedPortMatch: false,

          directionMatch: false,
          biDirectionalMatch: false,
          enabledMatch: false,
        };

        // if rule source is network object
        if (rule.originalSourceAddressType === 'NetworkObject') {
          const originalSourceNetworkObject = await this.getNetworkObjectInfo(rule.originalSourceNetworkObjectId);
          // if networkObject is an IP/Subnet
          if (originalSourceNetworkObject.type === 'IpAddress') {
            // get networkObjectIP
            const originalSourceIp = originalSourceNetworkObject.ipAddress;
            const split = originalSourceIp.split('/');

            // see if networkObjectIP is a subnet
            if (split.length > 1) {
              const sourceSubnetInfo = this.calculateSubnet(searchDto.originalSourceIpLookup, originalSourceIp);
              if (sourceSubnetInfo.inRange) {
                checkList.originalSourceInRange = true;
              }
            }

            // if networkObjectIP is an IP and not a subnet, just check for a complete match
            else {
              if (searchDto.originalSourceIpLookup === originalSourceIp) {
                checkList.originalSourceInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (originalSourceNetworkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(originalSourceNetworkObject.startIpAddress);
            const endIpNum = this.dot2num(originalSourceNetworkObject.endIpAddress);

            // convert the sourceIP to a number
            const searchIpNum = this.dot2num(searchDto.originalSourceIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.originalSourceInRange = true;
            }
          }
        } else if (rule.originalSourceAddressType === 'NetworkObjectGroup') {
          const originalSourceNetworkObjectGroup = await this.getNetworkObjectGroupInfo(rule.originalSourceNetworkObjectGroupId);
          const networkObjectMembers = originalSourceNetworkObjectGroup.networkObjects;
          networkObjectMembers.map(originalSourceMember => {
            if (originalSourceMember.type === 'IpAddress') {
              // get networkObjectIP
              const originalSourceMemberIp = originalSourceMember.ipAddress;
              const split = originalSourceMemberIp.split('/');

              // see if networkObjectIP is a subnet
              if (split.length > 1) {
                const sourceSubnetInfo = this.calculateSubnet(searchDto.originalSourceIpLookup, originalSourceMemberIp);
                if (sourceSubnetInfo.inRange) {
                  checkList.originalSourceInRange = true;
                }
              }

              // if networkObjectIP is an IP and not a subnet, just check for a complete match
              else {
                if (searchDto.originalSourceIpLookup === originalSourceMemberIp) {
                  checkList.originalSourceInRange = true;
                }
              }
            }

            // if networkObject is a range of IPs
            else if (originalSourceMember.type === 'Range') {
              // convert the start and end IPs to numbers
              const startIpNum = this.dot2num(originalSourceMember.startIpAddress);
              const endIpNum = this.dot2num(originalSourceMember.endIpAddress);

              // convert the sourceIP to a number
              const searchIpNum = this.dot2num(searchDto.originalSourceIpLookup);

              // if the searchIpNum falls in between the startIpNum and endIpNum
              // we know it is within the range provided
              if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
                checkList.originalSourceInRange = true;
              }
            }
          });
        }
        // if rule destination is a network object
        if (rule.originalDestinationAddressType === 'NetworkObject') {
          const originalDestNetworkObject = await this.getNetworkObjectInfo(rule.originalDestinationNetworkObjectId);
          // if destNetworkObject is an IP/subnet
          if (originalDestNetworkObject.type === 'IpAddress') {
            const ruleDestIp = originalDestNetworkObject.ipAddress;
            const split = ruleDestIp.split('/');

            // if it is a subnet, calculate the range and see if the destIpLookup falls within the subnet
            if (split.length > 1) {
              const destSubnetInfo = this.calculateSubnet(searchDto.originalDestIpLookup, ruleDestIp);
              if (destSubnetInfo.inRange) {
                checkList.originalDestInRange = true;
              }
            }
            // if destNetworkObject is an IP and not a subnet, just check for a complete match
            else {
              if (searchDto.originalDestIpLookup === ruleDestIp) {
                checkList.originalDestInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (originalDestNetworkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(originalDestNetworkObject.startIpAddress);
            const endIpNum = this.dot2num(originalDestNetworkObject.endIpAddress);

            // convert the searchIpNum to a number
            const searchIpNum = this.dot2num(searchDto.originalDestIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.originalDestInRange = true;
            }
          }
        }
        if (rule.originalDestinationAddressType === 'NetworkObjectGroup') {
          const origianlDestNetworkObjectGroup = await this.getNetworkObjectGroupInfo(rule.originalDestinationNetworkObjectGroupId);
          const networkObjectMembers = origianlDestNetworkObjectGroup.networkObjects;
          networkObjectMembers.map(originalDestMember => {
            if (originalDestMember.type === 'IpAddress') {
              // get networkObjectIP
              const originalDestMemberIp = originalDestMember.ipAddress;
              const split = originalDestMemberIp.split('/');

              // see if networkObjectIP is a subnet
              if (split.length > 1) {
                const destSubnetInfo = this.calculateSubnet(searchDto.originalDestIpLookup, originalDestMember);
                if (destSubnetInfo.inRange) {
                  checkList.originalDestInRange = true;
                }
              }

              // if networkObjectIP is an IP and not a subnet, just check for a complete match
              else {
                if (searchDto.originalDestIpLookup === originalDestMemberIp) {
                  checkList.originalDestInRange = true;
                }
              }
            }

            // if networkObject is a range of IPs
            else if (originalDestMember.type === 'Range') {
              // convert the start and end IPs to numbers
              const startIpNum = this.dot2num(originalDestMember.startIpAddress);
              const endIpNum = this.dot2num(originalDestMember.endIpAddress);

              // convert the sourceIP to a number
              const searchIpNum = this.dot2num(searchDto.originalDestIpLookup);

              // if the searchIpNum falls in between the startIpNum and endIpNum
              // we know it is within the range provided
              if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
                checkList.originalDestInRange = true;
              }
            }
          });
        }

        if (rule.translatedSourceAddressType === 'NetworkObject') {
          const translatedSourceNetworkObject = await this.getNetworkObjectInfo(rule.translatedSourceNetworkObjectId);
          // if networkObject is an IP/Subnet
          if (translatedSourceNetworkObject.type === 'IpAddress') {
            // get networkObjectIP
            const translatedSourceIp = translatedSourceNetworkObject.ipAddress;
            const split = translatedSourceIp.split('/');

            // see if networkObjectIP is a subnet
            if (split.length > 1) {
              const sourceSubnetInfo = this.calculateSubnet(searchDto.translatedSourceIpLookup, translatedSourceIp);
              if (sourceSubnetInfo.inRange) {
                checkList.translatedSourceInRange = true;
              }
            }

            // if networkObjectIP is an IP and not a subnet, just check for a complete match
            else {
              if (searchDto.translatedSourceIpLookup === translatedSourceIp) {
                checkList.translatedSourceInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (translatedSourceNetworkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(translatedSourceNetworkObject.startIpAddress);
            const endIpNum = this.dot2num(translatedSourceNetworkObject.endIpAddress);

            // convert the sourceIP to a number
            const searchIpNum = this.dot2num(searchDto.translatedSourceIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.translatedSourceInRange = true;
            }
          }
        }

        if (rule.translatedSourceAddressType === 'NetworkObjectGroup') {
          const translatedSouceNetworkObjectGroup = await this.getNetworkObjectGroupInfo(rule.translatedSourceNetworkObjectGroupId);
          const networkObjectMembers = translatedSouceNetworkObjectGroup.networkObjects;
          networkObjectMembers.map(translatedSourceMember => {
            if (translatedSourceMember.type === 'IpAddress') {
              // get networkObjectIP
              const translatedSourceMemberIp = translatedSourceMember.ipAddress;
              const split = translatedSourceMemberIp.split('/');

              // see if networkObjectIP is a subnet
              if (split.length > 1) {
                const destSubnetInfo = this.calculateSubnet(searchDto.translatedSourceIpLookup, translatedSourceMember);
                if (destSubnetInfo.inRange) {
                  checkList.originalDestInRange = true;
                }
              }

              // if networkObjectIP is an IP and not a subnet, just check for a complete match
              else {
                if (searchDto.translatedSourceIpLookup === translatedSourceMemberIp) {
                  checkList.translatedSourceInRange = true;
                }
              }
            }

            // if networkObject is a range of IPs
            else if (translatedSourceMember.type === 'Range') {
              // convert the start and end IPs to numbers
              const startIpNum = this.dot2num(translatedSourceMember.startIpAddress);
              const endIpNum = this.dot2num(translatedSourceMember.endIpAddress);

              // convert the sourceIP to a number
              const searchIpNum = this.dot2num(searchDto.translatedSourceIpLookup);

              // if the searchIpNum falls in between the startIpNum and endIpNum
              // we know it is within the range provided
              if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
                checkList.translatedSourceInRange = true;
              }
            }
          });
        }
        if (rule.translatedDestinationAddressType === 'NetworkObject') {
          const translatedDestinationNetworkObject = await this.getNetworkObjectInfo(rule.translatedDestinationNetworkObjectId);
          // if networkObject is an IP/Subnet
          if (translatedDestinationNetworkObject.type === 'IpAddress') {
            // get networkObjectIP
            const translatedDestIp = translatedDestinationNetworkObject.ipAddress;
            const split = translatedDestIp.split('/');

            // see if networkObjectIP is a subnet
            if (split.length > 1) {
              const sourceSubnetInfo = this.calculateSubnet(searchDto.translatedDestIpLookup, translatedDestIp);
              if (sourceSubnetInfo.inRange) {
                checkList.translatedDestInRange = true;
              }
            }

            // if networkObjectIP is an IP and not a subnet, just check for a complete match
            else {
              if (searchDto.translatedDestIpLookup === translatedDestIp) {
                checkList.translatedDestInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (translatedDestinationNetworkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(translatedDestinationNetworkObject.startIpAddress);
            const endIpNum = this.dot2num(translatedDestinationNetworkObject.endIpAddress);

            // convert the sourceIP to a number
            const searchIpNum = this.dot2num(searchDto.translatedDestIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.translatedDestInRange = true;
            }
          }
        }

        if (rule.translatedDestinationAddressType === 'NetworkObjectGroup') {
          const translatedDestinatioNetworkObjectGroup = await this.getNetworkObjectGroupInfo(
            rule.translatedDestinationNetworkObjectGroupId,
          );
          const networkObjectMembers = translatedDestinatioNetworkObjectGroup.networkObjects;
          networkObjectMembers.map(translatedDestMember => {
            if (translatedDestMember.type === 'IpAddress') {
              // get networkObjectIP
              const translatedDestMemberIp = translatedDestMember.ipAddress;
              const split = translatedDestMemberIp.split('/');

              // see if networkObjectIP is a subnet
              if (split.length > 1) {
                const destSubnetInfo = this.calculateSubnet(searchDto.translatedDestIpLookup, translatedDestMember);
                if (destSubnetInfo.inRange) {
                  checkList.translatedDestInRange = true;
                }
              }

              // if networkObjectIP is an IP and not a subnet, just check for a complete match
              else {
                if (searchDto.translatedDestIpLookup === translatedDestMemberIp) {
                  checkList.translatedDestInRange = true;
                }
              }
            }

            // if networkObject is a range of IPs
            else if (translatedDestMember.type === 'Range') {
              // convert the start and end IPs to numbers
              const startIpNum = this.dot2num(translatedDestMember.startIpAddress);
              const endIpNum = this.dot2num(translatedDestMember.endIpAddress);

              // convert the sourceIP to a number
              const searchIpNum = this.dot2num(searchDto.translatedDestIpLookup);

              // if the searchIpNum falls in between the startIpNum and endIpNum
              // we know it is within the range provided
              if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
                checkList.translatedDestInRange = true;
              }
            }
          });
        }
        // if the source port contains a dash
        // set an error on the form field as we do not allow searching for a range of IPs
        if (searchDto.originalPortLookup.includes('-')) {
          this.form.controls.sourcePorts.setErrors({ portRangeNotAllowed: true });
        }

        // if the dest port contains a dash
        // set an error on the form field as we do not allow searching for a range of IPs
        if (searchDto.translatedPortLookup.includes('-')) {
          this.form.controls.destinationPorts.setErrors({ portRangeNotAllowed: true });
        }

        if (rule.originalServiceType === 'ServiceObject') {
          const originalServiceObject = await this.getServiceObjectInfo(rule.originalServiceObjectId);
          if (originalServiceObject.sourcePorts === searchDto.originalPortLookup) {
            checkList.originalPortMatch = true;
          }
        }

        if (rule.translatedServiceType === 'ServiceObject') {
          const translatedServiceObject = await this.getServiceObjectInfo(rule.translatedServiceObjectId);
          if (translatedServiceObject.sourcePorts === searchDto.translatedPortLookup) {
            checkList.translatedPortMatch = true;
          }
        }

        // evaluate if direction matches
        if (searchDto.directionLookup === rule.direction) {
          checkList.directionMatch = true;
        }

        // evaluate if direction matches
        if (searchDto.biDirectionalLookup === rule.biDirectional) {
          checkList.biDirectionalMatch = true;
        }

        if (searchDto.enabledLookup === rule.enabled) {
          checkList.enabledMatch = true;
        }

        // final check list
        // if all conditions are true, the rule is a hit
        if (
          checkList.originalDestInRange &&
          checkList.directionMatch &&
          checkList.originalSourceInRange &&
          checkList.translatedSourceInRange &&
          checkList.translatedDestInRange &&
          checkList.biDirectionalMatch
        ) {
          this.rulesHit.push(rule.name);
        } else if (
          checkList.originalSourceInRange ||
          checkList.originalDestInRange ||
          checkList.originalPortMatch ||
          checkList.translatedSourceInRange ||
          checkList.translatedDestInRange ||
          checkList.translatedPortMatch
        ) {
          this.partialMatches.push({ checkList, name: rule.name });
        }
      }),
    );
    return this.rulesHit;
  }

  get f() {
    return this.form.controls;
  }

  async getServiceObjectInfo(serviceObjectId) {
    return this.serviceObjectService.getOneServiceObject({ id: serviceObjectId }).toPromise();
  }

  async getNetworkObjectInfo(networkObjectId) {
    return this.networkObjectService.getOneNetworkObject({ id: networkObjectId }).toPromise();
  }

  async getNetworkObjectGroupInfo(networkObjectGroupId) {
    return this.networkObjectGroupService.getOneNetworkObjectGroup({ id: networkObjectGroupId, join: ['networkObjects'] }).toPromise();
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
    this.partialMatches = [];
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
