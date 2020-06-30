import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplianceComponent } from './appliance.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplianceModalComponent } from 'src/app/modals/appliance-modal/appliance-modal.component';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { CookieService } from 'ngx-cookie-service';

describe('ApplianceComponent', () => {
  let component: ApplianceComponent;
  let fixture: ComponentFixture<ApplianceComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [ApplianceComponent, ApplianceModalComponent, YesNoModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, CookieService, Validators],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
