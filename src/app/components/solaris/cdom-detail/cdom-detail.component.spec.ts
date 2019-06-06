import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdomDetailComponent } from './cdom-detail.component';
import { LdomListComponent } from '../ldom-list/ldom-list.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('CdomDetailComponent', () => {
  let component: CdomDetailComponent;
  let fixture: ComponentFixture<CdomDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule, FormsModule, RouterTestingModule.withRoutes([]), NgxSmartModalModule],
      declarations: [ CdomDetailComponent, LdomListComponent ],
      providers: [HttpClient, HttpHandler, CookieService, NgxSmartModalService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
