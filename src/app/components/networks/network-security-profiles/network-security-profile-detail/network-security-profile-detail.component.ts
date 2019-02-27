import { Component, OnInit } from '@angular/core';
import { NetworkSecurityProfile } from 'src/app/models/network-security-profile';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import { NetworkSecurityProfileRule } from 'src/app/models/network-security-profile-rule';

@Component({
  selector: 'app-network-security-profile-detail',
  templateUrl: './network-security-profile-detail.component.html',
  styleUrls: ['./network-security-profile-detail.component.css']
})
export class NetworkSecurityProfileDetailComponent implements OnInit {

  networkSecurityProfile = new NetworkSecurityProfile();

  Id = '';

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService) { }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');

    this.getNetworkSecurityProfile();
  }

  sortRules() {
    this.networkSecurityProfile.NetworkSecurityProfileRules.sort((a, b): number => {
      if (a.Index < b.Index) { return -1; }
      if (a.Index > b.Index) { return 1; }
      return 0;
    });
  }

  moveRule(value: number, rule: NetworkSecurityProfileRule) {
    if (rule.Index + value < 0) { return; }

    const relatedRule = this.networkSecurityProfile.NetworkSecurityProfileRules.filter(x => x.Index === rule.Index + value)[0];

    if (relatedRule == null) {return; }

    const temp = relatedRule.Index;
    relatedRule.Index = rule.Index;
    rule.Index = temp;

    this.sortRules();
  }

  getNetworkSecurityProfile() {
    this.automationApiService.getNetworkSecurityProfile(this.Id).subscribe(
      (data: NetworkSecurityProfile) => this.networkSecurityProfile = data,
      error => console.error(error),
      () => this.sortRules()
    );
  }

  addNetworkSecurityProfileRule() {
    const nspr = new NetworkSecurityProfileRule();
    nspr.Edit = true;
    nspr.Action =  0;
    this.networkSecurityProfile.NetworkSecurityProfileRules.push(nspr);
  }

  updateNetworkSecurityProfile() {
    this.automationApiService.updateNetworkSecurityProfile(this.Id, this.networkSecurityProfile).subscribe(
      data => {},
      error => console.log(error),
      () => this.getNetworkSecurityProfile()
    );
  }
}
