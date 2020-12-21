import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, Type, ViewChild } from '@angular/core';
import { LoadBalancerProfile, Tier, V1LoadBalancerProfilesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ProfileModalDto } from '../profile-modal/profile-modal.dto';

interface ProfileView extends LoadBalancerProfile {
  provisionedState: string;
}

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
})
export class ProfileListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<ProfileView> = {
    description: 'Profiles in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Reverse Proxy', property: 'reverseProxy' },
      { name: 'Provisioned', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public profiles: ProfileView[] = [];
  public isLoading = false;

  private profileChanges: Subscription;

  constructor(
    private entityService: EntityService,
    private profilesService: V1LoadBalancerProfilesService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit() {
    this.loadProfiles();
  }

  ngAfterViewInit() {
    this.profileChanges = this.subscribeToProfileModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.profileChanges]);
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
              provisionedState: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              reverseProxy: p.reverseProxy || '--',
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
    this.ngx.getModal('profileModal').open();
  }

  public restore(profile: ProfileView): void {
    if (!profile.deletedAt) {
      return;
    }
    this.profilesService.v1LoadBalancerProfilesIdRestorePatch({ id: profile.id }).subscribe(() => this.loadProfiles());
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
