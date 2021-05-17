import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Message, MessageService } from './message.service';
import { Datacenter, V1DatacentersService } from 'api_client';

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
  private routesNotToRender: string[] = ['/', '/tenant', '/logout', '/unauthorized'];
  private ignoreNextQueryParamEvent: boolean;

  constructor(
    private datacenterService: V1DatacentersService,
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
      if (this.ignoreNextQueryParamEvent) {
        this.ignoreNextQueryParamEvent = false;
        return;
      }
      const fetch = !this.routesNotToRender.some(route => route === this.router.url);

      if (fetch) {
        this.getDatacenters(queryParams.get('datacenter'));
      }
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
    this.datacenterService.v1DatacentersGet({ join: 'tiers' }).subscribe(data => {
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

  // Refreshes datacenters and current datacenter subject from API
  public refreshDatacenter() {
    const currentDatacenterId = this.currentDatacenterValue.id;
    this.datacenterService.v1DatacentersGet({ join: 'tiers' }).subscribe(data => {
      // Update internal datacenters array and external subject.
      this._datacenters = data;
      this.datacentersSubject.next(data);

      const datacenter = this._datacenters.find(dc => dc.id === currentDatacenterId);

      this.currentDatacenterSubject.next(datacenter);
    });
  }

  public switchDatacenter(datacenterId: string): boolean {
    if (this.lockCurrentDatacenterSubject.value) {
      this.messageService.sendMessage(new Message(null, null, 'Current datacenter locked'));
      return false;
    }

    const datacenter = this._datacenters.find(dc => dc.id === datacenterId);
    if (!datacenter) {
      return false;
    }

    const isSameDatacenter = this.currentDatacenterValue && datacenter.id === this.currentDatacenterValue.id;
    if (isSameDatacenter) {
      this.messageService.sendMessage(new Message(null, null, 'Datacenter already selected'));
      return false;
    }

    const oldDatacenterId = this.currentDatacenterValue ? this.currentDatacenterValue.id : null;

    this.currentDatacenterSubject.next(datacenter);
    this.ignoreNextQueryParamEvent = true;
    this.router.navigate([], {
      queryParams: { datacenter: datacenter.id },
      queryParamsHandling: 'merge',
    });

    this.messageService.sendMessage(new Message(oldDatacenterId, datacenterId, 'Datacenter switched'));
    return true;
  }
}
