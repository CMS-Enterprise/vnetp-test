import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppCentricSubnet,
  ExternalVrfConnection,
  GlobalExternalRoute,
  RouteControlRequest,
  Tenant,
  TenantRouteControlStatusEnum,
  V2AppCentricAppCentricSubnetsService,
  V2AppCentricTenantsService,
  V2RoutingExternalVrfConnectionsService,
  V3GlobalExternalRoutesService,
  V3GlobalRouteControlRequestService,
} from 'client';
import { MatDialog } from '@angular/material/dialog';
import { RejectReasonDialogComponent } from './dialogs/reject-reason-dialog.component';
import { SimpleConfirmDialogComponent } from './dialogs/simple-confirm-dialog.component';
import { ResourceDetailsDialogComponent } from './dialogs/resource-details-dialog.component';
import { YesNoModalDto } from '../../../../models/other/yes-no-modal-dto';
import SubscriptionUtil from '../../../../utils/SubscriptionUtil';
import { forkJoin } from 'rxjs';

interface GroupedChange {
  externalVrfConnectionName: string;
  internalAdditions: any[];
  externalAdditions: any[];
  internalModifications: any[];
  externalModifications: any[];
  internalDeletions: any[];
  externalDeletions: any[];
}

@Component({
  selector: 'app-route-control-request-detail',
  templateUrl: './route-control-request-detail.component.html',
  styleUrls: ['./route-control-request-detail.component.css'],
})
export class RouteControlRequestDetailComponent implements OnInit {
  public routeControlRequest: RouteControlRequest = {} as RouteControlRequest;
  public routeControlChanges: any;
  public groupedChanges: GroupedChange[] = [];
  public isLoading = false;
  private requestId: string;
  private environmentId: string;
  private subnetCache = new Map<string, AppCentricSubnet>();
  private externalVrfConnectionCache = new Map<string, ExternalVrfConnection>();
  private globalExternalRouteCache = new Map<string, GlobalExternalRoute>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routeControlRequestService: V3GlobalRouteControlRequestService,
    private tenantService: V2AppCentricTenantsService,
    private subnetsService: V2AppCentricAppCentricSubnetsService,
    private externalVrfConnectionsService: V2RoutingExternalVrfConnectionsService,
    private globalExternalRoutesService: V3GlobalExternalRoutesService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.requestId = this.route.snapshot.paramMap.get('id');
    if (this.requestId) {
      this.loadRequestDetails();
    } else {
      this.isLoading = false;
    }
  }

  private loadRequestDetails(): void {
    this.routeControlRequestService.getManyRouteControlRequests({ filter: [`id||eq||${this.requestId}`] }).subscribe(response => {
      this.routeControlRequest = response[0];
      if (this.routeControlRequest?.tenantId) {
        this.loadRouteControlChanges(this.routeControlRequest.tenantId);
      } else {
        this.isLoading = false;
        console.error('Tenant ID not found on Route Control Request.');
      }
    });
  }

  private loadRouteControlChanges(tenantId: string): void {
    this.isLoading = true;
    forkJoin({
      tenant: this.tenantService.getOneTenant({ id: tenantId }) as any,
      changes: this.tenantService.getRouteControlChangesTenant({ tenantId }) as any,
    }).subscribe({
      next: async ({ tenant, changes }) => {
        this.environmentId = (tenant as any)?.environmentId;
        this.routeControlChanges = Object.assign({}, changes || {}, { tenantName: (tenant as any)?.name });
        // Prefetch all unique External VRF Connections referenced in changes for name resolution
        await this.prefetchExternalVrfConnections(this._collectExternalVrfConnectionIds(this.routeControlChanges));
        this._groupChangesByExternalVrfConnection(this.routeControlChanges);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private _collectExternalVrfConnectionIds(changes: any): string[] {
    const ids = new Set<string>();
    const groups = changes?.routeControlChanges || [];
    for (const g of groups) {
      const addInt = g?.addedInternalRoutes || [];
      const addExt = g?.addedExternalRoutes || [];
      const modInt = g?.modifiedInternalRoutes || [];
      const modExt = g?.modifiedExternalRoutes || [];
      const delInt = g?.removedInternalRoutes || [];
      const delExt = g?.removedExternalRoutes || [];
      [addInt, addExt, modInt, modExt, delInt, delExt].forEach(arr => {
        for (const r of arr) {
          const id = r?.externalVrfConnectionId;
          if (id) {
            ids.add(id);
          }
        }
      });
    }
    return Array.from(ids);
  }

  private async prefetchExternalVrfConnections(ids: string[]): Promise<void> {
    const missing = ids.filter(id => !this.externalVrfConnectionCache.has(id));
    if (!missing.length) {
      return;
    }
    const res = await (
      this.externalVrfConnectionsService.getManyExternalVrfConnection({
        filter: [`id||in||${missing.join(',')}`],
        limit: missing.length,
      }) as any
    ).toPromise();
    const items: any[] = Array.isArray(res) ? res : res?.data || res?.items || [];
    items.forEach(item => {
      if (item?.id) {
        this.externalVrfConnectionCache.set(item.id, item);
      }
    });
  }

  private _groupChangesByExternalVrfConnection(changes: any): void {
    const groups: { [key: string]: GroupedChange } = {};

    (changes?.routeControlChanges || []).forEach(change => {
      const resolveName = (): string => {
        const internalId =
          change?.addedInternalRoutes?.[0]?.externalVrfConnectionId ||
          change?.removedInternalRoutes?.[0]?.externalVrfConnectionId ||
          change?.modifiedInternalRoutes?.[0]?.externalVrfConnectionId;
        const externalId =
          change?.addedExternalRoutes?.[0]?.externalVrfConnectionId ||
          change?.removedExternalRoutes?.[0]?.externalVrfConnectionId ||
          change?.modifiedExternalRoutes?.[0]?.externalVrfConnectionId;
        return change?.vrfName || internalId || externalId || 'Unknown External VRF Connection';
      };
      const name = resolveName();
      if (!groups[name]) {
        groups[name] = {
          externalVrfConnectionName: name,
          internalAdditions: [],
          externalAdditions: [],
          internalModifications: [],
          externalModifications: [],
          internalDeletions: [],
          externalDeletions: [],
        };
      }

      // Consolidate by type
      groups[name].internalAdditions.push(...(change.addedInternalRoutes || []));
      groups[name].externalAdditions.push(...(change.addedExternalRoutes || []));
      groups[name].internalDeletions.push(...(change.removedInternalRoutes || []));
      groups[name].externalDeletions.push(...(change.removedExternalRoutes || []));
      groups[name].internalModifications.push(...(change.modifiedInternalRoutes || []));
      groups[name].externalModifications.push(...(change.modifiedExternalRoutes || []));
    });

    this.groupedChanges = Object.values(groups);
  }

  public goBack(): void {
    this.router.navigate(['/adminportal/route-control-request'], { queryParamsHandling: 'merge' });
  }

  // Derive a dynamic set of columns from the provided items
  public getColumnsFor(items: any[] | null | undefined): string[] {
    if (!items || items.length === 0) {
      return [];
    }

    const columnNames = new Set<string>();
    for (const item of items) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach(key => columnNames.add(key));
      } else {
        columnNames.add('value');
      }
    }
    return Array.from(columnNames);
  }

  public trackByColumn(_index: number, column: string): string {
    return column;
  }

  public getCellValue(row: any, column: string): any {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      return row[column];
    }
    return row;
  }

  public formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      return value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  public resolveExternalVrfName(externalVrfConnectionId: string | null | undefined): string {
    if (!externalVrfConnectionId) {
      return '';
    }
    const conn = this.externalVrfConnectionCache.get(externalVrfConnectionId);
    return conn?.name || externalVrfConnectionId;
  }

  public resolveGroupExternalVrfName(group: GroupedChange): string {
    const id =
      group.internalAdditions?.[0]?.externalVrfConnectionId ||
      group.externalAdditions?.[0]?.externalVrfConnectionId ||
      group.internalModifications?.[0]?.externalVrfConnectionId ||
      group.externalModifications?.[0]?.externalVrfConnectionId ||
      group.internalDeletions?.[0]?.externalVrfConnectionId ||
      group.externalDeletions?.[0]?.externalVrfConnectionId;
    const name = this.resolveExternalVrfName(id);
    return name || group.externalVrfConnectionName;
  }

  // Lazy fetch with caching for modal details
  public async openSubnetDetails(appcentricSubnetId: string): Promise<void> {
    if (!appcentricSubnetId) {
      return;
    }
    let subnet = this.subnetCache.get(appcentricSubnetId);
    if (!subnet) {
      subnet = await (this.subnetsService.getOneAppCentricSubnet({ id: appcentricSubnetId }) as any).toPromise();
      this.subnetCache.set(appcentricSubnetId, subnet);
    }
    this.openDetailsDialog('AppCentricSubnet', subnet);
  }

  public async openExternalVrfConnectionDetails(externalVrfConnectionId: string): Promise<void> {
    if (!externalVrfConnectionId) {
      return;
    }
    let conn = this.externalVrfConnectionCache.get(externalVrfConnectionId);
    if (!conn) {
      conn = await (this.externalVrfConnectionsService.getOneExternalVrfConnection({ id: externalVrfConnectionId }) as any).toPromise();
      this.externalVrfConnectionCache.set(externalVrfConnectionId, conn);
    }
    this.openDetailsDialog('ExternalVrfConnection', conn);
  }

  public async openGlobalExternalRouteDetails(globalExternalRouteId: string): Promise<void> {
    if (!globalExternalRouteId) {
      return;
    }
    let route = this.globalExternalRouteCache.get(globalExternalRouteId);
    if (!route) {
      const res = await (
        this.globalExternalRoutesService.getManyExternalRoutes({
          environmentId: this.environmentId,
          filter: [`id||eq||${globalExternalRouteId}`],
          limit: 1,
        }) as any
      ).toPromise();
      route = Array.isArray(res) ? res[0] : res?.data?.[0] || res?.items?.[0] || res?.[0];
      this.globalExternalRouteCache.set(globalExternalRouteId, route);
    }
    this.openDetailsDialog('GlobalExternalRoute', route);
  }

  private openDetailsDialog(type: string, payload: any): void {
    this.dialog.open(ResourceDetailsDialogComponent, {
      width: '720px',
      data: { type, payload },
    });
  }

  public approveRequest(): void {
    const dto = new YesNoModalDto(
      'Approve Route Control Request',
      'Are you sure you want to approve this request? It will be applied immediately.',
    );
    const onConfirm = () => {
      // this.routeControlRequestService.approveOneRouteControlRequest({ id: this.requestId }).subscribe(() => {
      //   this.router.navigate(['/admin/route-control-requests']);
      // });
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, null as any, onConfirm);
  }

  public rejectRequest(): void {
    const reasonRef = this.dialog.open(RejectReasonDialogComponent, {
      width: '720px',
      data: { title: 'Reject Route Control Request' },
    });
    reasonRef.afterClosed().subscribe(async (res: { reason: string } | null) => {
      if (!res || !res.reason) {
        return;
      }
      const confirmRes = await this.dialog
        .open(SimpleConfirmDialogComponent, {
          width: '420px',
          data: {
            title: 'Confirm Rejection',
            message: 'Are you sure you want to reject this request? This action cannot be undone.',
            confirmText: 'Reject',
            cancelText: 'Cancel',
          },
        })
        .afterClosed()
        .toPromise();
      if (confirmRes === true) {
        this.tenantService
          .updateOneTenant({
            id: this.routeControlRequest.tenantId,
            tenant: {
              routeControlRejectionReason: res.reason,
              routeControlStatus: TenantRouteControlStatusEnum.Active,
            } as Tenant,
          })
          .subscribe(() => {
            this.routeControlRequestService.deleteOneRouteControlRequest({ routeControlRequestId: this.requestId }).subscribe(() => {
              this.router.navigate(['/adminportal/route-control-request'], { queryParamsHandling: 'merge' });
            });
          });
      }
    });
  }
}
