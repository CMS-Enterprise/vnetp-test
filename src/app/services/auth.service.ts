import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Userpass } from '../models/userpass';
import { Observable, BehaviorSubject, config } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient, private cs: CookieService) {
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

          if (!result.Customers || result.Customers.length === 0){
            throw Error('No Permissions to any Customer.');
          }

          const customer = result.Customers[0];

          if (customer) {
                user.CustomerName = customer.name;
                user.CustomerIdentifier = customer.name.toLowerCase();
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            }

          return user;
        }));
}

  logout() {
    localStorage.clear();
    this.cs.deleteAll('/');
    this.currentUserSubject.next(null);
    location.reload();
  }
}
