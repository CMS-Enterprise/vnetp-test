import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { IpNat } from 'src/app/models/ip-nat';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-create-ip-nat',
  templateUrl: './create-ip-nat.component.html',
  styleUrls: ['./create-ip-nat.component.css']
})
export class CreateIpNatComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private messageService: MessageService,
              private router: Router, private toastr: ToastrService, private hs: HelpersService) {
    this.subnets = [];
    this.sourceSubnetIps = [];
    this.destinationSubnetIps = [];
    this.ipNat = new IpNat();
    this.ipNat.two_way_relation = true;
  }

  subnets: Array<Subnet>;
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
      data => {
        const subnetResponse = data as SubnetResponse;
        this.getDeployedSubnets(subnetResponse.subnets);
      });
  }

  getSubnetIps( subnet: any, subnetType) {
    this.automationApiService.getSubnetIps(subnet.subnet_id).subscribe(
      data => {
        if (subnetType === 'source') {
          this.sourceSubnetIps = data;
        } else if (subnetType === 'destination') {
          this.destinationSubnetIps = data;
        }
      }
    );
  }

  getDeployedSubnets(subnets: Array<Subnet>) {
    const deployedSubnets = [];

    subnets.forEach(subnet => {
      const deployedState = this.hs.getBooleanCustomField(subnet, 'deployed');
      if (deployedState) {
        deployedSubnets.push(subnet);
      }
    });

    this.subnets = deployedSubnets;
  }

  createIpNat() {
    if (
      !this.ipNat.ip_address_from ||
      !this.ipNat.ip_address_to ||
      !this.sourceSubnet ||
      !this.destinationSubnet
    ) {
      this.toastr.error('Invalid Data');
      return;
    }

    const body = {
      extra_vars: `{\"source_subnet\": \"${this.sourceSubnet.name}\",
      \"destination_subnet\": \"${this.destinationSubnet.name}\",
      \"ipnat\": ${JSON.stringify(this.ipNat)}}`
    };

    this.automationApiService.launchTemplate('deploy-ipnat', body).subscribe(
      () => this.toastr.success('Creating Network Address Translation')
    );

    this.messageService.filter('Job Launched');

    this.router.navigate(['/ip-nats']);
  }
}