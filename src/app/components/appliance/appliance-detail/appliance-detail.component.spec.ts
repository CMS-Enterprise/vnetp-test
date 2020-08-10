import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplianceDetailComponent } from './appliance-detail.component';
import { MockFontAwesomeComponent, MockViewFieldComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('ApplianceDetailComponent', () => {
  let component: ApplianceDetailComponent;
  let fixture: ComponentFixture<ApplianceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [ApplianceDetailComponent, YesNoModalComponent, MockFontAwesomeComponent, MockViewFieldComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              url: [{ path: 'appliance' }],
            },
          },
        },
        FormBuilder,
        Validators,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
