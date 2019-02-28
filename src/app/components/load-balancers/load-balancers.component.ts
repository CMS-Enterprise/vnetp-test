import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { LoadBalancer } from 'src/app/models/load-balancer';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
  styleUrls: ['./load-balancers.component.css']
})
export class LoadBalancersComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService) { }

  loadBalancers: Array<LoadBalancer>;

  ngOnInit() {
    this.getLoadBalancers();
  }

  getLoadBalancers() {
    this.automationApiService.getLoadBalancers().subscribe(
      (data: Array<LoadBalancer>) => this.loadBalancers = data,
      error => console.error(error)
    );
  }
}
