import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerProfile, Tier, V1LoadBalancerProfilesService } from 'api_client';
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
      { name: 'Name', property: 'name' },
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
      delete$: this.profilesService.v1LoadBalancerProfilesIdDelete({ id: profile.id }),
      softDelete$: this.profilesService.v1LoadBalancerProfilesIdSoftDelete({ id: profile.id }),
      onSuccess: () => this.loadProfiles(),
    });
  }

  public loadProfiles(): void {
    this.isLoading = true;
    this.profilesService
      .v1LoadBalancerProfilesGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        profiles => {
          this.profiles = profiles.map(p => {
            return {
              ...p,
              state: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              reverseProxyView: p.reverseProxy || '--',
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
      .v1LoadBalancerProfilesBulkPost({
        generatedLoadBalancerProfileBulkDto: { bulk },
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
    this.profilesService.v1LoadBalancerProfilesIdRestorePatch({ id: profile.id }).subscribe(() => this.loadProfiles());
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
