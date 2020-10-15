import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { V1DatacentersService, Tier } from 'api_client';
import { User } from 'src/app/models/user/user';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-tier-select',
  templateUrl: './tier-select.component.html',
})
export class TierSelectComponent implements OnInit, OnDestroy {
  public currentTier: Tier;
  public currentUser: User;
  public datacenterId: string;
  public selectedTier: string;
  public tiers: Tier[] = [];

  private currentDatacenterSubscription: Subscription;
  private currentUserSubscription: Subscription;
  private currentTierSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private tierContextService: TierContextService,
    private toastrService: ToastrService,
    private ngx: NgxSmartModalService,
  ) {}

  public openTierModal(): void {
    this.ngx.getModal('tierSwitchModal').open();
  }

  public getTiers(): void {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'tiers',
      })
      .subscribe(data => {
        this.tiers = data.tiers.filter(t => !t.deletedAt);
      });
  }

  public switchTier(): void {
    try {
      this.tierContextService.switchTier(this.selectedTier);
      this.toastrService.success('Tier Switched');
    } catch (error) {
      this.toastrService.error(error);
    }
  }

  ngOnInit() {
    this.currentUserSubscription = this.auth.currentUser.subscribe(u => (this.currentUser = u));

    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getTiers();
      }
    });

    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => (this.currentTier = ct));
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription, this.currentUserSubscription, this.currentTierSubscription]);
  }
}
