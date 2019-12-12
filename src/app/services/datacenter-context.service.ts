import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Datacenter } from 'model/datacenter';
import { Router, NavigationEnd } from '@angular/router';
import { DatacentersService } from 'api/datacenters.service';
import { AuthService } from './auth.service';
import { MessageService } from './message.service';
import { AppMessageType } from '../models/app-message-type';
import { AppMessage } from '../models/app-message';

/** Service to store and expose the Current Datacenter Context. */
@Injectable({
  providedIn: 'root',
})
export class DatacenterContextService {
  private currentDatacenterSubject: BehaviorSubject<
    Datacenter
  > = new BehaviorSubject<Datacenter>(null);

  private datacentersSubject: BehaviorSubject<
    Datacenter[]
  > = new BehaviorSubject<Datacenter[]>(null);

  private lockCurrentDatacenterSubject: BehaviorSubject<
    boolean
  > = new BehaviorSubject<boolean>(false);

  /** Current Datacenter Context. */
  public currentDatacenter: Observable<
    Datacenter
  > = this.currentDatacenterSubject.asObservable();

  /** Datacenters available within the Tenant. */
  public datacenters: Observable<
    Datacenter[]
  > = this.datacentersSubject.asObservable();

  /** Indicates whether the current datacenter
   *  context can be changed.
   */
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
    const selectedDatacenterId = localStorage.getItem('currentDatacenter');
    // Get datacenters when currentUser changes.
    this.authService.currentUser.subscribe(s => {
      this.getDatacenters(selectedDatacenterId);
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

  /** Current Datacenter */
  public get currentDatacenterValue(): Datacenter {
    return this.currentDatacenterSubject.value;
  }

  /** Datacenters available within the Tenant. */
  public get datacentersValue(): Datacenter[] {
    return this.datacentersSubject.value;
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
   * @param currentDatacenterId Optional currentDatacenterId, this will be compared against the
   * array of datacenters returned from the API. If it is present then that datacenter will be selected.
   */
  private getDatacenters(currentDatacenterId?: string) {
    this.DatacenterService.datacentersGet(
      undefined,
      undefined,
      undefined,
      undefined,
      'tiers',
    ).subscribe(data => {
      this._datacenters = data;

      // Update the datacenters subject.
      this.datacentersSubject.next(data);

      if (data.length) {
        let datacenter;

        // If a datacenter matching currentDatacenterId is present
        // set currentDatacenter to that datacenter. Otherwise choose
        // the first datacenter returned.
        if (currentDatacenterId) {
          datacenter = data.find(d => d.id === currentDatacenterId);
        }

        if (datacenter) {
          this.currentDatacenterSubject.next(datacenter);
        } else {
          this.currentDatacenterSubject.next(data[0]);
        }
      }
    });
  }

  /** Switch from the currentDatacenter to the provided datacenter.
   * @param datacenter Datacenter to switch to.
   */
  public switchDatacenter(datacenter: Datacenter) {
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
      localStorage.setItem('currentDatacenter', datacenter.id);
    }
  }
}
