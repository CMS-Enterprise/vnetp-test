import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetManyServiceGraphResponseDto, V2AppCentricServiceGraphsService, ServiceGraph } from 'client';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { RouteDataUtil } from '../../../../../utils/route-data.util';
import { ApplicationMode } from '../../../../../models/other/application-mode-enum';
import { TenantPortalNavigationService } from 'src/app/services/tenant-portal-navigation.service';

@Component({
  selector: 'app-service-graphs',
  templateUrl: './service-graphs.component.html',
  styleUrls: ['./service-graphs.component.css'],
})
export class ServiceGraphsComponent implements OnInit {
  public currentPage = 1;
  public perPage = 20;
  public serviceGraphs = {} as GetManyServiceGraphResponseDto;
  public tableComponentDto = new TableComponentDto();
  public tenantId: string;
  public applicationMode: ApplicationMode;
  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Name', propertyName: 'name', searchOperator: 'cont' },
    { displayName: 'Firewall Name', propertyName: 'serviceGraphFirewall.name', searchOperator: 'cont' },
    { displayName: 'Firewall Device Type', propertyName: 'serviceGraphFirewall.firewallDeviceType', searchOperator: 'cont' },
    { displayName: 'VSYS Name', propertyName: 'serviceGraphFirewall.vsysName', searchOperator: 'cont' },
  ];

  public config: TableConfig<any> = {
    description: 'Service Graphs',
    columns: [
      { name: 'Service Graph Name', property: 'name' },
      { name: 'Firewall Name', property: 'serviceGraphFirewall.name' },
      { name: 'Firewall Device Type', property: 'serviceGraphFirewall.firewallDeviceType' },
      { name: 'VSYS Name', property: 'serviceGraphFirewall.vsysName' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private serviceGraphService: V2AppCentricServiceGraphsService,
    private tableContextService: TableContextService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tenantPortalNavigation: TenantPortalNavigationService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<ServiceGraph>();
    advancedSearchAdapter.setService(this.serviceGraphService);
    advancedSearchAdapter.setServiceName('V2AppCentricServiceGraphsService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
  }

  ngOnInit(): void {
    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(this.activatedRoute);
    this.getServiceGraphs();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getServiceGraphs(event);
  }

  public getServiceGraphs(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }

    const relations = ['serviceGraphFirewall', 'vrf'];

    this.serviceGraphService
      .getManyServiceGraph({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams].filter(Boolean),
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        relations,
      })
      .subscribe({
        next: data => {
          this.serviceGraphs = data;
        },
        error: () => {
          this.serviceGraphs = null;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private refreshServiceGraphs(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getServiceGraphs(params);
    } else {
      this.getServiceGraphs();
    }
  }

  public editFirewallConfig(serviceGraph: ServiceGraph): void {
    // Use navigation service to handle firewall config navigation
    if (serviceGraph.serviceGraphFirewall) {
      this.tenantPortalNavigation.navigateToFirewallConfig(
        {
          type: 'service-graph-firewall',
          firewallId: serviceGraph.serviceGraphFirewall.id,
          firewallName: serviceGraph.serviceGraphFirewall.name,
          serviceGraphId: serviceGraph.id,
        },
        this.activatedRoute,
      );
    }
  }
}
