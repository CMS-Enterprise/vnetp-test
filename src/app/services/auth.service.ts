import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManager, User, Log } from 'oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private manager = new UserManager(environment.environment.oidc);
  private user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public isLoggedInBool = false;
  public currentUser: Observable<User> = this.user.asObservable();

  // Used if user claims env var is set to false
  private mockUser: User = {
    id_token: 'fakeIdToken',
    access_token: 'fakeAccessToken',
    token_type: 'bearer',
    scope: 'openid profile',
    expires_at: null,
    expires_in: 1234,
    state: '123',
    expired: false,
    toStorageString: () => '',
    scopes: ['fakeScopes'],
    profile: {
      iat: 1234,
      iss: 'http://localhost:4200',
      sub: 'Admin',
      aud: 'fakeAud',
      exp: 1234,
    },
  };

  constructor(private router: Router) {
    if (!environment.production) {
      Log.logger = console;
      Log.level = Log.DEBUG;
    }

    this.manager.getUser().then(user => {
      if (user) {
        this.user.next(user);
        this.isLoggedInBool = true;
      }
    });
  }

  isLoggedIn(): boolean {
    const userClaims = environment.environment.oidc_user_claims;
    if (userClaims === 'False' || !userClaims) {
      this.user.next(this.mockUser);
      return true;
    }

    return this.user && this.user.value !== null;
  }

  getAuthorizationHeaderValue(): string {
    return `Bearer ${this.user.value.access_token}`;
  }

  async startAuthentication(): Promise<void> {
    try {
      await this.manager.signinRedirect();
    } catch (err) {}
  }

  logout(route: string): void {
    this.user.next(null);
    this.currentUser = this.user.asObservable();
    sessionStorage.setItem(`oidc.user:${environment.environment.oidc.authority}:${environment.environment.oidc.client_id}`, null);
    this.router.navigate([`/${route}`], {
      queryParamsHandling: 'merge',
    });
  }

  async completeAuthentication(): Promise<void> {
    this.router.navigate(['/tenant'], {
      queryParamsHandling: 'merge',
    });
    try {
      const user = await this.manager.signinRedirectCallback();
      this.user.next(user);
    } catch (err) {}
  }
}
