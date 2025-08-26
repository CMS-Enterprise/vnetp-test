import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tenant-v2-navbar',
  templateUrl: './tenant-v2-navbar.component.html',
  styleUrls: ['./tenant-v2-navbar.component.scss'],
})
export class TenantV2NavbarComponent implements OnInit {
  public user: any;
  public tenant: string;
  public userRoles: string[];
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;

  constructor(private modalService: NgxSmartModalService, private auth: AuthService) {}

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
    this.modalService.open('logoutModal');
  }

  public logout(): void {
    this.auth.logout();
  }
}
