import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NetworkObjectModalComponent } from './modals/network-object-modal/network-object-modal.component';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NetworkObjectGroupModalComponent } from './modals/network-object-group-modal/network-object-group-modal.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        AngularFontAwesomeModule,
        NgxSmartModalModule,
        NgxMaskModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        AppComponent,
        NavbarComponent,
        BreadcrumbComponent,
        NetworkObjectModalComponent,
        NetworkObjectGroupModalComponent
      ],
      providers: [CookieService, NgxSmartModalService, FormBuilder]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
