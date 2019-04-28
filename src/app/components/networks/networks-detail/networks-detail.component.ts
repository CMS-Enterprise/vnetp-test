import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { MessageService } from 'src/app/services/message.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';
import { IpAddressService } from 'src/app/services/ip-address.service';

@Component({
  selector: 'app-networks-detail',
  templateUrl: './networks-detail.component.html',
  styleUrls: ['./networks-detail.component.css']
})
export class NetworksDetailComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private messageService: MessageService,
              private route: ActivatedRoute, private router: Router, private hs: HelpersService, private ips: IpAddressService ) {
    this.subnetIps = {};
    this.subnet = new Subnet();
   }

  Id = '';
  subnet: Subnet;
  subnetIps: any;
  deployedState = false;

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');

    this.getNetwork();
    this.getIps();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => {
        this.subnet = data as Subnet;
        this.deployedState = this.hs.getBooleanCustomField(this.subnet, 'deployed');
      });
  }

  getIps() {
    this.automationApiService.getSubnetIps(this.Id).subscribe(
      data => this.subnetIps = data,
      error => console.error(error)
    );
  }

  deleteSubnet() {
    var extra_vars: {[k: string]: any} = {};

    extra_vars.customer = 'acme';
    extra_vars.subnet = this.subnet;
    const body = { extra_vars };

    this.automationApiService.launchTemplate('delete-network', body).subscribe();

    this.messageService.filter('Job Launched');

    this.router.navigate(['/networks']);
  }
}
