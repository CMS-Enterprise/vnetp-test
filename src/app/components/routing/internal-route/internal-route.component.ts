import { Component, Input, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable, Subscription } from 'rxjs';
import {
  Vlan,
  BridgeDomain,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  InternalRoute,
  GetManyInternalRouteResponseDto,
  ExternalVrfConnection,
  V2RoutingInternalRoutesService,
  V2RoutingExternalVrfConnectionsService,
} from 'client';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { InternalRouteModalDto } from 'src/app/models/network-scope-forms/internal-route-modal.dto';

@Component({
  selector: 'app-internal-route',
  templateUrl: './internal-route.component.html',
  styleUrls: ['./internal-route.component.css'],
})
export class InternalRouteComponent implements OnInit {
  @Input() externalVrfConnection: ExternalVrfConnection;
  @Input() tenantId: string;
  @Output() back = new EventEmitter<void>();
  public internalRoutes: GetManyInternalRouteResponseDto;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public ModalMode = ModalMode;
  public perPage = 20;

  public subnetVlans = new Map<string, Vlan>();
  public subnetBridgeDomains = new Map<string, BridgeDomain>();

  private modalSubscription: Subscription;

  public applicationMode: ApplicationMode;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('expandableRows') expandableRows: TemplateRef<any>;
  @ViewChild('subnetTemplate') subnetTemplate: TemplateRef<any>;
  @ViewChild('gatewayTemplate') gatewayTemplate: TemplateRef<any>;
  @ViewChild('bridgeDomainTemplate') bridgeDomainTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Internal Routes',
    columns: [
      { name: 'Subnet', template: () => this.subnetTemplate },
      { name: 'Gateway IP', template: () => this.gatewayTemplate },
      { name: 'Bridge Domain', template: () => this.bridgeDomainTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
    expandableRows: () => this.expandableRows,
    hideAdvancedSearch: true,
  };

  public searchColumns: SearchColumnConfig[] = [];

  constructor(
    private internalRouteService: V2RoutingInternalRoutesService,
    private ngx: NgxSmartModalService,
    private tableContextService: TableContextService,
    private netcentricSubnetService: V1NetworkSubnetsService,
    private appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
    private externalVrfConnectionService: V2RoutingExternalVrfConnectionsService,
  ) {}

  ngOnInit(): void {
    this.getConnectionChildren().subscribe(connection => {
      this.externalVrfConnection = connection;
      this.getInternalRoutes();
      this.getChildren();
    });
  }

  getConnectionChildren(): Observable<ExternalVrfConnection> {
    return this.externalVrfConnectionService.getOneExternalVrfConnection({
      id: this.externalVrfConnection.id,
      relations: ['externalFirewall.externalVrfConnections'],
    });
  }

  public onTableEvent(event): void {
    this.tableComponentDto = event;
    this.getInternalRoutes(event);
  }

  public openModal(modalMode: ModalMode, internalRoute?: InternalRoute): void {
    const dto = new InternalRouteModalDto();

    dto.modalMode = modalMode;
    dto.externalVrfConnection = this.externalVrfConnection;
    dto.internalRoute = internalRoute;
    dto.tenantId = this.tenantId;

    this.subscribeToModal();
    this.ngx.setModalData(dto, 'internalRouteModal');
    this.ngx.getModal('internalRouteModal').open();
  }

  private subscribeToModal(): void {
    this.modalSubscription = this.ngx.getModal('internalRouteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('internalRouteModal');
      this.modalSubscription.unsubscribe();
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getInternalRoutes(params);
      } else {
        this.getInternalRoutes();
      }
    });
  }

  public getInternalRoutes(event?) {
    this.isLoading = true;

    const filter = [`externalVrfConnectionId||eq||${this.externalVrfConnection.id}`];

    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
    }
    this.internalRouteService
      .getManyInternalRoute({
        filter,
        join: ['appcentricSubnet'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe({
        next: data => {
          this.internalRoutes = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  public deleteInternalRoute(internalRoute: InternalRoute): void {
    this.isLoading = true;
    if (internalRoute.deletedAt) {
      this.internalRouteService
        .deleteOneInternalRoute({
          id: internalRoute.id,
        })
        .subscribe({
          next: () => {
            this.getInternalRoutes();
          },
          error: () => {
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    } else {
      this.internalRouteService.softDeleteOneInternalRoute({ id: internalRoute.id }).subscribe({
        next: () => {
          this.getInternalRoutes();
        },
        error: () => {
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  public restoreInternalRoute(internalRoute: InternalRoute): void {
    this.isLoading = true;
    this.internalRouteService.restoreOneInternalRoute({ id: internalRoute.id }).subscribe({
      next: () => {
        this.getInternalRoutes();
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  getChildren(): void {
    if (this.applicationMode === 'netcentric') {
      // this.getSubnetVlans();
      console.log('not implemented');
    } else {
      this.getSubnetBridgeDomains();
    }
  }

  getSubnetBridgeDomains(): void {
    this.appcentricSubnetService
      .getManyAppCentricSubnet({
        filter: [`tenantId||eq||${this.tenantId}`],
        join: ['bridgeDomain'],
      })
      .subscribe({
        next: (data: any) => {
          data.forEach(subnet => {
            this.subnetBridgeDomains.set(subnet.id, subnet.bridgeDomain);
          });
        },
      });
  }

  getSubnetVlans(): void {
    // this.netcentricSubnetService.getSubnetsByDatacenterIdSubnet({ datacenterId: this.wanForm.datacenterId }).subscribe(data => {
    //   data.forEach(subnet => {
    //     this.subnetVlans.set(subnet.id, subnet.vlan);
    //   });
    // });
    console.log('not implemented');
  }
}
