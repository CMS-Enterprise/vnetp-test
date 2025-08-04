import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { V3GlobalWanFormRequestService, TenantWanFormChanges, V2AppCentricTenantsService, WanFormRequest } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from '../../../../models/other/yes-no-modal-dto';
import SubscriptionUtil from '../../../../utils/SubscriptionUtil';

interface GroupedChange {
  wanFormName: string;
  additions: any[];
  modifications: any[];
  deletions: any[];
}

@Component({
  selector: 'app-wan-form-request-detail',
  templateUrl: './wan-form-request-detail.component.html',
  styleUrls: ['./wan-form-request-detail.component.css'],
})
export class WanFormRequestDetailComponent implements OnInit {
  public wanFormRequest: WanFormRequest = {} as WanFormRequest;
  public wanFormChanges: TenantWanFormChanges;
  public groupedChanges: GroupedChange[] = [];
  public isLoading = false;
  private requestId: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wanFormRequestService: V3GlobalWanFormRequestService,
    private tenantService: V2AppCentricTenantsService,
    private ngx: NgxSmartModalService,
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
    this.wanFormRequestService.getManyWanFormRequests({ filter: [`id||eq||${this.requestId}`] }).subscribe(response => {
      this.wanFormRequest = response[0];
      if (this.wanFormRequest?.tenantId) {
        this.loadWanFormChanges(this.wanFormRequest.tenantId);
      } else {
        this.isLoading = false;
        console.error('Tenant ID not found on WAN form request.');
      }
    });
  }

  private loadWanFormChanges(tenantId: string): void {
    this.tenantService.getWanFormChangesTenant({ id: tenantId }).subscribe(changes => {
      this.wanFormChanges = changes;
      this._groupChangesByWanForm(changes);
      this.isLoading = false;
    });
  }

  private _groupChangesByWanForm(changes: TenantWanFormChanges): void {
    const groups: { [key: string]: GroupedChange } = {};

    changes.wanFormChanges.forEach(change => {
      const name = change.vrfName;
      if (!groups[name]) {
        groups[name] = {
          wanFormName: name,
          additions: [],
          modifications: [],
          deletions: [],
        };
      }

      // Consolidate added routes
      groups[name].additions.push(...(change.addedInternalRoutes || []), ...(change.addedExternalRoutes || []));

      // Consolidate removed routes
      groups[name].deletions.push(...(change.removedInternalRoutes || []), ...(change.removedExternalRoutes || []));
    });

    this.groupedChanges = Object.values(groups);
  }

  public goBack(): void {
    this.router.navigate(['/adminportal/wan-form-request'], { queryParamsHandling: 'merge' });
  }

  public approveRequest(): void {
    const dto = new YesNoModalDto(
      'Approve WAN Form Request',
      'Are you sure you want to approve this request? It will be applied immediately.',
    );
    const onConfirm = () => {
      this.wanFormRequestService.approveOneWanFormRequest({ id: this.requestId }).subscribe(() => {
        this.router.navigate(['/admin/wan-form-requests']);
      });
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm);
  }

  public rejectRequest(): void {
    const dto = new YesNoModalDto('Reject WAN Form Request', 'Are you sure you want to reject this request? It cannot be undone.');
    const onConfirm = () => {
      this.wanFormRequestService.rejectOneWanFormRequest({ id: this.requestId }).subscribe(() => {
        this.router.navigate(['/admin/wan-form-requests']);
      });
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm);
  }
}
