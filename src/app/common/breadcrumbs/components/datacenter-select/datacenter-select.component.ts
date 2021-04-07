import { Component, OnInit, OnDestroy } from '@angular/core';
import { Datacenter } from 'api_client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

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

  private currentDatacenterSubscription: Subscription;
  private datacenterLockSubscription: Subscription;
  private datacentersSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private ngx: NgxSmartModalService,
    private toastrService: ToastrService,
  ) {}

  public openDatacenterSwitchModal(): void {
    this.ngx.getModal('datacenterSwitchModal').open();
  }

  public switchDatacenter(): void {
    const isSwitched = this.datacenterContextService.switchDatacenter(this.selectedDatacenter.id);
    if (isSwitched) {
      this.toastrService.success('Datacenter switched');
    } else {
      this.toastrService.error('Unable to switch datacenter');
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
