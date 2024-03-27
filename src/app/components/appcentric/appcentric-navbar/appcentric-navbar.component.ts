import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDto } from 'client/model/userDto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/services/auth.service';
import { IncidentService } from 'src/app/services/incident.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-appcentric-navbar',
  templateUrl: './appcentric-navbar.component.html',
  styleUrls: ['./appcentric-navbar.component.scss'],
})
export class AppcentricNavbarComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];
  public tenant: string;
  public tenantAccountNumber: string;
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;
  private changeRequestModalSubscription: Subscription;
  private currentChangeRequestSubscription: Subscription;
  changeRequest: string;

  constructor(private ngx: NgxSmartModalService, private auth: AuthService, private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.currentChangeRequestSubscription = this.incidentService.currentIncident.subscribe(inc => {
      if (inc) {
        this.changeRequest = inc;
      } else {
        this.changeRequest = 'NO CHANGE REQUEST SELECTED';
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
  }

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([
      this.currentUserSubscription,
      this.currentTenantSubscription,
      this.changeRequestModalSubscription,
      this.currentChangeRequestSubscription,
    ]);
  }

  public openChangeRequestModal(): void {
    this.subscribeToChangeRequestModal();
    this.ngx.getModal('changeRequestModal').open();
  }

  subscribeToChangeRequestModal(): void {
    this.changeRequestModalSubscription = this.ngx.getModal('changeRequestModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('changeRequestModal');
      this.changeRequestModalSubscription.unsubscribe();
    });
  }
}
