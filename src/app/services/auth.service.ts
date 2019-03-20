import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Userpass } from '../models/userpass';
import { Observable, BehaviorSubject, config } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(userpass: Userpass) {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Basic ${userpass.toBase64()}`
      })
    };

    return this.http.get<any>(environment.apiBase + '/api/1.0/customers/', httpOptions)
        .pipe(map(result => {

          const user = new User(userpass);

          const customer = result.Customers[0];

          if (customer) {
                user.CustomerName = customer.name;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }

          return user;
        }));
}

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
