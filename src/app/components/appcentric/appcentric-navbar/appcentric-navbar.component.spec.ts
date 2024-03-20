import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent, MockComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { AppcentricNavbarComponent } from './appcentric-navbar.component';

describe('AppcentricNavbarComponent', () => {
  let component: AppcentricNavbarComponent;
  let fixture: ComponentFixture<AppcentricNavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientModule],
      declarations: [
        AppcentricNavbarComponent,
        FilterPipe,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-change-request-modal' }),
      ],
      providers: [MockProvider(NgxSmartModalService), AuthService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppcentricNavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
