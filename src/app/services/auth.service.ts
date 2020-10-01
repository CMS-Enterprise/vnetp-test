import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserManager, User, Log, Profile } from 'oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private manager = new UserManager(environment.openId);
  private user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public currentUser: Observable<User> = this.user.asObservable();

  constructor(private router: Router) {
    Log.logger = console;
    Log.level = Log.DEBUG;
    console.log(environment);
    this.manager.getUser().then(user => {
      this.user.next(user);
    });
  }

  isLoggedIn(): boolean {
    return this.user && this.user.value !== null && new Date(this.user.value.expires_at * 1000) > new Date();
  }

  getUser(): Promise<User> {
    return this.manager.getUser();
  }

  getClaims(): Profile {
    return this.user.value.profile;
  }

  getAuthorizationHeaderValue(): string {
    return `Bearer ${this.user.value.access_token}`;
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  logout(): void {
    this.user.next(null);
    this.currentUser = this.user.asObservable();
    sessionStorage.setItem(`oidc.user:${environment.openId.client_id}`, null);
  }

  async completeAuthentication(): Promise<void> {
    const user = await this.manager.signinRedirectCallback();
    this.user.next(user);
    this.router.navigate(['/dashboard'], {
      queryParamsHandling: 'merge',
    });
  }

  public get fullName(): string {
    return `${this.user.value.profile.given_name} ${this.user.value.profile.family_name}`;
  }
}
