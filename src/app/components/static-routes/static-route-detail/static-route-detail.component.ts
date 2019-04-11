import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { StaticRoute } from 'src/app/models/static-route';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-static-route-detail',
  templateUrl: './static-route-detail.component.html',
  styleUrls: ['./static-route-detail.component.css']
})
export class StaticRouteDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private automationApiService: AutomationApiService,
              private messageService: MessageService) {
    this.subnet = {};
   }

  Id = '';
  subnet: any;
  staticRoutes: any;

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');
    this.getNetwork();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => this.subnet = data,
      error => console.error(error),
      () => this.getStaticRoutes()
    );
  }

  addStaticRoute() {
    if (this.staticRoutes == null) { this.staticRoutes = []; }

    const staticRoute = new StaticRoute();
    staticRoute.Edit = true;
    staticRoute.Deleted = false;
    staticRoute.Updated = false;
    staticRoute.InterfaceName = this.subnet.name;

    this.staticRoutes.push(staticRoute);
  }

  updateStaticRoutes() {

    // TODO: Handle updates to existing static routes

    // Deleted Static Routes are added to the deleted static routes array.
    const deletedStaticRoutes = this.staticRoutes.filter(r => r.Deleted);

    // All not deleted or not deleted and updated routes are added to the local static routes
    // array. This is the array that will be persisted into the device 42 static_routes custom
    // property.
    const staticRoutes = this.staticRoutes.filter(r => !r.Deleted || !r.Deleted && r.Updated);

    const body = {
      extra_vars: `{\"customer_id\": ${this.subnet.name},
      \"subnet_id\": ${this.subnet.subnet_id},
      \"updated_static_routes\": ${JSON.stringify(staticRoutes)},
      \"deleted_static_routes\":${JSON.stringify(deletedStaticRoutes)}}`
    };

    this.automationApiService.launchTemplate('update_asa_static_routes', body).subscribe(
      data => {},
      error => console.log(error)
    );

    this.messageService.filter('Job Launched');
  }

  getStaticRoutes() {
    const staticRoutes = this.subnet.custom_fields.find(c => c.key === 'static_routes');

    if (staticRoutes) {
      this.staticRoutes = JSON.parse(staticRoutes.value);

      this.staticRoutes.forEach((route) => {
        route.Updated = false;
        route.Edit = false;
      });
    }
  }
}
