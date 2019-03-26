import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { StaticRoute } from 'src/app/models/static-route';

@Component({
  selector: 'app-networks-detail',
  templateUrl: './networks-detail.component.html',
  styleUrls: ['./networks-detail.component.css']
})
export class NetworksDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private automationApiService: AutomationApiService) {
    this.subnet = {};
    this.subnetIps = {};
   }

  Id = '';
  subnet: any;
  subnetIps: any;

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');

    this.getNetwork();
    this.getIps();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => this.subnet = data,
      error => console.error(error)
    );
  }

  getIps() {
    this.automationApiService.getSubnetIps(this.Id).subscribe(
      data => this.subnetIps = data,
      error => console.error(error)
    );
  }

  deleteSubnet() {
    const body = {
      extra_vars: `{\"customer_id\": ${this.subnet.name}, \"vlan_id\": ${this.subnet.description}, \"subnet_id\": ${this.subnet.subnet_id}}`
    };

    this.automationApiService.launchTemplate('delete_asa_subinterface', body).subscribe();
    this.automationApiService.launchTemplate('delete_vlan', body).subscribe();
    this.automationApiService.launchTemplate('delete_device42_subnet', body).subscribe();
    this.router.navigate(['/networks']);
  }
}
