/* eslint-disable */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserPass } from 'client/model/userPass';
import { TenantName } from '../../models/other/tenant-name';
import { environment } from 'src/environments/environment';

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

  availableLocations: string[] = [];
  selectedLocation: string;
  lockLocation = false;
  showLogin = false;
  disableUserPass = true;
  showTenantButton = false;
  showAdminPortalButton = false;
  globalOnlyUser = false;

  selectedMode = 'netcentric';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit() {
    environment.dynamic.dcsLocations.map(location => {
      this.availableLocations.push(location.name);
    });
    const currentUrl = location.href;
    environment.dynamic.dcsLocations.map(location => {
      if (currentUrl.includes(location.url.toLowerCase())) {
        this.showLogin = true;
        this.selectedLocation = location.name;
      }
    });
    if (this.selectedLocation) {
      this.showLogin = true;
      this.disableUserPass = false;
    } else {
      this.disableUserPass = true;
    }

    // this.returnUrl = '/appcentric/dashboard';

    if (this.route.snapshot.queryParams.returnUrl) {
      this.returnUrl = decodeURIComponent(this.route.snapshot.queryParams.returnUrl);
    }

    if (!this.authService.currentUser) {
      this.authService.logout();
    }

    // Attempt to extract the tenant parameter from the return URL.
    const tenantRegex = /tenant=([a-z0-9_-]*)/g;
    const tenantExec = tenantRegex.exec(this.returnUrl);

    if (tenantExec) {
      this.selectedTenant = this.oldTenant = tenantExec[1];
    }
  }

  navToLocation() {
    const match = environment.dynamic.dcsLocations.find(location => location.name === this.selectedLocation);
    if (match) {
      const currentURL = location.href;
      if (!currentURL.includes(match.url)) {
        location.href = match.url;
      }
    }
    if (this.userpass) {
      this.disableUserPass = false;
      return this.login();
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
                if (userTenants.some(t => t === '*')) {
                  // If the user has an "*"" that means they have access to all available tenants.
                  this.availableTenants = currentTenants;
                  const roles = data.dcsPermissions[0].roles;

                  roles.some(role => {
                    // if user is a global admin user we show the admin portal navigation button
                    if (role === 'global-admin') {
                      this.showAdminPortalButton = true;
                      this.globalOnlyUser = true;
                    }
                  });
                } else {
                  // If the user is not a global admin, filter current tenats based on their tenants.
                  this.availableTenants = currentTenants.filter(ct => userTenants.find(ut => ct.tenant === ut));
                }
                const roles = data.dcsPermissions[0].roles;

                this.showTenantButton = true;
              },
              () => {
                this.toastr.error('Error getting tenants');
                this.errorMessage = 'Error getting tenants';
                this.loading = false;
              },
            );
        },
        () => {
          this.toastr.error('Invalid Username/Password');
          this.errorMessage = 'Invalid Username/Password';
          this.loading = false;
        },
      );
  }

  setTenantAndNavigate(tenant, mode) {
    if (!tenant || !tenant.tenantQueryParameter) {
      this.toastr.error('Invalid tenant configuration');
      return;
    }

    const { tenantQueryParameter } = tenant;
    mode = mode.toLowerCase();
    this.toastr.success(`Welcome ${this.userpass.username}!`);
    this.authService.currentTenantValue = tenantQueryParameter;
    // if the user had a session expire, and they can choose from multiple tenants,
    // we pre-select their old tenant for them above if they stay with that same tenant,
    // we will apply the returnURL from that session, to redirect them back to whatever
    // page they were on after login if they choose a different tenant, we redirect them
    // to the dashboard after they login
    if (tenantQueryParameter !== this.oldTenant) {
      this.returnUrl = `/${mode}/dashboard`;
    }
    // if the returnUrl is /dashboard then we assume the user is starting a brand new session
    // when they login we allow them to select a tenant and then they are brought to the dashboard
    if (this.returnUrl === `/${mode}/dashboard`) {
      localStorage.setItem('tenantQueryParam', JSON.stringify(tenantQueryParameter));
      this.router.navigate([this.returnUrl], {
        queryParams: { tenant: tenantQueryParameter },
      });
    } else {
      localStorage.setItem('tenantQueryParam', JSON.stringify(tenantQueryParameter));
      // else, if the returnURL is more than just /dashboard we can assume the user came from a
      // previous session when they login, currently we still allow them to select tenant (being taken out)
      // and then we navigate them to the returnURL, however the selected tenant is overwritten by what is
      // in the returnURL
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  navToAdminPortal(tenant) {
    if (!tenant || !tenant.tenantQueryParameter) {
      this.toastr.error('Invalid tenant configuration');
      return;
    }

    const { tenantQueryParameter } = tenant;
    this.authService.currentTenantValue = tenantQueryParameter;
    localStorage.setItem('tenantQueryParam', JSON.stringify(tenantQueryParameter));

    this.router.navigate(['adminportal/dashboard'], { queryParams: { tenant: tenantQueryParameter } });
  }
}
