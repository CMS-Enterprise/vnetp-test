import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto, UserPass } from '../../../client/model/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserDto> = new BehaviorSubject<UserDto>(null);
  public currentUser: Observable<UserDto> = this.currentUserSubject.asObservable();

  private currentTenantSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public currentTenant: Observable<string> = this.currentTenantSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = JSON.parse(localStorage.getItem('user'));
    const tenantQueryParam = JSON.parse(localStorage.getItem('tenantQueryParam'));

    if (user && tenantQueryParam) {
      // Since we aren't storing the tenant in local storage,
      // it will be null on bootstrap. If the user is not
      // null, set the tenant to a generic value.
      this.currentTenantSubject.next(tenantQueryParam);
    }
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): UserDto {
    return this.currentUserSubject.value;
  }

  public get currentTenantValue(): string {
    return this.currentTenantSubject.value;
  }

  public set currentTenantValue(tenant: string) {
    this.currentTenantSubject.next(tenant);
  }

  public isGlobalAdmin(user: UserDto): boolean {
    return user.dcsPermissions.some((permission: any) => permission.roles.some((role: string) => role === 'global-admin'));
  }

  getTenants(token: string) {
    return this.http
      .get<any>(environment.apiBase + '/v1/auth/tenants', {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(map(tenants => tenants));
  }

  login(userpass: UserPass) {
    return this.http
      .post<any>(environment.apiBase + '/v1/auth/token', {
        username: userpass.username,
        password: userpass.password,
      })
      .pipe(
        map(result => {
          const user = result as UserDto;

          if (user && user.token) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
          return user;
        }),
      );
  }

  // if the user token is invalid we will send a boolean variable to this logout function
  // if the variable is evaluated to be true then we reload the browser which keeps the returnURL in the /login URL
  // if there is passed in no variable or it is false, we redirect the user the the clean /login page
  logout(keepReturnUrl?: boolean) {
    console.log('logout', keepReturnUrl);
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.currentTenantSubject.next(null);
    if (keepReturnUrl) {
      location.reload();
    } else {
      location.href = '/login';
    }
  }
}

// auth.service.ts:75 ERROR TypeError: Cannot read properties of null (reading 'dcsPermissions')
// at Object.next (src_app_components_dashboard_dashboard_module_ts.js:125:36)
// at ConsumerObserver.next (vendor.js:15976:25)
// at SafeSubscriber._next (vendor.js:15945:22)
// at SafeSubscriber.next (vendor.js:15918:12)
// at vendor.js:15755:20
// at errorContext (vendor.js:18130:5)
// at BehaviorSubject.next (vendor.js:15748:69)
// at BehaviorSubject.next (vendor.js:15561:11)
// at AuthService.logout (main.js:28528:29)
// at NavbarComponent.logout (main.js:27827:15)
