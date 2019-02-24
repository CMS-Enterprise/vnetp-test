import { Component, OnInit } from '@angular/core';
import { NetworkSecurityProfile } from 'src/app/models/network-security-profile';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-network-security-profile-detail',
  templateUrl: './network-security-profile-detail.component.html',
  styleUrls: ['./network-security-profile-detail.component.css']
})
export class NetworkSecurityProfileDetailComponent implements OnInit {


  networkSecurityProfile: NetworkSecurityProfile;

  Id = '';

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService) { }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');

    this.getNetworkSecurityProfile();
  }

  getNetworkSecurityProfile() {
    this.automationApiService.getNetworkSecurityProfile(this.Id).subscribe(
      (data: NetworkSecurityProfile) => this.networkSecurityProfile = data,
      error => console.error(error)
    );
  }
}