import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { StaticRouteDetailComponent } from './static-route-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxMaskModule } from 'ngx-mask';
import { ImportExportComponent } from '../../import-export/import-export.component';
import { PapaParseModule } from 'ngx-papaparse';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StaticRouteDetailComponent', () => {
  let component: StaticRouteDetailComponent;
  let fixture: ComponentFixture<StaticRouteDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        RouterTestingModule.withRoutes([]),
        NgxMaskModule.forRoot(),
        PapaParseModule,
        HttpClientTestingModule,
      ],
      declarations: [StaticRouteDetailComponent, ImportExportComponent],
      providers: [CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticRouteDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
