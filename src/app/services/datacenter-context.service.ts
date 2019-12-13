import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { MessageService } from './message.service';
import { AppMessageType } from '../models/app-message-type';
import { AppMessage } from '../models/app-message';
import { Datacenter, V1DatacentersService } from 'api_client';
import { query } from '@angular/animations';

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
    private DatacenterService: V1DatacentersService,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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

    // Subscribe to the activatedRoute, validate that the
    // datacenter param has a valid id present.
    this.activatedRoute.queryParamMap.subscribe(qp => {
      console.log('qp');
      const datacenterParam = qp.get('datacenter');
      if (datacenterParam) {
        const datacenter = this._datacenters.find(
          dc => dc.id === datacenterParam,
        );
        // If the datacenter isn't present in the current array its possible that it
        // was newly created, refresh the datacenter list and pass the query param value in.
        if (!datacenter) {
          console.log('Invalid Datacenter');
          this.getDatacenters(datacenterParam);
        }
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
    this.DatacenterService.v1DatacentersGet({ join: 'tiers' }).subscribe(
      data => {
        // Update internal datacenters array and external subject.
        this._datacenters = data;
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
            this.switchDatacenter(datacenter.id);
          } else {
            // TODO: Allow user to set a preferred datacenter or persist the one they switched
            // to last in their user entity. That way if a param isn't passed we can send them
            // to where they were last and not to the first dc returned.
            this.switchDatacenter(data[0].id);
          }
        }
      },
    );
  }

  /** Switch from the currentDatacenter to the provided datacenter.
   * @param datacenter Datacenter to switch to.
   */
  public switchDatacenter(datacenterId: string) {
    // Validate that the datacenter we are switching to is a member
    // of the private datacenters array.
    const datacenter = this._datacenters.find(dc => dc.id === datacenterId);

    if (!this.lockCurrentDatacenterSubject.value && datacenter) {
      this.currentDatacenterSubject.next(datacenter);
      this.messageService.sendMessage(
        new AppMessage(
          'Datacenter Context Switch',
          AppMessageType.DatacenterContextSwitch,
        ),
      );
      this.router.navigate([], {
        queryParams: { datacenter: datacenter.id },
        queryParamsHandling: 'merge',
      });
    }
  }
}
