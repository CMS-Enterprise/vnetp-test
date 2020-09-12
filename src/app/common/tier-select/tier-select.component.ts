import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { V1DatacentersService, Tier } from 'api_client';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-tier-select',
  templateUrl: './tier-select.component.html',
})
export class TierSelectComponent implements OnInit, OnDestroy {
  tiers: Array<Tier>;
  selectedTier: string;
  currentTier: Tier;
  datacenterId: string;
  currentDatacenterSubscription: Subscription;
  currentTierSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private tierContextService: TierContextService,
    private toastrService: ToastrService,
    private ngx: NgxSmartModalService,
  ) {}

  openTierModal() {
    this.ngx.getModal('tierSwitchModal').open();
  }

  getTiers() {
    this.datacenterService
      .v1DatacentersIdGet({
        id: this.datacenterId,
        join: 'tiers',
      })
      .subscribe(data => {
        this.tiers = data.tiers.filter(t => !t.deletedAt);
      });
  }

  switchTier() {
    try {
      this.tierContextService.switchTier(this.selectedTier);
      this.toastrService.success('Tier Switched');
    } catch (error) {
      this.toastrService.error(error);
    }
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription, this.currentTierSubscription]);
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getTiers();
      }
    });

    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => (this.currentTier = ct));
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
