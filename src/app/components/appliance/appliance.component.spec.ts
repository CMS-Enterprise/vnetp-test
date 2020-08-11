import { ApplianceComponent } from './appliance.component';
import { ApplianceModalComponent } from './appliance-modal/appliance-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('ApplianceComponent', () => {
  let component: ApplianceComponent;
  let fixture: ComponentFixture<ApplianceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ApplianceComponent,
        ApplianceModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), FormBuilder, CookieService, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ApplianceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
