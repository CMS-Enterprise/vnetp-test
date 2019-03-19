import { Component, OnInit } from '@angular/core';
import { Userpass } from 'src/app/models/userpass';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Router } from '@angular/router';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userpass = new Userpass();
  errorMessage = '';

  constructor(private automationApiService: AutomationApiService,private auth: AuthServiceService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.automationApiService.login(this.userpass).subscribe(
      data => this.auth.login(this.userpass),
      error => this.errorMessage = 'Login Failed',
      () => this.router.navigate(['/dashboard'])
    );
  }

}
