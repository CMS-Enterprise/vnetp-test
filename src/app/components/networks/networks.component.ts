import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Network } from 'src/app/models/network';


@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.css']
})
export class NetworksComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService) { }

  networks = new Array<Network>();

  ngOnInit() {
    this.getNetworks();
  }

  getNetworks() {
    this.automationApiService.getNetworks().subscribe(
      (data: Array<Network>) => this.networks = data,
      error => console.error(error)
      );
  }
}
