import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto, UserPass } from '../../../client/model/models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserDto> = new BehaviorSubject<UserDto>(null);
  public currentUser: Observable<UserDto> = this.currentUserSubject.asObservable();

  private currentTenantSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public currentTenant: Observable<string> = this.currentTenantSubject.asObservable();

  private getFromLocalStorage<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  constructor(private http: HttpClient, public router: Router) {
    const user = this.getFromLocalStorage<UserDto>('user');
    const tenantQueryParam = this.getFromLocalStorage<string>('tenantQueryParam');

    // get tenantParam from current URL
    const currentURLTenantParam = this.router.getCurrentNavigation()?.finalUrl.queryParams.tenant;
    // this fixes an issue where there can be a mismatch between the tenantQueryParam that is stored in LocalStorage
    // and the currentURLTenantParam

    // we will always want to default to the tenantParam that is in the URL as this is the tenant that will be used in API requests

    // if user and tenantQueryParam are in localStorage, we want to ensure that the currentTenantSubject matches
    // the tenant that is in the tenantParam in the URL
    if (user && tenantQueryParam) {
      // Since we are storing the tenant in local storage,
      // it may need to be evaluated and changed if the local storage tenant is not the tenant in the current URL.
      // If the user is not null, set the tenant to the currentURLTenantParam

      this.currentTenantSubject.next(currentURLTenantParam);
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
