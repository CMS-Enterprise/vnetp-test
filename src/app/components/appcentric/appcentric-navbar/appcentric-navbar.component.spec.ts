import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { AppcentricNavbarComponent } from './appcentric-navbar.component';

describe('AppcentricNavbarComponent', () => {
  let component: AppcentricNavbarComponent;
  let fixture: ComponentFixture<AppcentricNavbarComponent>;

  beforeEach(async(() => {
    const authService = {
      currentUser: of({
        Username: 'UserName',
      }),
      logout: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [AppcentricNavbarComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      imports: [RouterModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
