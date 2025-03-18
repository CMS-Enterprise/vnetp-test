import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-tenant-v2-navbar',
  templateUrl: './tenant-v2-navbar.component.html',
  styleUrls: ['./tenant-v2-navbar.component.scss'],
})
export class TenantV2NavbarComponent implements OnInit {
  public user: any;
  public tenant: string;
  public userRoles: string[];

  constructor(private modalService: NgxSmartModalService) {}

  ngOnInit(): void {
    // TODO: Implement user and tenant data fetching
    this.user = {
      uid: 'testuser',
      cn: 'Test User',
    };
    this.tenant = 'Test Tenant';
    this.userRoles = ['admin'];
  }

  public openLogoutModal(): void {
    this.modalService.open('logoutModal');
  }

  public logout(): void {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  }
}
