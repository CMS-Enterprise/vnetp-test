import { Userpass } from './userpass';

export class User {
    constructor(userpass: Userpass){
        this.Username = userpass.Username;
        this.Token = userpass.toBase64();
    }

    Username: string;
    Token: string;
    CustomerName: string;
}
