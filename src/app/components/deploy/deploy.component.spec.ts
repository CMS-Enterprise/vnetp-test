import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DeployComponent } from './deploy.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';

describe('DeployComponent', () => {
  let component: DeployComponent;
  let fixture: ComponentFixture<DeployComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [DeployComponent, ResolvePipe, YesNoModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, CookieService, Validators],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
