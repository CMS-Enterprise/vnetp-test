import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { StaticRouteDetailComponent } from './static-route-detail.component';
import { MockFontAwesomeComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { StaticRouteModalComponent } from '../static-route-modal/static-route-modal.component';

describe('StaticRouteDetailComponent', () => {
  let component: StaticRouteDetailComponent;
  let fixture: ComponentFixture<StaticRouteDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes([]), NgxSmartModalModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [
        StaticRouteDetailComponent,
        ImportExportComponent,
        YesNoModalComponent,
        StaticRouteModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
      ],
      providers: [CookieService, MockProvider(NgxSmartModalService)],
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
