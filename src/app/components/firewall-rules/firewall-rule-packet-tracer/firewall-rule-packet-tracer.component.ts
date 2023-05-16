import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { V1NetworkSecurityNetworkObjectGroupsService, V1NetworkSecurityNetworkObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { IpAddressAnyValidator, ValidatePortRange } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-firewall-rule-packet-tracer',
  templateUrl: './firewall-rule-packet-tracer.component.html',
})
export class FirewallRulePacketTracerComponent implements OnInit {
  @Input() objects;
  form: FormGroup;
  submitted: boolean;
  modalBody;
  modalTitle;

  rulesHit = [];
  partialMatches = [];
  showPartials = false;
  doneSearching = false;
  protocolSubscription: Subscription;
  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
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

    // if we ever want to display all subnets
    // const subnets = [];
    // for (let i = 32; i >= 0; i--) {
    //   subnets.push(this.num2dot(2 ** 32 - 2 ** i));
    // }
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
  //   var parts = [];
  //   ipv6.split(':').forEach(function(it) {
  //     var bin = parseInt(it, 16).toString(2);
  //     while (bin.length < 16) {
  //       bin = '0' + bin;
  //     }
  //     parts.push(bin);
  //   });
  //   var bin = parts.join('');

  //   // Use BigInteger library
  //   // var dec = BigInt(bin).toString()
  //   // var dec2 = parseInt(dec, 2)
  //   // var dec3 = BigInt(dec2)
  //   console.log(bin);
  // }

