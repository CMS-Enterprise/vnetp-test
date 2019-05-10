import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpaddressesComponent } from './ipaddresses.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('IpaddressesComponent', () => {
  let component: IpaddressesComponent;
  let fixture: ComponentFixture<IpaddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule, RouterTestingModule, ],
      declarations: [ IpaddressesComponent ],
      providers: [HttpClientModule, HttpClient, HttpHandler, CookieService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpaddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
