import { Component, Input, OnInit, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { isIP } from 'validator';
import {
  ExternalRoute,
  V3GlobalExternalRoutesService,
  V3GlobalEnvironmentsService,
  GlobalExternalRoute,
  V2AppCentricVrfsService,
  Vrf,
  V2RoutingExternalRoutesService,
  ExternalVrfConnection,
  V2RoutingExternalVrfConnectionsService,
  ExternalVrf,
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
    private environmentService: V3GlobalEnvironmentsService,
    private externalRouteService: V2RoutingExternalRoutesService,
    private vrfService: V2AppCentricVrfsService,
    private externalVrfConnectionService: V2RoutingExternalVrfConnectionsService,
  ) {}

  ngOnInit(): void {
    this.setFilterPredicates();
    this.getConnectionChildren().subscribe(connection => {
      this.externalVrfConnection = connection;
      this.getAllRoutes();
    });
  }

  getConnectionChildren(): Observable<ExternalVrfConnection> {
    return this.externalVrfConnectionService.getOneExternalVrfConnection({
      id: this.externalVrfConnection.id,
      relations: ['externalFirewall.externalVrfConnections'],
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
    this._fetchEnvironmentVrfs().subscribe(environmentVrfs => {
      const vrfIds = environmentVrfs.map(vrf => vrf.id).filter(Boolean) as string[];
      this.availableVrfs = environmentVrfs.map(vrf => vrf.name).sort();
      const availableExternalVrfs = vrfIds.join(',');

      forkJoin({
        globalRoutes: this._fetchGlobalRoutes(availableExternalVrfs),
        assignedRoutes: this._fetchAssignedRoutes(),
      }).subscribe(({ globalRoutes, assignedRoutes }) => {
        this._processRoutesData(globalRoutes, assignedRoutes);
      });
    });
  }

  private _fetchEnvironmentVrfs(): Observable<ExternalVrf[]> {
    return this.environmentService
      .getOneEnvironment({ id: this.environmentId, relations: ['externalVrfs'] })
      .pipe(map(env => (env?.externalVrfs ?? []) as ExternalVrf[]));
  }

  private _fetchGlobalRoutes(availableExternalVrfs: string): Observable<GlobalExternalRoute[]> {
    return this.globalExternalRouteService
      .getManyExternalRoutes({
        environmentId: this.environmentId,
        limit: 50000,
        relations: ['externalVrf'],
        filter: availableExternalVrfs ? [`externalVrfId||in||${availableExternalVrfs}`] : [],
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
    const parentAsnString =
      this.externalVrfConnection.externalFirewall.bgpAsn != null ? String(this.externalVrfConnection.externalFirewall.bgpAsn) : '';
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
      filteredRoutes = filteredRoutes.filter(route => route.externalVrf.name === this.selectedVrf);
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
    this.ngx.setModalData(
      {
        externalVrfConnectionId: this.externalVrfConnection.id,
        tenantId: this.externalVrfConnection.tenantId,
      },
      'externalRouteModal',
    );
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

  private setFilterPredicates(): void {
    this.assignedRoutesDataSource.filterPredicate = (data, filter) => this.matchesRouteFilter(data, filter);
    this.availableRoutesDataSource.filterPredicate = (data, filter) => this.matchesRouteFilter(data as any, filter);
  }

  private matchesRouteFilter(route: any, filter: string): boolean {
    const term = (filter || '').trim().toLowerCase();
    if (!term) {
      return true;
    }

    if (this.isIpQuery(term)) {
      return this.routeMatchesIp(route, term);
    }

    return this.routeMatchesText(route, term);
  }

  private routeMatchesIp(route: any, ipQuery: string): boolean {
    const networks: Array<string | undefined> = [route?.network, route?.globalExternalRoute?.network];
    return networks.some(net => this.ipMatchesNetwork(ipQuery, net));
  }

  private routeMatchesText(route: any, term: string): boolean {
    const haystack = [
      route?.network,
      route?.externalVrf,
      route?.protocol,
      route?.tag,
      route?.metric,
      route?.globalExternalRoute?.network,
      route?.globalExternalRoute?.externalVrf,
    ]
      .filter(Boolean)
      .map(value => String(value).toLowerCase())
      .join(' ');

    return haystack.includes(term);
  }

  private isIpQuery(value: string): boolean {
    return isIP(value, 4) || isIP(value, 6);
  }

  private ipMatchesNetwork(ip: string, network?: string): boolean {
    if (!network) {
      return false;
    }
    const subnet = this.parseCidr(network);
    const ipParsed = this.parseIp(ip);
    if (!subnet || !ipParsed || subnet.version !== ipParsed.version) {
      return false;
    }
    return this.isIpInSubnet(ipParsed.bytes, subnet.bytes, subnet.prefix);
  }

  private parseCidr(value: string): { version: 4 | 6; bytes: number[]; prefix: number } | null {
    const [addr, prefixRaw] = value.trim().split('/');
    const prefix = Number(prefixRaw);
    if (!addr || Number.isNaN(prefix)) {
      return null;
    }
    const parsed = this.parseIp(addr);
    if (!parsed) {
      return null;
    }
    const maxPrefix = parsed.version === 4 ? 32 : 128;
    if (prefix < 0 || prefix > maxPrefix) {
      return null;
    }
    return { version: parsed.version, bytes: parsed.bytes, prefix };
  }

  private parseIp(value: string): { version: 4 | 6; bytes: number[] } | null {
    if (isIP(value, 4)) {
      return { version: 4, bytes: value.split('.').map(octet => Number(octet)) };
    }
    if (isIP(value, 6)) {
      const bytes = this.parseIpv6ToBytes(value);
      return bytes ? { version: 6, bytes } : null;
    }
    return null;
  }

  private parseIpv6ToBytes(value: string): number[] | null {
    /* eslint-disable no-bitwise */
    const parts = value.split('::');
    if (parts.length > 2) {
      return null;
    }

    const left = parts[0] ? parts[0].split(':').filter(Boolean) : [];
    const right = parts[1] ? parts[1].split(':').filter(Boolean) : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) {
      return null;
    }

    const hextets = [...left, ...Array(missing).fill('0'), ...right].map(part => parseInt(part || '0', 16));

    if (hextets.length !== 8 || hextets.some(n => Number.isNaN(n) || n < 0 || n > 0xffff)) {
      return null;
    }

    const bytes: number[] = [];
    hextets.forEach(n => {
      bytes.push((n >> 8) & 0xff, n & 0xff);
    });
    return bytes;
    /* eslint-enable no-bitwise */
  }

  private isIpInSubnet(ipBytes: number[], subnetBytes: number[], prefix: number): boolean {
    /* eslint-disable no-bitwise */
    const fullBytes = Math.floor(prefix / 8);
    const remainingBits = prefix % 8;

    for (let i = 0; i < fullBytes; i += 1) {
      if (ipBytes[i] !== subnetBytes[i]) {
        return false;
      }
    }

    if (remainingBits === 0) {
      return true;
    }

    const mask = 0xff << (8 - remainingBits);
    return (ipBytes[fullBytes] & mask) === (subnetBytes[fullBytes] & mask);
    /* eslint-enable no-bitwise */
  }
}
