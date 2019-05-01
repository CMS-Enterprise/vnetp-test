import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSecurityProfilesComponent } from './network-security-profiles.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HttpHandler, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('NetworkSecurityProfilesComponent', () => {
  let component: NetworkSecurityProfilesComponent;
  let fixture: ComponentFixture<NetworkSecurityProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule],
      declarations: [ NetworkSecurityProfilesComponent ],
      providers: [HttpClient, HttpHandler, CookieService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSecurityProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
