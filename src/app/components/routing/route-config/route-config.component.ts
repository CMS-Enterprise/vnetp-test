import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RoutingRejectionReasonDialogComponent } from '../rejection-reason-dialog.component';
import {
  ExternalVrfConnection,
  L3OutL3outTypeEnum,
  TenantRouteControlStatusEnum,
  V2AppCentricVrfsService,
  Vrf,
} from '../../../../../client';

@Component({
  selector: 'app-route-config',
  templateUrl: './route-config.component.html',
  styleUrls: ['./route-config.component.css'],
})
export class RouteConfigComponent implements OnInit {
  vrfId: string;
  vrf: Vrf;
  externalVrfConnections: ExternalVrfConnection[];
  currentView: 'list' | 'routes' | 'subnets' = 'list';
  selectedExternalVrfConnection: ExternalVrfConnection | null = null;
  environmentId: string;
  tenantId: string;
  blockChanges = false;
  showRejectionReason = false;

  constructor(
    private route: ActivatedRoute,
    private vrfService: V2AppCentricVrfsService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.vrfId = params.vrfId;
      this.getVrf();
    });
  }

  getVrf(): void {
    this.vrfService
      .getOneVrf({
        id: this.vrfId,
        relations: [
          'tenant',
          'l3outs.externalFirewall.externalVrfConnections.internalRoutes.appcentricSubnet',
          'l3outs.externalFirewall.externalVrfConnections.externalRoutes',
        ],
      })
      .subscribe(vrf => {
        this.vrf = vrf;
        this.blockChanges =
          vrf?.tenant?.routeControlStatus === TenantRouteControlStatusEnum.Pending ||
          vrf?.tenant?.routeControlStatus === TenantRouteControlStatusEnum.Approved;
        this.environmentId = vrf?.tenant?.environmentId;
        this.tenantId = vrf?.tenantId;
        this.externalVrfConnections = vrf.l3outs
          .filter(l3out => String(l3out.l3outType) !== L3OutL3outTypeEnum.Intervrf)
          .flatMap(l3out => l3out.externalFirewall.externalVrfConnections);
      });
  }

  trackById(_: number, item: ExternalVrfConnection): string | undefined {
    return item?.id || item?.name;
  }

  showList(): void {
    this.selectedExternalVrfConnection = null;
    this.currentView = 'list';
  }

  openManageRoutes(connection: ExternalVrfConnection): void {
    this.selectedExternalVrfConnection = connection;
    this.currentView = 'routes';
  }

  openManageSubnets(connection: ExternalVrfConnection): void {
    this.selectedExternalVrfConnection = connection;
    this.currentView = 'subnets';
  }

  goBackToVrf(): void {
    if (!this.tenantId) {
      return;
    }
    const urlTree = this.router.createUrlTree(
      ['/tenantv2', 'tenant-select', 'edit', this.tenantId, 'home', { outlets: { 'tenant-portal': ['vrf'] } }],
      { queryParamsHandling: 'merge' },
    );
    this.router.navigateByUrl(urlTree);
  }

  toggleRejectionReason(): void {
    this.showRejectionReason = !this.showRejectionReason;
  }

  openRejectionModal(): void {
    this.dialog.open(RoutingRejectionReasonDialogComponent, {
      width: '720px',
      data: { reason: this.vrf?.tenant?.routeControlRejectionReason },
    });
  }
}
