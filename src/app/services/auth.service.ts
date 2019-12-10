import { Injectable } from '@angular/core';
import { User } from '../models/user/user';
import { Userpass } from '../models/user/userpass';
import { Observable, BehaviorSubject, config } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private cs: CookieService) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser')),
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(userpass: Userpass) {
    return this.http
      .post<any>(environment.apiBase + '/auth/login', {
        username: userpass.Username,
        password: userpass.Password,
      })
      .pipe(
        map(result => {
          userpass.Token = result.token;
          const user = new User(userpass);

          if (user && user.Token) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }

          return user;
        }),
      );
  }

  logout() {
    localStorage.clear();
    this.cs.deleteAll('/ ', window.location.hostname);
    this.cs.delete('d42sessnid', '/', window.location.hostname);
    this.currentUserSubject.next(null);
    location.reload();
  }
}
