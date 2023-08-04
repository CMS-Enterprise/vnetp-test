import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Datacenter, Tenant, V2AppCentricTenantsService } from 'client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TableConfig } from '../table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { SearchColumnConfig } from '../search-bar/search-bar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-environment-summary',
  templateUrl: './environment-summary.component.html',
  styleUrls: ['./environment-summary.component.css'],
})
export class EnvironmentSummaryComponent implements OnInit, OnDestroy {
  public tenants: Tenant[];
  public datacenters: Datacenter[];
  private datacentersSubscription: Subscription;
  public isLoading = false;
  public tableData: EnvironmentSummary[] = [];
  public tableDataPagination = {
    data: this.tableData,
    count: 1000,
    total: 1000,
    page: 1,
    pageCount: 1000,
  };
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 1000;

  @ViewChild('nameNavigateTemplate') nameNavigateTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Tenants and Datacenters',
    columns: [
      { name: 'Name', template: () => this.nameNavigateTemplate },
      { name: 'Description', property: 'description' },
      { name: 'Type', property: 'type' },
    ],
  };

  constructor(
    private tenantService: V2AppCentricTenantsService,
    private datacenterContextService: DatacenterContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.datacentersSubscription = this.datacenterContextService.datacenters.subscribe(datacenters => {
      this.datacenters = datacenters;
      if (this.datacenters) {
        this.datacenters.forEach(datacenter => {
          this.tableData.push({
            name: datacenter.name,
            description: datacenter.description,
            type: 'Netcentric',
            id: datacenter.id,
          });
        });
      }
    });
    this.getTenants();
  }

  ngOnDestroy(): void {
    this.datacentersSubscription.unsubscribe();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getTenants();
  }

  public getTenants(): void {
    this.isLoading = true;
    this.tenantService
      .getManyTenant({
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.tenants = data.data;
          if (this.tenants) {
            this.tenants.forEach(tenant => {
              this.tableData.push({
                name: tenant.name,
                description: tenant.description,
                type: 'Appcentric',
                id: tenant.id,
              });
            });
          }
        },
        () => {
          this.tenants = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public switchDatacenter(datacenterId): void {
    this.datacenterContextService.switchDatacenter(datacenterId);
    this.router.navigate(['/netcentric/dashboard'], {
      queryParams: { datacenter: datacenterId },
      queryParamsHandling: 'merge',
    });
  }
}

export interface EnvironmentSummary {
  name: string;
  description: string;
  type: string;
  id: string;
}
