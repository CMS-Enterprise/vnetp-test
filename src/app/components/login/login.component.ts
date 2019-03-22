import { Component, OnInit } from '@angular/core';
import { Userpass } from 'src/app/models/userpass';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userpass = new Userpass();
  errorMessage: string;
  returnUrl: string;
  loading: boolean;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.auth.logout();
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/dashboard';
  }

  login() {
    this.errorMessage = null;
    this.loading = true;

    this.auth.login(this.userpass)
    .pipe(first())
    .subscribe(
        data => {
            this.router.navigate([this.returnUrl]);
        },
        error => {
          this.errorMessage = 'Invalid Username/Password';
          this.loading = false;
        });
      }
}
