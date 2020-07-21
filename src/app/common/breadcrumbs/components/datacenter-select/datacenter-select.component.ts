import { Component, OnInit, OnDestroy } from '@angular/core';
import { Datacenter } from 'api_client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import SubscriptionUtil from 'src/app/utils/subscription.util';

@Component({
  selector: 'app-datacenter-select',
  templateUrl: './datacenter-select.component.html',
  styleUrls: ['./datacenter-select.component.css'],
})
export class DatacenterSelectComponent implements OnInit, OnDestroy {
  datacenters: Datacenter[];
  currentDatacenter: Datacenter;
  selectedDatacenter: Datacenter;
  lockCurrentDatacenter: boolean;
  datacentersSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  datacenterLockSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private ngx: NgxSmartModalService,
    private toastrService: ToastrService,
  ) {}

  public openDatacenterSwitchModal(): void {
    this.ngx.getModal('datacenterSwitchModal').open();
  }

  public switchDatacenter(): void {
    try {
      this.datacenterContextService.switchDatacenter(this.selectedDatacenter.id);
      this.toastrService.success('Datacenter Switched');
    } catch (error) {
      this.toastrService.error(error);
    }
  }

  ngOnInit() {
    this.datacentersSubscription = this.datacenterContextService.datacenters.subscribe(datacenters => (this.datacenters = datacenters));

    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      currentDatacenter => (this.currentDatacenter = currentDatacenter),
    );

    this.datacenterLockSubscription = this.datacenterContextService.lockCurrentDatacenter.subscribe(
      lockCurrentDatacenter => (this.lockCurrentDatacenter = lockCurrentDatacenter),
    );
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.datacentersSubscription, this.currentDatacenterSubscription, this.datacenterLockSubscription]);
  }
}
