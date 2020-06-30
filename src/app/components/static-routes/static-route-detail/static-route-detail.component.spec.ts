import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { StaticRouteDetailComponent } from './static-route-detail.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxMaskModule } from 'ngx-mask';
import { ImportExportComponent } from '../../import-export/import-export.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StaticRouteModalComponent } from 'src/app/modals/static-route-modal/static-route-modal.component';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';

describe('StaticRouteDetailComponent', () => {
  let component: StaticRouteDetailComponent;
  let fixture: ComponentFixture<StaticRouteDetailComponent>;
  let router: Router;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
        FormsModule,
        RouterTestingModule.withRoutes([]),
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      declarations: [StaticRouteDetailComponent, ImportExportComponent, YesNoModalComponent, StaticRouteModalComponent],
      providers: [CookieService, { provide: NgxSmartModalService, useValue: ngx }],
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
