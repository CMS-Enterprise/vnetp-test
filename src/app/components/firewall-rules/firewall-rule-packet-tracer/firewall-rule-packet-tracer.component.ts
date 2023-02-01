import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { V1NetworkSecurityNetworkObjectGroupsService, V1NetworkSecurityNetworkObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
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
  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  calculateSubnet(ipToSearch, ipAddress) {
    const split = ipAddress.split('/');
    const [ip, cidr] = split;
    const ipNumber = this.dot2num(ip);
    const ipToSearchNum = this.dot2num(ipToSearch);
    const ipToRange = this.ipToRange(ipToSearchNum, ipNumber, cidr);

    const subnets = [];
    for (let i = 32; i >= 0; i--) {
      subnets.push(this.num2dot(2 ** 32 - 2 ** i));
    }
    // console.log('subnets', subnets)

    return ipToRange;
  }

  cidrSize(cidrSlash) {
    return Math.pow(2, 32 - cidrSlash);
  }

  ipToRange(ipToCheckNum, ip, cidr) {
    const size = this.cidrSize(cidr);
    const startIpNum = ip - (ip % size);
    const endIpNum = startIpNum + size - 1;
    let inRange = false;
    // console.log('startIpNum', startIpNum)
    // console.log('endIpNum', endIpNum)
    // console.log('in range')
    if (startIpNum <= ipToCheckNum && endIpNum >= ipToCheckNum) {
      inRange = true;
    }
    const ipToCheckStr = this.num2dot(ipToCheckNum);
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

  rangeToString(ip, cidr) {
    return ip.join('.') + '/' + cidr;
  }

  num2dot(num) {
    let d: any = num % 256;
    for (var i = 3; i > 0; i--) {
      num = Math.floor(num / 256);
      d = (num % 256) + '.' + d;
    }
    return d;
  }

  dot2num(dot) {
    var d = dot.split('.');
    return ((+d[0] * 256 + +d[1]) * 256 + +d[2]) * 256 + +d[3];
  }

  getData() {
    console.log('this.objects', this.objects);
    // this.calculateSubnet('192.168.0.0')
  }

  search() {
    this.submitted = true;
    // if (this.form.invalid) {
    //   return;
    // }
    const searchDto = {
      directionLookup: this.form.controls.direction.value,
      protocolLookup: this.form.controls.protocol.value,
      sourceIpLookup: this.form.controls.sourceIpAddress.value,
      destIpLookup: this.form.controls.destinationIpAddress.value,
      sourcePortsLookup: this.form.controls.sourcePorts.value,
      destPortsLookup: this.form.controls.destinationPorts.value,
    };

    const checkList = {
      sourceInRange: false,
      destInRange: false,
      sourcePortMatch: false,
      destPortMatch: false,
      directionMatch: false,
      protocolMatch: false,
    };
    this.objects.firewallRules.map(rule => {
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
        this.networkObjectService.getOneNetworkObject({ id: rule.sourceNetworkObjectId }).subscribe(networkObject => {
          // if networkObject is an IP/Subnet
          if (networkObject.type === 'IpAddress') {
            // get networkObjectIP
            const ruleSourceIp = networkObject.ipAddress;
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
          else if (networkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(networkObject.startIpAddress);
            const endIpNum = this.dot2num(networkObject.endIpAddress);

            // convert the searchIP to a number
            const searchIpNum = this.dot2num(searchDto.sourceIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.sourceInRange = true;
            }
          }
        });
      }

      // TODO : Source Network Object Group evaluation
      else if (rule.sourceAddressType === 'NetworkObjectGroup') {
        // do stuff with netobjgroup
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
      else if (rule.destinationAddressType === 'NetworkObject') {
        this.networkObjectService.getOneNetworkObject({ id: rule.sourceNetworkObjectId }).subscribe(networkObject => {
          // if destNetworkObject is an IP/subnet
          if (networkObject.type === 'IpAddress') {
            const ruleDestIp = networkObject.ipAddress;
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
                checkList.sourceInRange = true;
              }
            }
          }

          // if networkObject is a range of IPs
          else if (networkObject.type === 'Range') {
            // convert the start and end IPs to numbers
            const startIpNum = this.dot2num(networkObject.startIpAddress);
            const endIpNum = this.dot2num(networkObject.endIpAddress);

            // convert the searchIpNum to a number
            const searchIpNum = this.dot2num(searchDto.sourceIpLookup);

            // if the searchIpNum falls in between the startIpNum and endIpNum
            // we know it is within the range provided
            if (startIpNum <= searchIpNum && endIpNum >= searchIpNum) {
              checkList.sourceInRange = true;
            }
          }
        });
      }

      // TO DO : Destination Network Object Group
      else if (rule.destinationAddressType === 'NetworkObjectGroup') {
        //
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

      console.log('searchDto', searchDto);
      console.log('checkList', checkList);
      console.log('rule', rule);
    });
  }

  get f() {
    return this.form.controls;
  }

  // getNetworkObjectInfo(networkObjectId) {
  //   this.networkObjectService.getOneNetworkObject({ id: networkObjectId }).subscribe(data => {
  //     console.log('data', data);
  //     return data;
  //   })
  // }

  // getNetworkObjectGroupInfo(networkObjectGroupId) {
  //   this.networkObjectGroupService.getOneNetworkObjectGroup({ id: networkObjectGroupId, join: ['networkObjects'] }).subscribe(data => {
  //     return data;
  //   })
  // }

  private buildForm() {
    this.form = this.formBuilder.group({
      direction: ['', Validators.required],
      protocol: ['', Validators.required],
      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],

      sourcePorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
      destinationPorts: ['', Validators.compose([Validators.required, ValidatePortRange])],
    });
  }

  reset() {
    this.submitted = false;
    this.form.reset();
    this.ngx.resetModalData('firewallRulePacketTracer');
    this.buildForm();
  }
}
