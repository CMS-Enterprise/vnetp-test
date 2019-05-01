import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { Router } from '@angular/router';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AngularFontAwesomeModule, NgxSmartModalModule],
      declarations: [ NavbarComponent ],
      providers: [HttpClient, HttpHandler, CookieService, NgxSmartModalService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
