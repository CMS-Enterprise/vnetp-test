import { Component, OnInit } from '@angular/core';
import { UserDto } from 'client/model/userDto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-appcentric-navbar',
  templateUrl: './appcentric-navbar.component.html',
  styleUrls: ['./appcentric-navbar.component.scss'],
})
export class AppcentricNavbarComponent implements OnInit {
  public user: UserDto;
  public userRoles: string[];
  public tenant: string;
  public tenantAccountNumber: string;
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private auth: AuthService) {}

  ngOnInit(): void {}

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }
}
