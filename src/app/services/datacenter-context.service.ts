import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Datacenter } from 'model/datacenter';
import { Data, Router, NavigationEnd } from '@angular/router';
import { DatacentersService } from 'api/datacenters.service';
import { AuthService } from './auth.service';
import { MessageService } from './message.service';
import { AppMessageType } from '../models/app-message-type';
import { AppMessage } from '../models/app-message';

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

  private lockCurrentDatacenterSubject: BehaviorSubject<
    boolean
  > = new BehaviorSubject<boolean>(false);

  public lockCurrentDatacenter: Observable<
    boolean
  > = this.lockCurrentDatacenterSubject.asObservable();

  private _datacenters: Datacenter[] = new Array<Datacenter>();

  constructor(
    private authService: AuthService,
    private DatacenterService: DatacentersService,
    private messageService: MessageService,
    private router: Router,
  ) {
    // Get datacenters when currentUser changes.
    this.authService.currentUser.subscribe(s => {
      this.getDatacenters();
    });

    // This subscription ensures that we release
    // the datacenter change lock when a navigation
    // event occurs. This is useful in the event
    // that the component doesn't release the lock
    // before being destroyed.
    this.router.events.subscribe(e => {
      if (
        this.lockCurrentDatacenterSubject.value &&
        e instanceof NavigationEnd
      ) {
        this.lockCurrentDatacenterSubject.next(false);
      }
    });
  }

  public get currentDatacenterValue(): Datacenter {
    return this.currentDatacenterSubject.value;
  }

  public get datacentersValue(): Datacenter[] {
    return this.datacentersSubject.value;
  }

  public lockDatacenter() {
    this.lockCurrentDatacenterSubject.next(true);
  }

  public unlockDatacenter() {
    this.lockCurrentDatacenterSubject.next(false);
  }

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
    // Validate that the datacenter we are switching to is a member
    // of the private datacenters array.
    if (
      !this.lockCurrentDatacenterSubject.value &&
      this._datacenters.map(d => d.id).includes(datacenter.id)
    ) {
      this.currentDatacenterSubject.next(datacenter);
      this.messageService.sendMessage(
        new AppMessage(
          'Datacenter Context Switch',
          AppMessageType.DatacenterContextSwitch,
        ),
      );
    }
  }
}
