import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FirewallRule, PanosApplication } from '../../../../../client';
import { AppIdRuntimeService } from '../app-id-runtime.service';
import { MatDialog } from '@angular/material/dialog';
import { PanosApplicationDetailsDialogComponent } from '../panos-application-details-dialog/panos-application-details-dialog.component';

@Component({
  selector: 'app-app-id-table',
  templateUrl: './app-id-table.component.html',
  styleUrls: ['./app-id-table.component.css'],
})
export class AppIdTableComponent implements OnChanges {
  @Input() type = '';
  @Input() applications: PanosApplication[] = [];
  @Input() firewallRule: FirewallRule;

  displayedColumns: string[] = ['name', 'category', 'subCategory', 'risk', 'actions'];
  filteredApplications: PanosApplication[];
  searchQuery = '';

  constructor(private appIdService: AppIdRuntimeService, public dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.applications) {
      this.onSearch();
    }
  }

  public addPanosAppToFirewallRule(panosApplication: PanosApplication): void {
    this.appIdService.addPanosAppToFirewallRule(panosApplication, this.firewallRule);
    this.refreshData();
  }

  public removePanosAppFromFirewallRule(panosApplication: PanosApplication): void {
    this.appIdService.removePanosAppFromFirewallRule(panosApplication, this.firewallRule);
    this.refreshData();
  }

  refreshData(): void {
    this.onSearch();
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredApplications = this.applications.filter(app => this.filterApplications(query, app));

    // Ensure the application reflects its updated firewall rule status
    if (this.type === 'available') {
      this.filteredApplications = this.filteredApplications.filter(
        app => !app.firewallRules.some(rule => rule.id === this.firewallRule.id),
      );
    } else if (this.type === 'assocaited') {
      this.filteredApplications = this.filteredApplications.filter(app => app.firewallRules.some(rule => rule.id === this.firewallRule.id));
    }
  }

  private filterApplications(query: string, app: PanosApplication): boolean {
    if (query.length === 1 && (parseInt(query, 10) >= 0 || parseInt(query, 10) <= 5)) {
      return app.risk === query;
    } else {
      return (
        this.includesQuery(app.panosId, query) ||
        this.includesQuery(app.minver, query) ||
        this.includesQuery(app.name, query) ||
        this.includesQuery(app.oriCountry, query) ||
        this.includesQuery(app.oriLanguage, query) ||
        this.includesQuery(app.category, query) ||
        this.includesQuery(app.subCategory, query) ||
        this.includesQuery(app.technology, query)
      );
    }
  }

  private includesQuery(field: string | undefined, query: string): boolean {
    return field ? field.toLowerCase().includes(query) : false;
  }

  openDetailsDialog(app: PanosApplication): void {
    this.dialog.open(PanosApplicationDetailsDialogComponent, {
      data: { app, firewallRuleGroupId: this.firewallRule.firewallRuleGroupId },
    });
  }
}
