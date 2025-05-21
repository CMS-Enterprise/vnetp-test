import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface AppIdTier {
  tierName: string;
  currentVersion: string;
  lastUpdated: string;
}

interface TenantAppId {
  tenantName: string;
  tiers: AppIdTier[];
  expanded: boolean;
}

@Component({
  selector: 'app-app-id-maintenance',
  templateUrl: './app-id-maintenance.component.html',
  styleUrl: './app-id-maintenance.component.css',
})
export class AppIdMaintenanceComponent implements OnInit {
  displayedColumns: string[] = ['select', 'tenantName', 'expand'];
  tierColumns: string[] = ['select', 'tierName', 'currentVersion', 'lastUpdated'];
  dataSource = new MatTableDataSource<TenantAppId>();
  tenantSelection = new SelectionModel<TenantAppId>(true, []);
  tierSelection = new SelectionModel<AppIdTier>(true, []);
  updateCode = '';
  externalSiteUrl = 'https://example.com/app-id-update';
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Initialize with mock data
    this.dataSource.data = [
      {
        tenantName: 'Tenant 1',
        expanded: false,
        tiers: [
          { tierName: 'Tier 1', currentVersion: '1.2.3', lastUpdated: '2024-03-15' },
          { tierName: 'Tier 2', currentVersion: '1.2.2', lastUpdated: '2024-03-10' },
        ],
      },
      {
        tenantName: 'Tenant 2',
        expanded: false,
        tiers: [
          { tierName: 'Tier 1', currentVersion: '1.2.1', lastUpdated: '2024-03-12' },
          { tierName: 'Tier 2', currentVersion: '1.2.3', lastUpdated: '2024-03-14' },
          { tierName: 'Tier 3', currentVersion: '1.2.2', lastUpdated: '2024-03-11' },
        ],
      },
    ];
    console.log('Initialized data:', this.dataSource.data);
  }

  /** Whether the number of selected tenants matches the total number of tenants. */
  isAllTenantsSelected() {
    const numSelected = this.tenantSelection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all tenants if they are not all selected; otherwise clear selection. */
  toggleAllTenants() {
    if (this.isAllTenantsSelected()) {
      this.tenantSelection.clear();
      this.tierSelection.clear();
      return;
    }
    this.tenantSelection.select(...this.dataSource.data);
  }

  /** Whether the number of selected tiers matches the total number of tiers in the tenant. */
  isAllTiersSelected(tenant: TenantAppId) {
    const numSelected = this.tierSelection.selected.filter(tier => tenant.tiers.includes(tier)).length;
    return numSelected === tenant.tiers.length;
  }

  /** Selects all tiers in a tenant if they are not all selected; otherwise clear selection. */
  toggleAllTiers(tenant: TenantAppId) {
    if (this.isAllTiersSelected(tenant)) {
      tenant.tiers.forEach(tier => this.tierSelection.deselect(tier));
      return;
    }
    tenant.tiers.forEach(tier => this.tierSelection.select(tier));
  }

  /** Toggle tenant expansion */
  toggleTenant(tenant: TenantAppId) {
    console.log('Toggling tenant:', tenant.tenantName);
    tenant.expanded = !tenant.expanded;
    this.dataSource.data = [...this.dataSource.data];
    this.cdr.detectChanges();
    console.log('New expanded state:', tenant.expanded);
  }

  /** Get all selected tiers across all tenants */
  getSelectedTiers(): AppIdTier[] {
    return this.tierSelection.selected;
  }

  /** Get all tiers from selected tenants */
  getAllTiersFromSelectedTenants(): AppIdTier[] {
    return this.tenantSelection.selected.flatMap(tenant => tenant.tiers);
  }

  /** Predicate function for expansion detail row */
  isExpansionDetailRow = (index: number, row: TenantAppId) => row.expanded;
}
