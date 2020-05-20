import { Component, OnInit } from '@angular/core';
import { Userpass } from 'src/app/models/user/userpass';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-callback',
  templateUrl: './auth-callback.component.html',
})
export class AuthCallbackComponent implements OnInit {
  // userpass = new Userpass();
  // errorMessage: string;
  // returnUrl: string;
  // loading: boolean;

  // constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}
  // response: Object;
  constructor(private authService: AuthService) {}

  async ngOnInit() {
    await this.authService
      .completeAuthentication()
      .then(res => {
        console.log('res', res);
      })
      .catch(err => {
        console.log('err', err);
      });
  }
  // ngOnInit() {
  // this.returnUrl = '/dashboard';
  // if (this.route.snapshot.queryParams.returnUrl) {
  //   this.returnUrl = decodeURIComponent(this.route.snapshot.queryParams.returnUrl);
  // }
  // if (!this.auth.currentUser) {
  //   this.auth.logout();
  // } else {
  //   this.router.navigateByUrl(this.returnUrl);
  // }
  // }

  login() {
    // if (!this.userpass.Username || !this.userpass.Password) {
    //   return;
    // }
    // this.errorMessage = null;
    // this.loading = true;
    // this.auth
    //   .login(this.userpass)
    //   .pipe(first())
    //   .subscribe(
    //     data => {
    //       this.toastr.success(`Welcome ${this.userpass.Username}!`);
    //       this.router.navigateByUrl(this.returnUrl);
    //     },
    //     error => {
    //       this.toastr.error('Invalid Username/Password');
    //       this.errorMessage = 'Invalid Username/Password';
    //       this.loading = false;
    //     },
    //   );
  }
}
