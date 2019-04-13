import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { StaticRoute } from 'src/app/models/static-route';

@Component({
  selector: 'app-static-routes',
  templateUrl: './static-routes.component.html',
  styleUrls: ['./static-routes.component.css']
})
export class StaticRoutesComponent implements OnInit {

  subnets: any;
  routingTable: any;
  navIndex = 0;

  constructor(private automationApiService: AutomationApiService) {
    this.subnets = [];
    this.routingTable = [];
   }

  ngOnInit() {
    this.getNetworks();
  }


  getNetworks() {
    this.automationApiService.getSubnets().subscribe(
      data => this.subnets = data,
      () => this.getRoutingTable()
      );
  }

  getStaticRoutesCount(subnet: any) {
    const jsonStaticRoutes = subnet.custom_fields.find(c => c.key === 'static_routes');

    const staticRoutes = JSON.parse(jsonStaticRoutes.value);

    return staticRoutes ? staticRoutes.length : 0;
  }

  getStaticRoutes(subnet: any) {
    const jsonStaticRoutes = subnet.custom_fields.find(c => c.key === 'static_routes');

    const staticRoutes = JSON.parse(jsonStaticRoutes.value);

    return staticRoutes;
  }

  getRoutingTable() {

    this.routingTable = [];

    this.subnets.subnets.forEach((subnet: any) => {
      const subnetRoutes = this.getStaticRoutes(subnet);

      if (subnetRoutes && subnetRoutes.length) {
        subnetRoutes.forEach((subnetRoute: any) => {
          this.routingTable.push(subnetRoute);
        });
      }
    });
  }
}