  // TO DO : IPv6 Searches
  async search() {
    this.partialMatches = [];
    this.rulesHit = [];
    this.showPartials = false;
    this.submitted = true;
    let portsRequired = false;
    if (this.form.invalid) {
      return;
    }
    const searchDto = {
      directionLookup: this.form.controls.direction.value,
      protocolLookup: this.form.controls.protocol.value,
      enabledLookup: this.form.controls.enabled.value,
      sourceIpLookup: this.form.controls.sourceIpAddress.value,
      destIpLookup: this.form.controls.destinationIpAddress.value,
      sourcePortsLookup: this.form.controls.sourcePorts.value,
      destPortsLookup: this.form.controls.destinationPorts.value,
    };
    if (searchDto.protocolLookup === 'TCP' || searchDto.protocolLookup === 'UDP') {
      portsRequired = true;
    }
    await Promise.all(
      this.objects.firewallRules.map(async rule => {
        const checkList = {
          sourceInRange: false,
          destInRange: false,
          sourcePortMatch: false,
          destPortMatch: false,
          directionMatch: false,
          protocolMatch: false,
          enabledMatch: false,
        };
        // if rule source is ip address
        if (rule.sourceAddressType === 'IpAddress') {
          // see if the sourceIpAddress is a subnet
          const split = rule.sourceIpAddress.split('/');

          // if it is a subnet, calculate the range and see if the sourceIpLookup falls within the subnet
          if (split.length > 1) {
            const sourceSubnetInfo = this.calculateSubnet(searchDto.sourceIpLookup, rule.sourceIpAddress);
            if (sourceSubnetInfo.inRange) {
              checkList.sourceInRange = true;
            }
          }

          // if sourceIpAddress is an IP and not a subnet, just check for a complete match
          else {
            if (searchDto.sourceIpLookup === rule.sourceIpAddress) {
              checkList.sourceInRange = true;
            }
          }
        }

        // if rule source is network object
        else if (rule.sourceAddressType === 'NetworkObject') {
          const sourceNetworkObject = await this.getNetworkObjectInfo(rule.sourceNetworkObjectId);
          // if networkObject is an IP/Subnet
          if (sourceNetworkObject.type === 'IpAddress') {
            // get networkObjectIP
            const ruleSourceIp = sourceNetworkObject.ipAddress;
            const split = ruleSourceIp.split('/');

            // see if networkObjectIP is a subnet
            if (split.length > 1) {
              const sourceSubnetInfo = this.calculateSubnet(searchDto.sourceIpLookup, ruleSourceIp);
              if (sourceSubnetInfo.inRange) {
                checkList.sourceInRange = true;
              }
            }

            // if networkObjectIP is an IP and not a subnet, just check for a complete match
            else {
              if (searchDto.sourceIpLookup === ruleSourceIp) {
                checkList.sourceInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (sourceNetworkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(sourceNetworkObject.startIpAddress);
            const endIpNum = this.dot2num(sourceNetworkObject.endIpAddress);

            // convert the sourceIP to a number
            const searchIpNum = this.dot2num(searchDto.sourceIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.sourceInRange = true;
            }
          }
        } else if (rule.sourceAddressType === 'NetworkObjectGroup') {
          const sourceNetworkObjectGroup = await this.getNetworkObjectGroupInfo(rule.sourceNetworkObjectGroupId);
          const networkObjectMembers = sourceNetworkObjectGroup.networkObjects;
          networkObjectMembers.forEach(sourceMember => {
            if (sourceMember.type === 'IpAddress') {
              // get networkObjectIP
              const sourceMemberIp = sourceMember.ipAddress;
              const split = sourceMemberIp.split('/');

              // see if networkObjectIP is a subnet
              if (split.length > 1) {
                const sourceSubnetInfo = this.calculateSubnet(searchDto.sourceIpLookup, sourceMemberIp);
                if (sourceSubnetInfo.inRange) {
                  checkList.sourceInRange = true;
                }
              }

              // if networkObjectIP is an IP and not a subnet, just check for a complete match
              else {
                if (searchDto.sourceIpLookup === sourceMemberIp) {
                  checkList.sourceInRange = true;
                }
              }
            }

            // if networkObject is a range of IPs
            else if (sourceMember.type === 'Range') {
              // convert the start and end IPs to numbers
              const startIpNum = this.dot2num(sourceMember.startIpAddress);
              const endIpNum = this.dot2num(sourceMember.endIpAddress);

              // convert the sourceIP to a number
              const searchIpNum = this.dot2num(searchDto.sourceIpLookup);

              // if the searchIpNum falls in between the startIpNum and endIpNum
              // we know it is within the range provided
              if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
                checkList.sourceInRange = true;
              }
            }
          });
        }

        // if rule destination is an IP/subnet
        if (rule.destinationAddressType === 'IpAddress') {
          const split = rule.destinationIpAddress.split('/');

          // if it is a subnet, calculate the range and see if the destIpLookup falls within the subnet
          if (split.length > 1) {
            const destSubnetInfo = this.calculateSubnet(searchDto.destIpLookup, rule.destinationIpAddress);
            if (destSubnetInfo.inRange) {
              checkList.destInRange = true;
            }
          }

          // if destIpAddress is an IP and not a subnet, just check for a complete match
          else {
            if (searchDto.destIpLookup === rule.destinationIpAddress) {
              checkList.destInRange = true;
            }
          }
        }

        // if rule destination is a network object
        if (rule.destinationAddressType === 'NetworkObject') {
          const destNetworkObject = await this.getNetworkObjectInfo(rule.destinationNetworkObjectId);
          // if destNetworkObject is an IP/subnet
          if (destNetworkObject.type === 'IpAddress') {
            const ruleDestIp = destNetworkObject.ipAddress;
            const split = ruleDestIp.split('/');

            // if it is a subnet, calculate the range and see if the destIpLookup falls within the subnet
            if (split.length > 1) {
              const destSubnetInfo = this.calculateSubnet(searchDto.destIpLookup, ruleDestIp);
              if (destSubnetInfo.inRange) {
                checkList.destInRange = true;
              }
            }
            // if destNetworkObject is an IP and not a subnet, just check for a complete match
            else {
              if (searchDto.destIpLookup === ruleDestIp) {
                checkList.destInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (destNetworkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(destNetworkObject.startIpAddress);
            const endIpNum = this.dot2num(destNetworkObject.endIpAddress);

            // convert the searchIpNum to a number
            const searchIpNum = this.dot2num(searchDto.destIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.destInRange = true;
            }
          }
        }
        if (rule.destinationAddressType === 'NetworkObjectGroup') {
          const destNetworkObjectGroup = await this.getNetworkObjectGroupInfo(rule.destinationNetworkObjectGroupId);
          const networkObjectMembers = destNetworkObjectGroup.networkObjects;
          networkObjectMembers.forEach(destMember => {
            if (destMember.type === 'IpAddress') {
              // get networkObjectIP
              const destMemberIp = destMember.ipAddress;
              const split = destMemberIp.split('/');

              // see if networkObjectIP is a subnet
              if (split.length > 1) {
                const destSubnetInfo = this.calculateSubnet(searchDto.destIpLookup, destMemberIp);
                if (destSubnetInfo.inRange) {
                  checkList.destInRange = true;
                }
              }

              // if networkObjectIP is an IP and not a subnet, just check for a complete match
              else {
                if (searchDto.destIpLookup === destMemberIp) {
                  checkList.destInRange = true;
                }
              }
            }

            // if networkObject is a range of IPs
            else if (destMember.type === 'Range') {
              // convert the start and end IPs to numbers
              const startIpNum = this.dot2num(destMember.startIpAddress);
              const endIpNum = this.dot2num(destMember.endIpAddress);

              // convert the sourceIP to a number
              const searchIpNum = this.dot2num(searchDto.destIpLookup);

              // if the searchIpNum falls in between the startIpNum and endIpNum
              // we know it is within the range provided
              if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
                checkList.destInRange = true;
              }
            }
          });
        }

        // if the source port contains a dash
        // set an error on the form field as we do not allow searching for a range of IPs
        if (searchDto.sourcePortsLookup.includes('-')) {
          this.form.controls.sourcePorts.setErrors({ portRangeNotAllowed: true });
        }

        // if the dest port contains a dash
        // set an error on the form field as we do not allow searching for a range of IPs
        if (searchDto.destPortsLookup.includes('-')) {
          this.form.controls.destinationPorts.setErrors({ portRangeNotAllowed: true });
        }

        // evaluate if source ports match
        if (searchDto.sourcePortsLookup === rule.sourcePorts) {
          checkList.sourcePortMatch = true;
        }

        // evaluate if dest ports match
        if (searchDto.destPortsLookup === rule.destinationPorts) {
          checkList.destPortMatch = true;
        }

        // evaluate if direction matches
        if (searchDto.directionLookup === rule.direction) {
          checkList.directionMatch = true;
        }

        // evaluate if protocol matches
        if (searchDto.protocolLookup === rule.protocol) {
          checkList.protocolMatch = true;
        }

        if (searchDto.enabledLookup === rule.enabled) {
          checkList.enabledMatch = true;
        }

        // final check list
        // if all conditions are true, the rule is a hit

        // if TCP or UDP has been selected for the protocolLookup
        // we must check source and destPort to get total rule matches
        if (portsRequired) {
          if (
            checkList.destInRange &&
            checkList.destPortMatch &&
            checkList.directionMatch &&
            checkList.protocolMatch &&
            checkList.sourceInRange &&
            checkList.sourcePortMatch &&
            checkList.enabledMatch
          ) {
            this.rulesHit.push(rule.name);
          } else if (
            checkList.destInRange ||
            checkList.destPortMatch ||
            checkList.directionMatch ||
            checkList.protocolMatch ||
            checkList.sourceInRange ||
            checkList.sourcePortMatch
          ) {
            // const keyValues = await this.getFalseValue(checkList);
            // const falseProperties = []
            // for (const [key, value] of Object.entries(checkList)) {
            //   if (value == false) {
            //     falseProperties.push({key: value})
            //   }
            // }
            this.partialMatches.push({ checkList, name: rule.name });
          }
        } else {
          // since the source and destPorts are not required
          // we can delete them from the checkList
          delete checkList.destPortMatch;
          delete checkList.sourcePortMatch;
          if (
            checkList.destInRange &&
            checkList.directionMatch &&
            checkList.protocolMatch &&
            checkList.sourceInRange &&
            checkList.enabledMatch
          ) {
            this.rulesHit.push(rule.name);
          } else if (checkList.destInRange || checkList.directionMatch || checkList.protocolMatch || checkList.sourceInRange) {
            this.partialMatches.push({ checkList, name: rule.name });
          }
        }
      }),
    );
    this.doneSearching = true;
    // return this.rulesHit;
  }

  get f() {
    return this.form.controls;
  }

  getNetworkObjectInfo(networkObjectId) {
    return this.networkObjectService.getOneNetworkObject({ id: networkObjectId }).toPromise();
  }

  getNetworkObjectGroupInfo(networkObjectGroupId) {
    return this.networkObjectGroupService.getOneNetworkObjectGroup({ id: networkObjectGroupId, join: ['networkObjects'] }).toPromise();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      direction: [''],
      protocol: [''],
      enabled: [true],
      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],

      sourcePorts: ['', ValidatePortRange],
      destinationPorts: ['', ValidatePortRange],
    });
  }

  // setFormValidators() {
  //   this.protocolSubscription = this.form.controls.protocol.valueChanges.subscribe(protocol => {
  //     if (protocol === 'IP' || protocol === 'ICMP') {
  //       this.form.controls.sourcePorts.setValidators(null);
  //       this.form.controls.destinationPorts.setValidators(null);
  //     } else {
  //       this.form.controls.sourcePorts.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
  //       this.form.controls.destinationPorts.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
  //     }

  //     this.form.controls.sourcePorts.updateValueAndValidity();
  //     this.form.controls.destinationPorts.updateValueAndValidity();
  //   });
  // }

  reset(): void {
    this.submitted = false;
    this.rulesHit = [];
    this.partialMatches = [];
    this.showPartials = false;
    this.form.reset();
    this.ngx.resetModalData('firewallRulePacketTracer');
    this.buildForm();
  }

  close(): void {
    this.reset();
    this.ngx.close('firewallRulePacketTracer');
  }
}
