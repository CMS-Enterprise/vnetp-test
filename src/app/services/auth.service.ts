import { Injectable } from '@angular/core';
// import { User } from '../models/user/user';
// import { Userpass } from '../models/user/userpass';
// import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
// import { CookieService } from 'ngx-cookie-service';
// import { JwtHelperService } from '@auth0/angular-jwt';
import { UserManager, UserManagerSettings, User } from 'oidc-client';
import * as Oidc from 'oidc-client';

function getClientSettings(): UserManagerSettings {
  // TODO: use environment.openId
  return {
    authority: 'https://10.151.20.115/cfs/oauth/draas',
    client_id: 'IS12GPO6IWGJ8e7Ocjbo0z',
    client_secret: 'r0Tjc0OZ7O6Oem4Biw9ZGulD0mY3xzzBD9Q6wuJ4jlgMft',
    redirect_uri: 'http://localhost:4200/callback',
    post_logout_redirect_uri: 'http://localhost:4200/',
    response_type: 'code',
    // response_mode: 'fragment',
    scope: 'openid profile',
    metadata: {
      issuer: 'https://10.151.20.115/cfs/oauth/draas',
      // jwks_uri: 'https://10.151.20.115/cfs/oauth/draas/.well-known/certs',
      authorization_endpoint: 'https://10.151.20.115/cfs/oauth/draas/authorize',
      userinfo_endpoint: 'https://10.151.20.115/cfs/oauth/draas/userinfo',
    },
  };
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private manager = new UserManager(getClientSettings());
  private user: User = null;

  constructor() {
    Oidc.Log.logger = console;
    this.manager.getUser().then(user => {
      this.user = user;
    });
  }

  isLoggedIn(): boolean {
    return this.user != null && !this.user.expired;
  }

  getClaims(): any {
    return this.user.profile;
  }

  getAuthorizationHeaderValue(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  completeAuthentication(): Promise<void> {
    return this.manager.signinRedirectCallback().then(user => {
      this.user = user;
    });
  }

  // private currentUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  // public currentUser: Observable<User> = this.currentUserSubject.asObservable();

  // constructor(private http: HttpClient, private cs: CookieService) {
  //   const user = this.getUserFromToken(localStorage.getItem('token'));
  //   this.currentUserSubject.next(user);
  // }

  // public get currentUserValue(): User {
  //   return this.currentUserSubject.value;
  // }

  // login(userpass: Userpass) {
  //   return this.http
  //     .post<any>(environment.apiBase + '/v1/auth/login', {
  //       username: userpass.Username,
  //       password: userpass.Password,
  //     })
  //     .pipe(
  //       map(result => {
  //         const user = this.getUserFromToken(result.token);

  //         if (user && user.Token) {
  //           localStorage.setItem('token', result.token);
  //           this.currentUserSubject.next(user);
  //         }

  //         return user;
  //       }),
  //     );
  // }

  // logout() {
  //   localStorage.clear();
  //   this.cs.deleteAll('/ ', window.location.hostname);
  //   this.currentUserSubject.next(null);
  //   location.reload();
  // }

  // getUserFromToken(jwtEncoded: string): User {
  //   try {
  //     if (!jwtEncoded) {
  //       return null;
  //     }

  //     const jwtHelper = new JwtHelperService();

  //     const jwtDecoded = jwtHelper.decodeToken(jwtEncoded);

  //     if (!jwtDecoded || !jwtDecoded.username || !jwtDecoded.email) {
  //       console.error('Invalid Token');
  //       return null;
  //     }

  //     const user = new User();

  //     user.Username = jwtDecoded.username;
  //     user.Email = jwtDecoded.Email;
  //     user.Roles = jwtDecoded.Roles;
  //     user.Token = jwtEncoded;
  //     return user;
  //   } catch (exception) {
  //     console.error(exception);
  //     return null;
  //   }
  // }
}
