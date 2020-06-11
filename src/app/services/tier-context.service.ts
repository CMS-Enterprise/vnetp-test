import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { MessageService } from './message.service';
import { AppMessageType } from '../models/app-message-type';
import { AppMessage } from '../models/app-message';
import { Tier, V1DatacentersService } from 'api_client';
import { DatacenterContextService } from './datacenter-context.service';

/** Service to store and expose the Current Tier Context. */
@Injectable({
  providedIn: 'root',
})
export class TierContextService {
  private currentTierSubject: BehaviorSubject<Tier> = new BehaviorSubject<Tier>(null);

  private tiersSubject: BehaviorSubject<Tier[]> = new BehaviorSubject<Tier[]>(null);

  private lockCurrentTierSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Current Tier Context. */
  public currentTier: Observable<Tier> = this.currentTierSubject.asObservable();

  /** Tiers available within the Tenant. */
  public tiers: Observable<Tier[]> = this.tiersSubject.asObservable();

  /** Indicates whether the current tier
   *  context can be changed.
   */
  public lockCurrentTier: Observable<boolean> = this.lockCurrentTierSubject.asObservable();

  private _tiers: Tier[] = new Array<Tier>();
  ignoreNextQueryParamEvent: boolean;
  currentDatacenterId: string;

  constructor(
    private authService: AuthService,
    private DatacenterService: V1DatacentersService,
    private datacenterContextService: DatacenterContextService,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    // This subscription ensures that we release
    // the tier change lock when a navigation
    // event occurs. This is useful in the event
    // that the component doesn't release the lock
    // before being destroyed.
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.getTiers();
      }
      if (this.lockCurrentTierSubject.value && e instanceof NavigationEnd) {
        this.lockCurrentTierSubject.next(false);
      }
    });

    // Subscribe to the activatedRoute, validate that the
    // tier param has a valid id present.
    this.activatedRoute.queryParamMap.subscribe(queryParams => {
      if (!this.authService.currentUserValue) {
        return;
      }

      if (this.ignoreNextQueryParamEvent) {
        this.ignoreNextQueryParamEvent = false;
        return;
      }

      this.getTiers(queryParams.get('tier'));
    });
  }

  /** Current Tier */
  public get currentTierValue(): Tier {
    return this.currentTierSubject.value;
  }

  /** Tiers available within the Tenant. */
  public get tiersValue(): Tier[] {
    return this.tiersSubject.value;
  }

  /** Current Tier Lock State. */
  public get tierLockValue(): boolean {
    return this.lockCurrentTierSubject.value;
  }

  /** Locks the currentTier. This prevents the
   * tier context switch from occurring.
   */
  public lockTier() {
    this.lockCurrentTierSubject.next(true);
  }

  /** Unlocks the currentTier. This allows the
   * tier context switch to occur.
   */
  public unlockTier() {
    this.lockCurrentTierSubject.next(false);
  }

  /** Get tiers for the tenant.
   * @param datacenterId Currently selected datacenter
   * @param tierParam Optional currentTierId, this will be compared against the
   * array of tiers returned from the API. If it is present then that tier will be selected.
   */
  private getTiers(tierParam?: string) {
    this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenterId = cd.id;
        this.DatacenterService.v1DatacentersIdGet({
          id: this.currentDatacenterId,
          join: 'tiers',
        }).subscribe(data => {
          // Update internal tiers array and external subject.
          this._tiers = data.tiers;
          this.tiersSubject.next(data.tiers);

          // If a tier matching currentTierId is present
          // set currentTier to that tier.
          if (tierParam) {
            this.switchTier(tierParam);
          }
        });
      } else {
        console.log('No Datacenter Selected');
      }
    });
  }

  /** Switch from the currentTier to the provided tier.
   * @param tier Tier to switch to.
   */
  public switchTier(tierId: string) {
    if (this.lockCurrentTierSubject.value) {
      throw Error('Current Tier Locked.');
    }

    // Validate that the tier we are switching to is a member
    // of the private tiers array.
    const tier = this._tiers.find(t => t.id === tierId);

    if (this.currentTierValue && tier.id === this.currentTierValue.id) {
      throw Error('Tier already Selected.');
    }

    if (tier) {
      // Update Subject
      this.currentTierSubject.next(tier);

      this.ignoreNextQueryParamEvent = true;

      // Update Query Params
      this.router.navigate([], {
        queryParams: { tier: tier.id },
        queryParamsHandling: 'merge',
      });

      // Send Context Switch Message
      this.messageService.sendMessage(new AppMessage(`Tier Context Switch ${tierId}`, AppMessageType.TierContextSwitch));
    }
  }
}
