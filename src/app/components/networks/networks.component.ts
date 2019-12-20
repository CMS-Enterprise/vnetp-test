import { Component, OnInit } from '@angular/core';
import { Subnet, V1TiersService, Tier, Vlan } from 'api_client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
})
export class NetworksComponent implements OnInit {
  tiers: Array<Tier>;
  vlans: Array<Vlan>;
  DatacenterId: string;
  currentDatacenterSubscription: Subscription;

  constructor(
    private tierService: V1TiersService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  subnets: Array<Subnet>;

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.DatacenterId = cd.id;
          this.getTiers();
        }
      },
    );
  }

  getTiers() {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.DatacenterId,
        join: 'subnets,vlans',
      })
      .subscribe(data => {
        this.tiers = data;

        let subnets = new Array<Subnet>();
        let vlans = new Array<Vlan>();

        this.tiers.forEach(tier => {
          subnets = subnets.concat(tier.subnets);

          vlans = vlans.concat(tier.vlans);
        });

        this.vlans = vlans;
        this.subnets = subnets;
      });
  }

  getVlanName = (id: string) => {
    return this.getObjectName(id, this.vlans);
    // tslint:disable-next-line: semicolon
  };

  getTierName = (id: string) => {
    return this.getObjectName(id, this.tiers);
    // tslint:disable-next-line: semicolon
  };

  private getObjectName(id: string, objects: { name: string; id?: string }[]) {
    if (objects && objects.length) {
      return objects.find(o => o.id === id).name || 'N/A';
    }
  }

  exportNetworkConfig() {}

  importNetworkConfig() {}
}
