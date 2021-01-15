import { Injectable } from '@angular/core';
import { User } from '../models/user/user';
import { Userpass } from '../models/user/userpass';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public currentUser: Observable<User> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private cs: CookieService) {
    const user = this.getUserFromToken(localStorage.getItem('token'));
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(userpass: Userpass) {
    return this.http
      .post<any>(environment.apiBase + '/v1/auth/token', {
        username: userpass.Username,
        password: userpass.Password,
      })
      .pipe(
        map(result => {
          const user = this.getUserFromToken(result.token);

          if (user && user.Token) {
            localStorage.setItem('token', result.token);
            this.currentUserSubject.next(user);
          }
          console.log('user obj', user);
          // return user;
        }),
      );
  }

  logout() {
    localStorage.clear();
    this.cs.deleteAll('/ ', window.location.hostname);
    this.currentUserSubject.next(null);
    location.reload();
  }

  getUserFromToken(jwtEncoded: string): string {
    try {
      if (!jwtEncoded) {
        return null;
      }

      return jwtEncoded;
    } catch (exception) {
      console.error(exception);
      return null;
    }
  }
}
