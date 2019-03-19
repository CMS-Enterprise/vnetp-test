import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Userpass } from '../models/userpass';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  loggedIn = false;
  user: User;

  constructor() {
    this.user = JSON.parse(localStorage.getItem('user'));

    if (this.user != null) {
      this.loggedIn = true;
    }
  }


  login(userpass: Userpass){
    this.user = new User();

    this.user.Username = userpass.Username;
    this.user.Token = userpass.toBase64();

    localStorage.setItem('user', JSON.stringify(this.user));
  }

}
