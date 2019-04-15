import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.css']
})
export class NetworksComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private helpersService: HelpersService) {
    this.subnets = [];
  }

  subnets: any;

  ngOnInit() {
    this.getNetworks();
  }

  getNetworks() {
    this.automationApiService.getSubnets()
    .subscribe(data => {
        const result = data as SubnetResponse;
        this.subnets = result.subnets;
      });
    }

    getDeployedState(subnet: Subnet) {
      return this.helpersService.getDeployedState(subnet);
    }
}
