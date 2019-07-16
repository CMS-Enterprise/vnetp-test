// FIXME
import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Vrf } from 'src/app/models/d42/vrf';

@Component({
  selector: 'app-static-routes',
  templateUrl: './static-routes.component.html',
  styleUrls: ['./static-routes.component.scss']
})
export class StaticRoutesComponent implements OnInit {

  vrfs: Array<Vrf>;
  routingTable: any;
  navIndex = 0;

  constructor(private automationApiService: AutomationApiService) {
    this.vrfs = [];
    this.routingTable = [];
   }

  ngOnInit() {
    this.getVrfs();
  }

  getVrfs() {
    this.automationApiService.getVrfs().subscribe(
      data => this.vrfs = data
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
}
