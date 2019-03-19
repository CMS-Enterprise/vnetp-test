import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Network } from 'src/app/models/network';


@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.css']
})
export class NetworksComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService) { }

  subnets: any;

  ngOnInit() {
    this.getNetworks();
  }

  getNetworks() {
    this.automationApiService.getSubnets().subscribe(
      data => this.subnets = data,
      error => console.error(error)
      );
  }
}
