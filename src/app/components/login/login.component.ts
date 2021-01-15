import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserPass } from 'api_client/model/userPass';
import { UserDto } from 'api_client/model/userDto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  userpass: UserPass;
  errorMessage: string;
  returnUrl: string;
  loading: boolean;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit() {
    this.returnUrl = '/dashboard';

    if (this.route.snapshot.queryParams.returnUrl) {
      this.returnUrl = decodeURIComponent(this.route.snapshot.queryParams.returnUrl);
    }

    if (!this.auth.currentUser) {
      this.auth.logout();
    } else {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  login() {
    if (!this.userpass.username || !this.userpass.password) {
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    this.auth
      .login(this.userpass)
      .pipe(first())
      .subscribe(
        data => {
          this.toastr.success(`Welcome ${this.userpass.username}!`);
          this.router.navigateByUrl(this.returnUrl);
        },
        error => {
          this.toastr.error('Invalid Username/Password');
          this.errorMessage = 'Invalid Username/Password';
          this.loading = false;
        },
      );
  }
}
