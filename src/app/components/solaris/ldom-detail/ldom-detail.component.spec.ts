import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdomDetailComponent } from './ldom-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LdomDetailComponent', () => {
  let component: LdomDetailComponent;
  let fixture: ComponentFixture<LdomDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LdomDetailComponent],
      imports: [AngularFontAwesomeModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [CookieService, NgxSmartModalService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
