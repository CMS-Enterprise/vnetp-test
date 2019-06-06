import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { IpAddressService } from 'src/app/services/ip-address.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subnet } from 'src/app/models/d42/subnet';
import { AppMessageType } from 'src/app/models/app-message-type';
import { AppMessage } from 'src/app/models/app-message';

@Component({
  selector: 'app-networks-detail',
  templateUrl: './networks-detail.component.html',
  styleUrls: ['./networks-detail.component.css']
})
export class NetworksDetailComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private route: ActivatedRoute, 
              private router: Router, private hs: HelpersService,
              private ips: IpAddressService, public ngx: NgxSmartModalService ) {
    this.subnetIps = {};
   }

  Id = '';
  subnet: Subnet;
  subnetIps: any;
  deployedState = false;
  deleteSubnetConfirm = '';

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');

    this.getNetwork();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => {
        this.subnet = data as Subnet;
        this.deployedState = this.hs.getBooleanCustomField(this.subnet, 'deployed');
      });
  }

  getDeployedState(subnet: Subnet) {
    return this.hs.getBooleanCustomField(subnet, 'deployed');
  }

  getVlan(subnet: Subnet) {
    return this.hs.getNumberCustomField(subnet, 'vlan_number');
  }


  deleteSubnet() {
    if (this.deleteSubnetConfirm !== 'DELETE') { return; }

    var extra_vars: {[k: string]: any} = {};
    extra_vars.subnet_id = this.subnet.subnet_id;
    const body = { extra_vars };

    this.automationApiService.launchTemplate('delete-network', body, true).subscribe();

    this.router.navigate(['/networks']);
  }
}
