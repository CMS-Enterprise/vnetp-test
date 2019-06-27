import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/d42/customer';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { GraphContextMenu } from 'src/app/models/other/graph-context-menu';
import { GraphContextMenuItem } from 'src/app/models/other/graph-context-menu-item';
import { Router } from '@angular/router';

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

  constructor(private apiService: AutomationApiService, private router: Router) {}

  ngOnInit() {
    this.buildContextMenu();
    this.getCustomer();
  }

  buildContextMenu() {
    this.contextMenuArray = new Array<GraphContextMenu>();

    // Customer Level Menu
    const customerMenu = new GraphContextMenu();
    customerMenu.menuItems.push(new GraphContextMenuItem('View Networks',  () => {this.router.navigate(['/networks']); }));
    customerMenu.menuItems.push(new GraphContextMenuItem('View Static Routes',  () => {this.router.navigate(['/static-routes']); }));
    customerMenu.menuItems.push(new GraphContextMenuItem('View Firewall Rules',  () => {this.router.navigate(['/firewall-rules']); }));


    // VRF Level Menu
    const vrfMenu = new GraphContextMenu();
    vrfMenu.menuItems.push(new GraphContextMenuItem('Add Subnet', () => {this.router.navigate(['/networks/create']); }));


    // Network Level Menu

    //TODO: Need to resolve ID.
    const networkMenu = new GraphContextMenu();

    let networkStaticRoutes = new GraphContextMenuItem('Edit Static Routes');


    networkMenu.menuItems.push();


    this.contextMenuArray.push(customerMenu);
    this.contextMenuArray.push(vrfMenu);
    this.contextMenuArray.push(networkMenu);
  }

  nodeClickHandler(node: any) {
    console.log(node);
  }

  nodeContextMenuActionHandler(value: string) {
    console.log(value);
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
