import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto, UserPass } from '../../../api_client/model/models';

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

    if (user) {
      // Since we aren't storing the tenant in local storage,
      // it will be null on bootstrap. If the user is not
      // null, set the tenant to a generic value.
      this.currentTenantSubject.next('tenant');
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
      .pipe(
        map(tenants => {
          return tenants;
        }),
      );
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
    if (keepReturnUrl) {
      location.reload();
    } else {
      location.href = '/login';
    }
  }
}
