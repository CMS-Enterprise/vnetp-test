import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';


@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.css']
})
export class NetworksComponent implements OnInit {

  constructor(private automationApiService : AutomationApiService) { }

  ngOnInit() {
    this.getNetworks();
  }

  networks;

  getNetworks() {
    this.automationApiService.getNetworks().subscribe(
      data => {this.networks = data},
      err => console.error(err)    
      );
  };
}
