import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
})
export class TenantComponent implements OnInit {
  public currentTenants = environment.environment.oidc_current_tenants;

  constructor(private authService: AuthService, private router: Router, public toastrService: ToastrService) {}

  ngOnInit() {
    // this.authService.getCurrentUserValue();
  }

  selectTenant(tenant: string) {
    // try {
    //   this.router.navigate(['/dashboard'], {
    //     queryParams: { tenant },
    //     queryParamsHandling: 'merge',
    //   });
    //   this.toastrService.success('Tenant Selected');
    // } catch (error) {
    //   this.toastrService.error(error);
    // }
  }
}
