import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManager, User, WebStorageStateStore, Log } from 'oidc-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private manager = new UserManager(environment.openId);
  private user: User = null;

  constructor() {
    Log.logger = console;
    Log.level = Log.DEBUG;
    console.log(environment.openId);
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

  async completeAuthentication(): Promise<void> {
    try {
      const user = await this.manager.signinRedirectCallback();
      this.user = user;
    } catch (err) {
      console.log(err);
    }
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
