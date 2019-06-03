export class Userpass {

    Username: string;

    Password: string;

    toBase64() {
        return btoa(`${this.Username}:${this.Password}`);
    }
}
