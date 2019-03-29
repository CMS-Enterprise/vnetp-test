import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { IpNat } from 'src/app/models/ip-nat';

@Component({
  selector: 'app-create-ip-nat',
  templateUrl: './create-ip-nat.component.html',
  styleUrls: ['./create-ip-nat.component.css']
})
export class CreateIpNatComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService) {
    this.subnets = [];
    this.sourceSubnetIps = [];
    this.destinationSubnetIps = [];
    this.ipNat = new IpNat();
    this.ipNat.two_way_relation = true;
   }

  subnets: any;
  sourceSubnetIps: any;
  destinationSubnetIps: any;
  sourceSubnet: any;
  destinationSubnet: any;
  ipNat: IpNat;

  ngOnInit() {
    this.getSubnets();
  }

  getSubnets() {
    this.automationApiService.getSubnets().subscribe(
      data => this.subnets = data,
      error => console.error(error)
      );
  }

  getSubnetIps( subnet: any, subnetType) {

    this.automationApiService.getSubnetIps(subnet.subnet_id).subscribe(
      data => {
        if (subnetType === 'source') {
          this.sourceSubnetIps = data;
        } else
        if (subnetType === 'destination') {
          this.destinationSubnetIps = data;
        }
      },
      error => {}
    );
  }

  createIpNat() {
    const body = {
      extra_vars: `{\"source_subnet\": \"${this.sourceSubnet.name}\",
      \"destination_subnet\": \"${this.destinationSubnet.name}\",
      \"ipnat\": ${JSON.stringify(this.ipNat)}}`
    };

    this.automationApiService.launchTemplate('create_asa_ipnat', body).subscribe(
      data => {},
      error => {}
    );
  }
}
