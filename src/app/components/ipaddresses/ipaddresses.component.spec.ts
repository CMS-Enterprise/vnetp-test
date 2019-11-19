import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpaddressesComponent } from './ipaddresses.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('IpaddressesComponent', () => {
  let component: IpaddressesComponent;
  let fixture: ComponentFixture<IpaddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      declarations: [IpaddressesComponent],
      providers: [CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpaddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
