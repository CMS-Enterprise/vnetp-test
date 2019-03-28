import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

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
   }

  subnets: any;
  sourceSubnetIps: any;
  destinationSubnetIps: any;
  sourceIpId: number;
  destinationIpId: number;
  sourceSubnetId: number;
  destinationSubnetId: number;

  ngOnInit() {
    this.getNetworks();
  }

  getNetworks() {
    this.automationApiService.getSubnets().subscribe(
      data => this.subnets = data,
      error => console.error(error)
      );
  }

  getSubnetIps( subnetId: number, subnetType) {
    const query = 'SELECT ipaddress_pk AS id, ip_address FROM view_ipaddress_v1 WHERE subnet_fk = ' + subnetId;

    if (subnetType === 'source'){
      this.sourceIpId = 0;
    }

    this.automationApiService.doqlQuery(query).subscribe(
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
}
