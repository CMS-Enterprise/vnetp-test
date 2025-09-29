import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetManyExternalFirewallResponseDto, V2AppCentricExternalFirewallsService, ExternalFirewall } from 'client';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { RouteDataUtil } from '../../../../../utils/route-data.util';
import { ApplicationMode } from '../../../../../models/other/application-mode-enum';

@Component({
  selector: 'app-external-firewalls',
  templateUrl: './external-firewalls.component.html',
  styleUrls: ['./external-firewalls.component.css'],
})
export class ExternalFirewallsComponent implements OnInit {
  public currentPage = 1;
  public perPage = 20;
  public externalFirewalls = {} as GetManyExternalFirewallResponseDto;
  public tableComponentDto = new TableComponentDto();
  public tenantId: string;
  public applicationMode: ApplicationMode;
  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Name', propertyName: 'name', searchOperator: 'cont' },
    { displayName: 'Firewall Device Type', propertyName: 'firewallDeviceType', searchOperator: 'cont' },
    { displayName: 'VSYS Name', propertyName: 'vsysName', searchOperator: 'cont' },
    { displayName: 'BGP ASN', propertyName: 'bgpAsn', propertyType: 'number' },
    { displayName: 'Routing Cost', propertyName: 'routingCost', propertyType: 'number' },
  ];

  public config: TableConfig<any> = {
    description: 'External Firewalls',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Firewall Device Type', property: 'firewallDeviceType' },
      { name: 'VSYS Name', property: 'vsysName' },
      { name: 'BGP ASN', property: 'bgpAsn' },
      { name: 'Routing Cost', property: 'routingCost' },
      { name: 'Unique Zone Per External VRF Connection', property: 'uniqueZonePerExternalVrfConnection' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private externalFirewallService: V2AppCentricExternalFirewallsService,
    private tableContextService: TableContextService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<ExternalFirewall>();
    advancedSearchAdapter.setService(this.externalFirewallService);
    advancedSearchAdapter.setServiceName('V2AppCentricExternalFirewallsService');
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
    this.getExternalFirewalls();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getExternalFirewalls(event);
  }

  public getExternalFirewalls(event?): void {
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

    const relations = ['tenant', 'l3outs', 'externalVrfConnections'];

    this.externalFirewallService
      .getManyExternalFirewall({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams].filter(Boolean),
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        relations,
      })
      .subscribe({
        next: data => {
          this.externalFirewalls = data;
        },
        error: () => {
          this.externalFirewalls = null;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private refreshExternalFirewalls(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getExternalFirewalls(params);
    } else {
      this.getExternalFirewalls();
    }
  }

  public editFirewallConfig(externalFirewall: ExternalFirewall): void {
    this.router.navigate(
      [
        '/tenantv2/tenant-select/edit',
        this.tenantId,
        'home',
        {
          outlets: {
            'tenant-portal': ['firewall-config', 'external-firewall', externalFirewall.id],
          },
        },
      ],
      {
        queryParamsHandling: 'preserve',
      },
    );
  }
}
