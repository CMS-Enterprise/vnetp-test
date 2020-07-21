import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule],
      declarations: [NavbarComponent, FilterPipe, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [CookieService, { provide: NgxSmartModalService, useValue: ngx }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        router = TestBed.get(Router);
        fixture.detectChanges();
      });
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
