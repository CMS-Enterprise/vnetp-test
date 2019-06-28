import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/d42/customer';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SubnetResponse, Subnet } from 'src/app/models/d42/subnet';
import { GraphContextMenu } from 'src/app/models/other/graph-context-menu';
import { GraphContextMenuItem } from 'src/app/models/other/graph-context-menu-item';
import { Router } from '@angular/router';
import { ActionData } from 'src/app/models/other/action-data';
import { GraphContextMenuResult } from 'src/app/models/other/graph-context-menu-result';

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

  constructor(
    private apiService: AutomationApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildContextMenu();
    this.getCustomer();
  }

  buildContextMenu() {
    this.contextMenuArray = new Array<GraphContextMenu>();

    // Customer Level Menu
    const customerMenu = new GraphContextMenu();
    customerMenu.menuItems.push(
      new GraphContextMenuItem(
        'View Networks',
        true,
        new ActionData('Customer', 'View Networks')
      )
    );
    customerMenu.menuItems.push(
      new GraphContextMenuItem(
        'View Static Routes',
        true,
        new ActionData('Customer', 'View Static Routes')
      )
    );
    customerMenu.menuItems.push(
      new GraphContextMenuItem(
        'View Firewall Rules',
        true,
        new ActionData('Customer', 'View Firewall Rules')
      )
    );

    // VRF Level Menu
    const vrfMenu = new GraphContextMenu();
    vrfMenu.menuItems.push(
      new GraphContextMenuItem(
        'Add Subnet',
        true,
        new ActionData('VRF', 'Add Subnet')
      )
    );

    // Network Level Menu
    const networkMenu = new GraphContextMenu();
    networkMenu.menuItems.push(
      new GraphContextMenuItem(
        'Edit Static Routes',
        true,
        new ActionData('Subnet', 'Edit Static Routes')
      )
    );

    this.contextMenuArray.push(customerMenu);
    this.contextMenuArray.push(vrfMenu);
    this.contextMenuArray.push(networkMenu);
  }

  nodeClickHandler(node: any) {
    console.log(node);
  }

  nodeContextMenuActionHandler(event) {
    if (!event) {
      return;
    }

    const ctxMenuResult = event as GraphContextMenuResult;

    if (ctxMenuResult) {
      const actionData = ctxMenuResult.actionData;
      switch (actionData.ActionParentType) {
        case 'Customer':
          switch (actionData.ActionType) {
            case 'View Networks':
              this.router.navigate(['/networks']);
              break;
            case 'View Static Routes':
              break;
            case 'View Firewall Rules':
              break;

            default:
              break;
          }
          break;
        case 'VRF':
          switch (actionData.ActionType) {
            case 'Add Subnet':
              break;

            default:
              break;
          }
          break;
        case 'Subnet':
          switch (actionData.ActionType) {
            case 'Edit Static Routes':
              break;

            default:
              break;
          }
          break;
        default:
          break;
      }
    }
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
