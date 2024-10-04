import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Tier, V1DatacentersService } from 'client';
import { DatacenterContextService } from './datacenter-context.service';
import * as _ from 'lodash';

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
    private DatacenterService: V1DatacentersService,
    private datacenterContextService: DatacenterContextService,
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
      if (this.ignoreNextQueryParamEvent) {
        this.ignoreNextQueryParamEvent = false;
        return;
      }

      this.getTiers(queryParams.get('tier'));
    });
  }

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

  public lockTier() {
    this.lockCurrentTierSubject.next(true);
  }

  public unlockTier() {
    this.lockCurrentTierSubject.next(false);
  }

  public refreshTiers(currentTierId?: string): void {
    console.log('refreshTiers', currentTierId);
    this.getTiers(currentTierId);
  }

  private getTiers(currentTierId?: string): void {
    this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (!cd) {
        console.debug('DEBUG :: No Datacenter selected');
        return;
      }

      this.currentDatacenterId = cd.id;
      this.DatacenterService.getOneDatacenter({
        id: this.currentDatacenterId,
        join: ['tiers'],
      }).subscribe(data => {
        console.log('getTiers');
        this._tiers = data.tiers;
        console.log('_tiers', this._tiers);
        this.tiersSubject.next(data.tiers);

        // If a tier matching currentTierId is present
        // set currentTier to that tier.
        if (currentTierId) {
          if (this._tiers.some(t => t.id === currentTierId)) {
            console.log('switchTier 1: ', currentTierId);
            this.switchTier(currentTierId);
          } else {
            this.clearTier();
          }
        }
      });
    });
  }

  public switchTier(tierId: string): boolean {
    console.log('switchTier 2');
    if (this.lockCurrentTierSubject.value) {
      console.log('locked true');
      return false;
    }

    const tier = this._tiers.find(t => t.id === tierId);
    console.log('tier subject 1', tier);
    if (!tier) {
      console.log('tier not found');
      this.clearTier();
      return false;
    }

    const isSameTier = this.currentTierValue && tier.id === this.currentTierValue.id;
    const isSameValue = _.isEqual(tier, this.currentTierValue);
    if (isSameTier && isSameValue) {
      console.log('isSameTier');
      return false;
    }
    console.log('tierSubject', tier);
    this.currentTierSubject.next(tier);
    console.log(this.currentTierValue);
    this.ignoreNextQueryParamEvent = true;
    this.router.navigate([], {
      queryParams: { tier: tier.id },
      queryParamsHandling: 'merge',
    });
    return true;
  }

  clearTier() {
    this.currentTierSubject.next(null);
    this.ignoreNextQueryParamEvent = true;
    this.router.navigate([], {
      queryParams: { tier: null },
      queryParamsHandling: 'merge',
    });
  }
}
