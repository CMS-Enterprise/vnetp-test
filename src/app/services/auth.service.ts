import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto, UserPass } from '../../../api_client/model/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserDto> = new BehaviorSubject<UserDto>(null);
  public currentUser: Observable<UserDto> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = JSON.parse(localStorage.getItem('user'));
    this.currentUserSubject.next(user);
  }

  public get currentUserValue(): UserDto {
    return this.currentUserSubject.value;
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

  logout() {
    localStorage.clear();
    // this.cs.deleteAll('/ ', window.location.hostname);
    this.currentUserSubject.next(null);
    location.reload();
  }
}
