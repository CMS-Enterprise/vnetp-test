import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/d42/customer';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { GraphContextMenu } from 'src/app/models/other/graph-context-menu';
import { GraphContextMenuItem } from 'src/app/models/other/graph-context-menu-item';

@Component({
  selector: 'app-network-topology',
  templateUrl: './network-topology.component.html',
  styleUrls: ['./network-topology.component.css']
})
export class NetworkTopologyComponent implements OnInit {
  customers: Array<Customer>;
  selectedCustomer: Customer;
  subnets: Array<Subnet>;
  showGraph: boolean;
  contextMenuArray: Array<GraphContextMenu>;

  constructor(private apiService: AutomationApiService) {}

  ngOnInit() {
    this.buildContextMenu();
    this.getCustomer();
  }

  buildContextMenu() {
    this.contextMenuArray = new Array<GraphContextMenu>();

    const graphContextMenu = new GraphContextMenu();

    graphContextMenu.menuItems.push(new GraphContextMenuItem('1'));
    graphContextMenu.menuItems.push(new GraphContextMenuItem('2'));
    graphContextMenu.menuItems.push(new GraphContextMenuItem('3'));

    this.contextMenuArray.push(graphContextMenu);
  }

  nodeClickHandler(node: any) {
    console.log(node);
  }

  getCustomer() {
    this.apiService.getCustomers().subscribe(data => {
      this.customers = data.Customers;
      this.selectedCustomer = this.customers[0];
      this.getVrfs();
    });
  }

  getVrfs() {
    this.apiService.getVrfs().subscribe(data => {
      this.selectedCustomer.vrfs = data;
      this.getSubnets();
    });
  }

  getSubnets() {
    this.apiService.getSubnets().subscribe(data => {
      const result = data as SubnetResponse;
      this.subnets = result.subnets;
      this.mapSubnets();
    });
  }

  mapSubnets() {
    this.selectedCustomer.vrfs.forEach(v => {
      this.subnets.forEach(s => {
        if (v.id === s.vrf_group_id) {
          if (!v.subnets) {
            v.subnets = new Array<Subnet>();
          }
          v.subnets.push(s);
        }
      });
    });
    this.showGraph = true;
  }
}
