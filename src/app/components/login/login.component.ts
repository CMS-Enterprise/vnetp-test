import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserPass } from 'client/model/userPass';
import { environment } from 'src/environments/environment';
import { TenantName } from '../../models/other/tenant-name';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  userpass = {} as UserPass;
  errorMessage: string;
  returnUrl: string;
  loading: boolean;
  tenantSelect: boolean;
  availableTenants: Array<TenantName>;
  selectedTenant: string;
  oldTenant: string;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit() {
    this.returnUrl = '/dashboard';

    if (this.route.snapshot.queryParams.returnUrl) {
      this.returnUrl = decodeURIComponent(this.route.snapshot.queryParams.returnUrl);
    }

    if (!this.authService.currentUser) {
      this.authService.logout();
    } else {
      // If the user is logged in, navigate them to the Return URL.
      this.router.navigateByUrl(this.returnUrl);
    }

    // Attempt to extract the tenant parameter from the return URL.
    const tenantRegex = /tenant=([a-z_]*)/g;
    const tenantExec = tenantRegex.exec(this.returnUrl);

    if (tenantExec) {
      this.selectedTenant = this.oldTenant = tenantExec[1];
    }
  }

  login() {
    if (!this.userpass.username || !this.userpass.password) {
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    this.authService
      .login(this.userpass)
      .pipe(first())
      .subscribe(
        data => {
          const userTenants = data.dcsPermissions.map(p => p.tenant);
          // Read Tenants from Environment Config.
          this.authService
            .getTenants(data.token)
            .pipe(first())
            .subscribe(
              tenantData => {
                const currentTenants = tenantData;
                // If the user doesn't have global access and only has one Tenant
                if (!userTenants.some(t => t === '*') && currentTenants.length === 1) {
                  this.setTenantAndNavigate(currentTenants[0].tenantQueryParameter);
                } else {
                  if (userTenants.some(t => t === '*')) {
                    // If the user is a global admin, they have access to all available tenants.
                    this.availableTenants = currentTenants;
                  } else {
                    // If the user is not a global admin, filter current tenats based on their tenants.
                    this.availableTenants = currentTenants.filter(ct => userTenants.find(ut => ct.db_name === ut));
                  }

                  this.tenantSelect = true;
                }
              },
              error => {
                this.toastr.error('Error getting tenants');
                this.errorMessage = 'Error getting tenants';
                this.loading = false;
              },
            );
        },
        error => {
          this.toastr.error('Invalid Username/Password');
          this.errorMessage = 'Invalid Username/Password';
          this.loading = false;
        },
      );
  }

  setTenantAndNavigate(tenant: string) {
    this.toastr.success(`Welcome ${this.userpass.username}!`);
    this.authService.currentTenantValue = tenant;
    // if the user had a session expire, and they can choose from multiple tenants,
    // we pre-select their old tenant for them above if they stay with that same tenant,
    // we will apply the returnURL from that session, to redirect them back to whatever
    // page they were on after login if they choose a different tenant, we redirect them
    // to the dashboard after they login
    if (tenant !== this.oldTenant) {
      this.returnUrl = '/dashboard';
    }
    // if the returnUrl is /dashboard then we assume the user is starting a brand new session
    // when they login we allow them to select a tenant and then they are brought to the dashboard
    if (this.returnUrl === '/dashboard') {
      localStorage.setItem('tenantQueryParam', JSON.stringify(tenant));
      this.router.navigate([this.returnUrl], {
        queryParams: { tenant },
      });
    } else {
      localStorage.setItem('tenantQueryParam', JSON.stringify(tenant));
      // else, if the returnURL is more than just /dashboard we can assume the user came from a
      // previous session when they login, currently we still allow them to select tenant (being taken out)
      // and then we navigate them to the returnURL, however the selected tenant is overwritten by what is
      // in the returnURL
      this.router.navigateByUrl(this.returnUrl);
    }
  }
}
