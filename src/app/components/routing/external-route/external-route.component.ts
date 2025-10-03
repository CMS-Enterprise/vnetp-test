import { Component, Input, OnInit, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalMode } from 'src/app/models/other/modal-mode';
import {
  ExternalRoute,
  V3GlobalExternalRoutesService,
  GlobalExternalRoute,
  V2AppCentricVrfsService,
  Vrf,
  V2RoutingExternalRoutesService,
  ExternalVrfConnection,
  V2RoutingExternalVrfConnectionsService,
} from '../../../../../client';

interface ExternalRouteWithGlobalRoute extends ExternalRoute {
  globalExternalRoute: GlobalExternalRoute;
}

@Component({
  selector: 'app-external-route',
  templateUrl: './external-route.component.html',
  styleUrls: ['./external-route.component.css'],
})
export class ExternalRouteComponent implements OnInit, AfterViewInit {
  @Input() externalVrfConnection: ExternalVrfConnection;
  @Input() vrf: Vrf;
  @Input() environmentId: string;
  @Output() routeChanges = new EventEmitter<void>();
  dcsMode: string;
  assignedRoutesDataSource = new MatTableDataSource<ExternalRouteWithGlobalRoute>();
  availableRoutesDataSource = new MatTableDataSource<GlobalExternalRoute>();
  private modalSubscription: Subscription;
  public ModalMode = ModalMode;
  assignedRoutesSearchQuery = '';
  availableRoutesSearchQuery = '';

  public allGlobalRoutes: GlobalExternalRoute[];
  public availableVrfs: string[] = [];
  public selectedVrf = '';

  public parentVrf: Vrf;

  displayedColumns: string[] = ['network', 'externalVrf', 'lastSeen', 'protocol', 'metric', 'uptime', 'tag', 'actions'];

  @ViewChild('assignedRoutesSort') assignedRoutesSort: MatSort;
  @ViewChild('availableRoutesSort') availableRoutesSort: MatSort;
  @ViewChild('assignedRoutesPaginator') assignedRoutesPaginator: MatPaginator;
  @ViewChild('availableRoutesPaginator') availableRoutesPaginator: MatPaginator;

  constructor(
    private ngx: NgxSmartModalService,
    private globalExternalRouteService: V3GlobalExternalRoutesService,
    private externalRouteService: V2RoutingExternalRoutesService,
    private vrfService: V2AppCentricVrfsService,
    private externalVrfConnectionService: V2RoutingExternalVrfConnectionsService,
  ) {}

  ngOnInit(): void {
    this.getConnectionChildren().subscribe(connection => {
      this.externalVrfConnection = connection;
      this.getAllRoutes();
    });
  }

  getConnectionChildren(): Observable<ExternalVrfConnection> {
    return this.externalVrfConnectionService.getOneExternalVrfConnection({
      id: this.externalVrfConnection.id, relations: [
        'externalFirewall.externalVrfConnections',
      ]
    });
  }

  ngAfterViewInit(): void {
    this.assignedRoutesDataSource.sort = this.assignedRoutesSort;
    this.assignedRoutesDataSource.paginator = this.assignedRoutesPaginator;
    this.availableRoutesDataSource.sort = this.availableRoutesSort;
    this.availableRoutesDataSource.paginator = this.availableRoutesPaginator;
  }

  addRouteToExternalVrfConnection(route: GlobalExternalRoute): void {
    this.externalRouteService
      .createOneExternalRoute({
        externalRoute: {
          externalVrfConnectionId: this.externalVrfConnection.id,
          globalExternalRouteId: route.id,
          tenantId: this.externalVrfConnection.tenantId,
        } as any,
      })
      .subscribe(() => {
        this.getAllRoutes();
      });
  }

  removeRouteFromExternalVrfConnection(route: ExternalRoute): void {
    this.deleteRoute(route);
  }

  getAllRoutes(): void {
    const availableExternalVrfs = this.externalVrfConnection.
      externalFirewall.externalVrfConnections.map(connection => connection.externalVrf).join(',');
    forkJoin({
      globalRoutes: this._fetchGlobalRoutes(availableExternalVrfs),
      assignedRoutes: this._fetchAssignedRoutes(),
    }).subscribe(({ globalRoutes, assignedRoutes }) => {
      this._processRoutesData(globalRoutes, assignedRoutes);
    });
  }

