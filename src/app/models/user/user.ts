import { Userpass } from './userpass';

export class User {
  constructor(userpass: Userpass) {
    this.Username = userpass.Username;
    this.Token = userpass.Token;
  }

  Username: string;
  Token: string;
  CustomerName: string;
  CustomerIdentifier: string;
}
