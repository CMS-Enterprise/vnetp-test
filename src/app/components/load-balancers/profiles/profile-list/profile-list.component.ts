import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerProfile, Tier, V1LoadBalancerProfilesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ProfileModalDto } from '../profile-modal/profile-modal.dto';

export interface ProfileView extends LoadBalancerProfile {
  nameView: string;
  state: string;
  reverseProxyView: string;
}

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
})
export class ProfileListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<ProfileView> = {
    description: 'Profiles in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'Type', property: 'type' },
      { name: 'Reverse Proxy', property: 'reverseProxyView' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public profiles: ProfileView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private profileChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private profilesService: V1LoadBalancerProfilesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.profileChanges = this.subscribeToProfileModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.profileChanges, this.dataChanges]);
  }

  public delete(profile: ProfileView): void {
    this.entityService.deleteEntity(profile, {
      entityName: 'Profile',
      delete$: this.profilesService.deleteOneLoadBalancerProfile({ id: profile.id }),
      softDelete$: this.profilesService.softDeleteOneLoadBalancerProfile({ id: profile.id }),
      onSuccess: () => this.loadProfiles(),
    });
  }

  public loadProfiles(): void {
    this.isLoading = true;
    this.profilesService
      .getManyLoadBalancerProfile({
        filter: [`tierId||eq||${this.currentTier.id}`],
      })
      .subscribe(
        (profiles: unknown) => {
          this.profiles = (profiles as ProfileView[]).map(p => {
            return {
              ...p,
              nameView: p.name.length >= 20 ? p.name.slice(0, 19) + '...' : p.name,
              state: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              reverseProxyView: p.reverseProxy
                ? p.reverseProxy.length >= 20
                  ? p.reverseProxy.slice(0, 19) + '...'
                  : p.reverseProxy
                : undefined,
            };
          });
        },
        () => {
          this.profiles = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(profiles: ImportProfile[]): void {
    const bulk = profiles.map(profile => {
      const { vrfName } = profile;
      if (!vrfName) {
        return profile;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...profile,
        tierId,
      };
    });

    this.profilesService
      .createManyLoadBalancerProfile({
        createManyLoadBalancerProfileDto: { bulk },
      })
      .subscribe(() => this.loadProfiles());
  }

  public openModal(profile?: ProfileView): void {
    const dto: ProfileModalDto = {
      tierId: this.currentTier.id,
      profile,
    };
    this.ngx.setModalData(dto, 'profileModal');
    this.ngx.open('profileModal');
  }

  public restore(profile: ProfileView): void {
    if (!profile.deletedAt) {
      return;
    }
    this.profilesService.restoreOneLoadBalancerProfile({ id: profile.id }).subscribe(() => this.loadProfiles());
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.tiers = datacenter.tiers;
      this.loadProfiles();
    });
  }

  private subscribeToProfileModal(): Subscription {
    return this.ngx.getModal('profileModal').onCloseFinished.subscribe(() => {
      this.loadProfiles();
      this.ngx.resetModalData('profileModal');
    });
  }
}

export interface ImportProfile extends LoadBalancerProfile {
  vrfName?: string;
}
