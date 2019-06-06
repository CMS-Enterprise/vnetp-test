import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdomDetailComponent } from './ldom-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService } from 'ngx-smart-modal';

describe('LdomDetailComponent', () => {
  let component: LdomDetailComponent;
  let fixture: ComponentFixture<LdomDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdomDetailComponent ],
      imports: [ AngularFontAwesomeModule, RouterTestingModule.withRoutes([])],
      providers: [HttpClient, HttpHandler, CookieService, NgxSmartModalService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