  private _fetchGlobalRoutes(availableExternalVrfs: string): Observable<GlobalExternalRoute[]> {
    return this.globalExternalRouteService
      .getManyExternalRoutes({
        environmentId: this.environmentId,
        limit: 50000,
        filter: [`externalVrf||in||${availableExternalVrfs}`,],
      })
      .pipe(map(response => (response || []) as GlobalExternalRoute[]));
  }

  private _fetchAssignedRoutes(): Observable<ExternalRoute[]> {
    return this.externalRouteService
      .getManyExternalRoute({
        filter: [`externalVrfConnectionId||eq||${this.externalVrfConnection.id}`],
        limit: 50000,
      })
      .pipe(map(response => (response || []) as ExternalRoute[]));
  }

  private _processRoutesData(globalRoutes: GlobalExternalRoute[], assignedRoutes: ExternalRoute[]): void {
    this.allGlobalRoutes = globalRoutes;
    this.availableVrfs = [...new Set(
      this.externalVrfConnection.externalFirewall.externalVrfConnections.map(connection => connection.externalVrf))].sort();

    const localRoutes = assignedRoutes as ExternalRouteWithGlobalRoute[];
    localRoutes.forEach(route => {
      route.globalExternalRoute = this.allGlobalRoutes.find(globalRoute => globalRoute.id === route.globalExternalRouteId);
    });

    this.assignedRoutesDataSource.data = localRoutes;
    this.updateAvailableRoutes();
  }

  deleteRoute(route: ExternalRoute): void {
    if (route.deletedAt) {
      this.externalRouteService.deleteOneExternalRoute({ id: route.id }).subscribe(() => {
        this.getAllRoutes();
      });
    } else {
      this.externalRouteService.softDeleteOneExternalRoute({ id: route.id }).subscribe(() => {
        this.getAllRoutes();
      });
    }
  }

  // Disable add when available route tag matches parent VRF external BGP ASN
  public isRouteBgpTagBlocked(route: GlobalExternalRoute): boolean {
    if (!route) {
      return false;
    }
    const routeTagString = route.tag != null ? String(route.tag) : '';
    const parentAsnString = this.externalVrfConnection.externalFirewall.bgpAsn != null ?
      String(this.externalVrfConnection.externalFirewall.bgpAsn) : '';
    return routeTagString !== '' && parentAsnString !== '' && routeTagString === parentAsnString;
  }

  public getAddRouteTooltip(route: GlobalExternalRoute): string {
    if (this.isRouteBgpTagBlocked(route)) {
      return 'Add disabled: route tag matches the parent VRF external BGP ASN';
    }


    return 'Add Route to External VRF Connection';
  }

  public restoreRoute(route: ExternalRoute): void {
    this.externalRouteService.restoreOneExternalRoute({ id: route.id }).subscribe(() => {
      this.getAllRoutes();
    });
  }

  updateAvailableRoutes(): void {
    if (!this.allGlobalRoutes) {
      this.availableRoutesDataSource.data = [];
      return;
    }

    const assignedRouteIds = new Set(this.assignedRoutesDataSource.data.map(r => r.globalExternalRouteId));

    let filteredRoutes = this.allGlobalRoutes.filter(route => !assignedRouteIds.has(route.id));

    if (this.selectedVrf) {
      filteredRoutes = filteredRoutes.filter(route => route.externalVrf === this.selectedVrf);
    } else {
      // If no VRF is selected, the table should be empty to force a selection.
      filteredRoutes = [];
    }
    this.availableRoutesDataSource.data = filteredRoutes;

    if (this.availableRoutesDataSource.paginator) {
      this.availableRoutesDataSource.paginator.firstPage();
    }
  }

  public openModal(): void {
    this.subscribeToModal();
    this.ngx.setModalData({
      externalVrfConnectionId: this.externalVrfConnection.id, tenantId: this.externalVrfConnection.tenantId
    }, 'externalRouteModal');
    this.ngx.getModal('externalRouteModal').open();
  }

  private subscribeToModal(): void {
    this.modalSubscription = this.ngx.getModal('externalRouteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('externalRouteModal');
      this.modalSubscription.unsubscribe();

      this.getAllRoutes();
    });
  }

  public onAssignedRoutesSearch(): void {
    this.assignedRoutesDataSource.filter = this.assignedRoutesSearchQuery.trim().toLowerCase();
  }

  public onAvailableRoutesSearch(): void {
    this.availableRoutesDataSource.filter = this.availableRoutesSearchQuery.trim().toLowerCase();
  }
}
