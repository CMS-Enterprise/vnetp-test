import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Datacenter } from 'model/datacenter';
import { Data } from '@angular/router';
import { DatacentersService } from 'api/datacenters.service';

@Injectable({
  providedIn: 'root',
})
export class DatacenterContextService {
  private currentDatacenterSubject: BehaviorSubject<
    Datacenter
  > = new BehaviorSubject<Datacenter>(null);
  public currentDatacenter: Observable<
    Datacenter
  > = this.currentDatacenterSubject.asObservable();

  private datacentersSubject: BehaviorSubject<
    Datacenter[]
  > = new BehaviorSubject<Datacenter[]>(null);
  public datacenters: Observable<
    Datacenter[]
  > = this.datacentersSubject.asObservable();

  private _datacenters: Datacenter[] = new Array<Datacenter>();

  constructor(private DatacenterService: DatacentersService) {}

  getDatacenters() {
    this.DatacenterService.datacentersGet(
      undefined,
      undefined,
      undefined,
      undefined,
      'tiers',
    ).subscribe(data => {
      this._datacenters = data;
      this.datacentersSubject.next(data);

      // TODO: Selected DC could be persisted to local storage.
      if (data.length) {
        this.currentDatacenterSubject.next(data[0]);
      }
    });
  }

  switchDatacenter(datacenter: Datacenter) {
    if (this._datacenters.map(d => d.id).includes(datacenter.id)) {
      this.currentDatacenterSubject.next(datacenter);
    }
  }
}
