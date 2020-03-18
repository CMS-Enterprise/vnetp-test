import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { MessageService } from './message.service';
import { AppMessageType } from '../models/app-message-type';
import { AppMessage } from '../models/app-message';
import { Datacenter, V1DatacentersService, Tier } from 'api_client';
import { query } from '@angular/animations';

/** Service to store and expose the Current Datacenter Context. */
@Injectable({
  providedIn: 'root',
})
export class DatacenterContextService {
  private currentDatacenterSubject: BehaviorSubject<Datacenter> = new BehaviorSubject<Datacenter>(null);

  private datacentersSubject: BehaviorSubject<Datacenter[]> = new BehaviorSubject<Datacenter[]>(null);

  private lockCurrentDatacenterSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Current Datacenter Context. */
  public currentDatacenter: Observable<Datacenter> = this.currentDatacenterSubject.asObservable();

  /** Datacenters available within the Tenant. */
  public datacenters: Observable<Datacenter[]> = this.datacentersSubject.asObservable();

  /** Indicates whether the current datacenter
   *  context can be changed.
   */
  public lockCurrentDatacenter: Observable<boolean> = this.lockCurrentDatacenterSubject.asObservable();

  private _datacenters: Datacenter[] = new Array<Datacenter>();
  ignoreNextQueryParamEvent: boolean;

  constructor(
    private authService: AuthService,
    private DatacenterService: V1DatacentersService,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    // This subscription ensures that we release
    // the datacenter change lock when a navigation
    // event occurs. This is useful in the event
    // that the component doesn't release the lock
    // before being destroyed.
    this.router.events.subscribe(e => {
      if (this.lockCurrentDatacenterSubject.value && e instanceof NavigationEnd) {
        this.lockCurrentDatacenterSubject.next(false);
      }
    });

    // Subscribe to the activatedRoute, validate that the
    // datacenter param has a valid id present.
    this.activatedRoute.queryParamMap.subscribe(queryParams => {
      if (!this.authService.currentUserValue) {
        return;
      }

      if (this.ignoreNextQueryParamEvent) {
        this.ignoreNextQueryParamEvent = false;
        return;
      }

      this.getDatacenters(queryParams.get('datacenter'));
    });
  }

  /** Current Datacenter */
  public get currentDatacenterValue(): Datacenter {
    return this.currentDatacenterSubject.value;
  }

  /** Array of Tier Ids in current Datacenter */
  public get currentTiersValue(): Array<string> {
    return this.currentDatacenterSubject.value.tiers.map(tier => tier.id);
  }

  /** Datacenters available within the Tenant. */
  public get datacentersValue(): Datacenter[] {
    return this.datacentersSubject.value;
  }

  /** Current Datacenter Lock State. */
  public get datacenterLockValue(): boolean {
    return this.lockCurrentDatacenterSubject.value;
  }

  /** Locks the currentDatacenter. This prevents the
   * datacenter context switch from occurring.
   */
  public lockDatacenter() {
    this.lockCurrentDatacenterSubject.next(true);
  }

  /** Unlocks the currentDatacenter. This allows the
   * datacenter context switch to occur.
   */
  public unlockDatacenter() {
    this.lockCurrentDatacenterSubject.next(false);
  }

  /** Get datacenters for the tenant.
   * @param datacenterParam Optional currentDatacenterId, this will be compared against the
   * array of datacenters returned from the API. If it is present then that datacenter will be selected.
   */
  private getDatacenters(datacenterParam?: string) {
    this.DatacenterService.v1DatacentersGet({ join: 'tiers' }).subscribe(data => {
      // Update internal datacenters array and external subject.
      this._datacenters = data;
      this.datacentersSubject.next(data);

      // If a datacenter matching currentDatacenterId is present
      // set currentDatacenter to that datacenter.
      if (datacenterParam) {
        this.switchDatacenter(datacenterParam);
      }
    });
  }

  /** Switch from the currentDatacenter to the provided datacenter.
   * @param datacenter Datacenter to switch to.
   */
  public switchDatacenter(datacenterId: string) {
    if (this.lockCurrentDatacenterSubject.value) {
      throw Error('Current Datacenter Locked.');
    }

    // Validate that the datacenter we are switching to is a member
    // of the private datacenters array.
    const datacenter = this._datacenters.find(dc => dc.id === datacenterId);

    if (this.currentDatacenterValue && datacenter.id === this.currentDatacenterValue.id) {
      throw Error('Datacenter already Selected.');
    }

    if (datacenter) {
      // Update Subject
      this.currentDatacenterSubject.next(datacenter);

      this.ignoreNextQueryParamEvent = true;

      // Update Query Params
      this.router.navigate([], {
        queryParams: { datacenter: datacenter.id },
        queryParamsHandling: 'merge',
      });

      // Send Context Switch Message
      this.messageService.sendMessage(new AppMessage(`Datacenter Context Switch ${datacenterId}`, AppMessageType.DatacenterContextSwitch));
    }
  }
}
