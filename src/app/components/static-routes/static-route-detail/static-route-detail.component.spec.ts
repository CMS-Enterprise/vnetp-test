import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StaticRouteDetailComponent } from './static-route-detail.component';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { V1TiersService, V1NetworkStaticRoutesService } from 'api_client';

describe('StaticRouteDetailComponent', () => {
  let component: StaticRouteDetailComponent;
  let fixture: ComponentFixture<StaticRouteDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes([]), ReactiveFormsModule],
      declarations: [
        StaticRouteDetailComponent,
        ImportExportComponent,
        YesNoModalComponent,
        MockComponent({ selector: 'app-static-route-modal' }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1TiersService), MockProvider(V1NetworkStaticRoutesService)],
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
