import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManager, User, Log } from 'oidc-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private manager = new UserManager(environment.openId);
  user: User = null;

  constructor() {
    Log.logger = console;
    Log.level = Log.DEBUG;
    console.log(environment.openId);
    this.manager.getUser().then(user => {
      this.user = user;
    });
  }

  isLoggedIn(): boolean {
    return this.user !== null;
  }

  getUser(): Promise<User> {
    return this.manager.getUser();
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
}
