import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdomDetailComponent } from './cdom-detail.component';
import { LdomListComponent } from '../ldom-list/ldom-list.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CdomDetailComponent', () => {
  let component: CdomDetailComponent;
  let fixture: ComponentFixture<CdomDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        RouterTestingModule.withRoutes([]),
        NgxSmartModalModule,
        HttpClientTestingModule
      ],
      declarations: [CdomDetailComponent, LdomListComponent],
      providers: [CookieService, NgxSmartModalService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdomDetailComponent);
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
