import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDto } from 'client/model/userDto';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { MatDialog } from '@angular/material/dialog';
import { LogoutConfirmationDialogComponent } from './logout-confirmation-dialog/logout-confirmation-dialog.component';

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

  constructor(private dialog: MatDialog, private auth: AuthService) {}

  ngOnInit(): void {
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
    const dialogRef = this.dialog.open(LogoutConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.logout();
      }
    });
  }

  public logout(): void {
    this.auth.logout();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentUserSubscription, this.currentTenantSubscription]);
  }
}
