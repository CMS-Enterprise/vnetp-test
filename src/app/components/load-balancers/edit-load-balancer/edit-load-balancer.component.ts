import { Component, OnInit } from '@angular/core';
import { Frontend } from 'src/app/models/frontend';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Network } from 'src/app/models/network';
import { Rule } from 'src/app/models/rule';
import { Backend } from 'src/app/models/backend';
import { ActivatedRoute } from '@angular/router';
import { LoadBalancer } from 'src/app/models/load-balancer';

@Component({
  selector: 'app-edit-load-balancer',
  templateUrl: './edit-load-balancer.component.html',
  styleUrls: ['./edit-load-balancer.component.css']
})
export class EditLoadBalancerComponent implements OnInit {
  selectionIndex: number;
  networks: Array<Network>;

  loadbalancer = new LoadBalancer();

  newFrontend = new Frontend();
  newRule = new Rule();
  newBackend = new Backend();
  Id = '';

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService) { }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');

    console.log(this.Id);

    this.getLoadbalancer();
    this.getNetworks();
  }

  updateSelectionIndex(index: number) {
    this.selectionIndex = index;
  }

  getNetworks() {
   this.automationApiService.getNetworks().subscribe(
     (data: Array<Network>) => this.networks = data,
     error => console.log(error)
   );
  }

  getLoadbalancer() {
    this.automationApiService.getLoadBalancer(this.Id).subscribe(
      (data: LoadBalancer) => this.loadbalancer = data,
      error => console.log(error)
    );
  }

  saveFrontend() {
    this.loadbalancer.Frontends.push(this.newFrontend);

    this.newFrontend = new Frontend();
  }

  saveRule() {
    this.loadbalancer.Rules.push(this.newRule);

    this.newRule = new Rule();
  }

  saveBackend() {
    this.loadbalancer.Backends.push(this.newBackend);

    this.newBackend = new Backend();
  }
}
