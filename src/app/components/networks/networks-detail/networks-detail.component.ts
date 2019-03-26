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
    this.staticRoutes = [];
   }

  Id = '';
  subnet: any;
  subnetIps: any;
  staticRoutes: any;

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');

    this.getNetwork();
    this.getIps();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => this.subnet = data,
      error => console.error(error),
      () => this.getStaticRoutes()
    );
  }

  getIps() {
    this.automationApiService.getSubnetIps(this.Id).subscribe(
      data => this.subnetIps = data,
      error => console.error(error)
    );
  }

  getStaticRoutes() {
    const staticRoutes = this.subnet.custom_fields.find(c => c.key === 'static_routes');

    if (staticRoutes) {
      this.staticRoutes = JSON.parse(staticRoutes.value);
    }
  }

  addStaticRoute() {
    if (this.staticRoutes == null) { this.staticRoutes = []; }

    const staticRoute = new StaticRoute();
    staticRoute.Edit = true;
    staticRoute.Deleted = false;

    this.staticRoutes.push(staticRoute);
  }

  updateStaticRoutes() {

    let deleted_static_routes = this.staticRoutes.filter(r => r.Deleted);
    let updated_static_routes = this.staticRoutes.filter(r => !r.Deleted);

    const body = {
      extra_vars: `{\"customer_id\": ${this.subnet.name},
      \"subnet_id\": ${this.subnet.subnet_id},
      \"updated_static_routes\": ${JSON.stringify(updated_static_routes)},
      \"deleted_static_routes\":${JSON.stringify(deleted_static_routes)}}`
    };

    this.automationApiService.launchTemplate('update_asa_static_routes', body).subscribe(
      data => {},
      error => console.log(error)
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
