import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSecurityProfilesComponent } from './network-security-profiles.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HttpHandler, HttpClient, HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FirewallRuleModalComponent } from 'src/app/modals/firewall-rule-modal/firewall-rule-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PapaParseModule } from 'ngx-papaparse';
import { NgxMaskModule } from 'ngx-mask';
import { RouterTestingModule } from '@angular/router/testing';

describe('NetworkSecurityProfilesComponent', () => {
  let component: NetworkSecurityProfilesComponent;
  let fixture: ComponentFixture<NetworkSecurityProfilesComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule,
      NgxSmartModalModule,
      NgxMaskModule.forRoot(),
      PapaParseModule,
      FormsModule,
      ReactiveFormsModule,
      RouterTestingModule],
      declarations: [ 
        NetworkSecurityProfilesComponent,
        FirewallRuleModalComponent ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx}, HttpClientModule, HttpClient, HttpHandler, CookieService, FormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSecurityProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
