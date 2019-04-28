import { Component, OnInit } from '@angular/core';
import { Userpass } from 'src/app/models/userpass';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/dashboard';

    if (!this.auth.currentUser) {
      this.auth.logout();
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }

  login() {
    if (!this.userpass.Username || !this.userpass.Password) {
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    this.auth
      .login(this.userpass)
      .pipe(first())
      .subscribe(
        data => {
          this.toastr.success(`Welcome ${this.userpass.Username}!`);
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.toastr.error('Invalid Username/Password');
          this.errorMessage = 'Invalid Username/Password';
          this.loading = false;
        }
      );
  }
}
