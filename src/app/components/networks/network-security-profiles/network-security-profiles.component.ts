import { Component, OnInit } from '@angular/core';
import { NetworkSecurityProfile } from 'src/app/models/network-security-profile';
import { ThrowStmt } from '@angular/compiler';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-network-security-profiles',
  templateUrl: './network-security-profiles.component.html',
  styleUrls: ['./network-security-profiles.component.css']
})
export class NetworkSecurityProfilesComponent implements OnInit {


  networkSecurityProfiles: Array<NetworkSecurityProfile>;

  constructor(private automationApiService: AutomationApiService) { }

  ngOnInit() {
    this.getNetworkSecurityProfiles();
  }

  getNetworkSecurityProfiles(){
    this.automationApiService.getNetworkSecurityProfiles().subscribe(
      (data: Array<NetworkSecurityProfile>) => this.networkSecurityProfiles = data,
      error => console.error(error)
    );
  }

}
