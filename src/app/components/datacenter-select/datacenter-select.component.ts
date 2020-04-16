import { Component, OnInit, OnDestroy } from '@angular/core';
import { Datacenter } from 'api_client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';

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
    public ngx: NgxSmartModalService,
    private toastrService: ToastrService,
  ) {}

  switchDatacenter() {
    try {
      this.datacenterContextService.switchDatacenter(this.selectedDatacenter.id);
      this.toastrService.success('Datacenter Switched');
    } catch (error) {
      this.toastrService.error(error);
    }
  }

  filterDatacenters = (datacenter: Datacenter) => {
    if (!this.currentDatacenter) {
      return;
    }
    return datacenter.id !== this.currentDatacenter.id;
    // Using arrow function to pass execution context.
    // tslint:disable-next-line: semicolon
  };

  private unsubAll() {
    [this.datacentersSubscription, this.currentDatacenterSubscription, this.datacenterLockSubscription].forEach(sub => {
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
    this.datacentersSubscription = this.datacenterContextService.datacenters.subscribe(datacenters => (this.datacenters = datacenters));

    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      currentDatacenter => (this.currentDatacenter = currentDatacenter),
    );

    this.datacenterLockSubscription = this.datacenterContextService.lockCurrentDatacenter.subscribe(
      lockCurrentDatacenter => (this.lockCurrentDatacenter = lockCurrentDatacenter),
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
