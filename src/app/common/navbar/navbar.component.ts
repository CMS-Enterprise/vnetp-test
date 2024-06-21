import { Component, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Datacenter, Tier, UserDto } from '../../../../client';
import { environment } from 'src/environments/environment';
import { IncidentService } from 'src/app/services/incident.service';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import { TierContextService } from '../../services/tier-context.service';
import { Router } from '@angular/router';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy, DoCheck {
  public user: UserDto;
  public userRoles: string[];
  public tenant: string;
  public tenantAccountNumber: string;
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;
  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  public currentDatacenter: Datacenter;
  public currentTier: Tier;
  public undeployedChangeObjects: any;
  public environment = environment;
  public dcsVersion: string = this.environment?.dynamic?.dcsVersion;
  changeRequest: string;
  lockChangeRequest;

  private changeRequestModalSubscription: Subscription;
  private currentChangeRequestSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private auth: AuthService,
    private datacenterContextService: DatacenterContextService,
    private tierContextService: TierContextService,
    private incidentService: IncidentService,
    private router: Router,
  ) {}

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  ngOnInit(): void {
    this.currentChangeRequestSubscription = this.incidentService.currentIncident.subscribe(inc => {
      if (inc) {
        this.changeRequest = inc;
      } else {
        this.changeRequest = null;
      }
    });
    this.currentTenantSubscription = this.auth.currentTenant.subscribe(tenant => {
      this.tenant = tenant;
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        if (this.user && this.tenant) {
          this.userRoles = this.user.dcsPermissions.find(d => d.tenant === this.tenant || d.tenant === '*').roles;
          // this is a slight trick for the user, if they are a RO user regardless of prefix (network, x86, etc...)
          // show them all dropdown options, they will get denied at the component level
          // this allows for more flexibility of the word "admin" in the HTML with no risk
          if (this.userRoles) {
            const ro = this.userRoles.find(role => {
              if (role.includes('ro')) {
                return true;
              }
            });

            if (ro) {
              this.userRoles = ['admin'];
            }
          }
        }
      });
    });

    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(datacenter => {
      if (datacenter) {
        this.currentDatacenter = datacenter;
        this.currentTierSubscription = this.tierContextService.currentTier.subscribe(tier => {
          if (tier) {
            this.currentTier = tier;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([
      this.currentUserSubscription,
      this.currentTenantSubscription,
      this.currentChangeRequestSubscription,
      this.changeRequestModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }

  public openChangeRequestModal(): void {
    this.subscribeToChangeRequestModal();
    this.ngx.getModal('changeRequestModal').open();
  }

  subscribeToChangeRequestModal(): void {
    try {
      this.changeRequestModalSubscription = this.ngx.getModal('changeRequestModal').onCloseFinished.subscribe(() => {
        this.ngx.resetModalData('changeRequestModal');
        this.changeRequestModalSubscription.unsubscribe();
      });
    } catch (e) {
      console.log('hit catch', e);
    }
  }

  removeChangeRequest(event): void {
    const modalDto = new YesNoModalDto('Remove Change Request', `Are you sure you would like to remove Change Request : "${event}"`);
    const onConfirm = () => {
      this.incidentService.currentIncidentValue = '';
      this.incidentService.removeIncidentNumberLocalStorage();
      this.changeRequest = this.incidentService.getIncidentLocalStorage();
    };

    const onClose = () => {
      console.log('idk');
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  // url check to lock change request modal except for on the dashboard component
  ngDoCheck(): void {
    if (!this.router.url.includes('dashboard')) {
      this.lockChangeRequest = true;
    } else {
      this.lockChangeRequest = false;
    }
  }
}
