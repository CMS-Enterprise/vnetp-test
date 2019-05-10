import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateIpNatComponent } from './create-ip-nat.component';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ToastrModule, TOAST_CONFIG } from 'ngx-toastr';

describe('CreateIpNatComponent', () => {
  let component: CreateIpNatComponent;
  let fixture: ComponentFixture<CreateIpNatComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule.withRoutes([]), ToastrModule.forRoot()],
      declarations: [ CreateIpNatComponent ],
      providers: [HttpClient, HttpHandler, CookieService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIpNatComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
