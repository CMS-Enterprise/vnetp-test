import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { V1DatacentersService, Tier } from 'api_client';
import { User } from 'src/app/models/user/user';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-tier-select',
  templateUrl: './tier-select.component.html',
  styleUrls: ['./tier-select.component.css'],
})
export class TierSelectComponent implements OnInit, OnDestroy {
  tiers: Array<Tier>;
  selectedTier: string;
  currentTier: Tier;
  datacenterId: string;
  currentDatacenterSubscription: Subscription;
  currentUserSubscription: Subscription;
  currentTierSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private datacenterContextService: DatacenterContextService,
    private datacenterService: V1DatacentersService,
    private tierContextService: TierContextService,
    private toastrService: ToastrService,
    private ngx: NgxSmartModalService, // used in html
  ) {}

  currentUser: User;

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
    [this.currentDatacenterSubscription, this.currentUserSubscription, this.currentTierSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
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
    this.unsubAll();
  }
}
