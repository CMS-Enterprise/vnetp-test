import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-tenant-v2-navbar',
  templateUrl: './tenant-v2-navbar.component.html',
  styleUrls: ['./tenant-v2-navbar.component.scss'],
})
export class TenantV2NavbarComponent implements OnInit {
  public user: any;
  public tenant: string;
  public userRoles: string[];

  constructor(private modalService: NgxSmartModalService, private auth: AuthService) {}

  ngOnInit(): void {
    // TODO: Implement user and tenant data fetching
    this.user = {
      uid: 'TODO-user',
      cn: 'TODO User',
    };
    this.tenant = 'Test Tenant';
    this.userRoles = ['admin'];
  }

  public openLogoutModal(): void {
    this.modalService.open('logoutModal');
  }

  public logout(): void {
    this.auth.logout();
  }
}
