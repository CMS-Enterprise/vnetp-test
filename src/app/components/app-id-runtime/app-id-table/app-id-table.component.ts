import { Component, Input } from '@angular/core';
import { FirewallRule, PanosApplication } from '../../../../../client';
import { AppIdRuntimeService } from '../app-id-runtime.service';
import { MatDialog } from '@angular/material/dialog';
import { PanosApplicationDetailsDialogComponent } from '../panos-application-details-dialog/panos-application-details-dialog.component';

@Component({
  selector: 'app-app-id-table',
  templateUrl: './app-id-table.component.html',
  styleUrls: ['./app-id-table.component.css'],
})
export class AppIdTableComponent {
  @Input() type = '';
  @Input() applications: PanosApplication[] = [];
  @Input() firewallRule: FirewallRule;

  displayedColumns: string[] = ['name', 'category', 'subCategory', 'risk', 'actions'];
  filteredApplications: PanosApplication[];
  searchQuery = '';

  constructor(private appIdService: AppIdRuntimeService, public dialog: MatDialog) {}

  public addPanosAppToFirewallRule(panosApplication: PanosApplication): void {
    this.appIdService.addPanosAppToFirewallRule(panosApplication, this.firewallRule, panosApplication.appVersion);
    this.refreshData();
  }

  public removePanosAppFromFirewallRule(panosApplication: PanosApplication): void {
    this.appIdService.removePanosAppFromFirewallRule(panosApplication, this.firewallRule, panosApplication.appVersion);
    this.refreshData();
  }

  // Re-filter applications after adding or removing an application
  private refreshData(): void {
    this.onSearch(); // Reapply search filter
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredApplications = this.applications.filter(
      app =>
        this.includesQuery(app.panosId, query) ||
        this.includesQuery(app.minver, query) ||
        this.includesQuery(app.name, query) ||
        this.includesQuery(app.oriCountry, query) ||
        this.includesQuery(app.oriLanguage, query) ||
        this.includesQuery(app.category, query) ||
        this.includesQuery(app.subCategory, query) ||
        this.includesQuery(app.technology, query) ||
        this.includesQuery(app.risk?.toString(), query),
    );

    // Ensure the application reflects its updated firewall rule status
    if (this.type === 'available') {
      this.filteredApplications = this.filteredApplications.filter(
        app => !app.firewallRules.some(rule => rule.id === this.firewallRule.id),
      );
    } else if (this.type === 'assocaited') {
      this.filteredApplications = this.filteredApplications.filter(app => app.firewallRules.some(rule => rule.id === this.firewallRule.id));
    }
  }

  private includesQuery(field: string | undefined, query: string): boolean {
    return field ? field.toLowerCase().includes(query) : false;
  }

  openDetailsDialog(app: PanosApplication): void {
    this.dialog.open(PanosApplicationDetailsDialogComponent, {
      data: app,
    });
  }
}
