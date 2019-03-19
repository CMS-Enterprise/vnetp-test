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

  subnets: any;

  constructor(private automationApiService: AutomationApiService) { 
    this.subnets = [];
  }

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
