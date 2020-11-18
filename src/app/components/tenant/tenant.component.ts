import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
})
export class TenantComponent implements OnInit {
  // This should be automated to pull tenants from ldap query
  public currentTenants = [
    { name: 'CDS', dbName: 'dcs_cds' },
    { name: 'Leidos', dbName: 'dcs_leidos' },
  ];

  constructor(private authService: AuthService, private router: Router, public toastrService: ToastrService) {}

  ngOnInit() {
    this.authService.completeAuthentication();
  }

  selectTenant(tenant: string) {
    try {
      this.router.navigate(['/dashboard'], {
        queryParams: { tenant: tenant },
        queryParamsHandling: 'merge',
      });
      this.toastrService.success('Tenant Selected');
    } catch (error) {
      this.toastrService.error(error);
    }
  }
}
