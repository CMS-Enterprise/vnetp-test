import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhysicalServerComponent } from './physical-server.component';
import { MockFontAwesomeComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { MockProvider } from 'src/test/mock-providers';
import { PhysicalServerModalComponent } from './physical-server-modal/physical-server-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('PhysicalServerComponent', () => {
  let component: PhysicalServerComponent;
  let fixture: ComponentFixture<PhysicalServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
      ],
      declarations: [
        PhysicalServerComponent,
        PhysicalServerModalComponent,
        YesNoModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
