import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NetworkSecurityProfileDetailComponent } from './network-security-profile-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PapaParseModule } from 'ngx-papaparse';

describe('NetworkSecurityProfileDetailComponent', () => {
  let component: NetworkSecurityProfileDetailComponent;
  let fixture: ComponentFixture<NetworkSecurityProfileDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule, FormsModule, RouterTestingModule.withRoutes([]), PapaParseModule],
      declarations: [ NetworkSecurityProfileDetailComponent ],
      providers: [HttpClient, HttpHandler, CookieService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSecurityProfileDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
