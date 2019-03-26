import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-static-routes',
  templateUrl: './static-routes.component.html',
  styleUrls: ['./static-routes.component.css']
})
export class StaticRoutesComponent implements OnInit {

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
      error => {}
      );
  }

  getStaticRoutesCount(subnet: any) {
    const jsonStaticRoutes = subnet.custom_fields.find(c => c.key === 'static_routes');

    const staticRoutes = JSON.parse(jsonStaticRoutes.value);

    if (staticRoutes) { return staticRoutes.length; } else { return 0; }
  }
}
