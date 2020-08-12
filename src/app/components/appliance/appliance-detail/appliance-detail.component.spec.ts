import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplianceDetailComponent } from './appliance-detail.component';
import {
  MockFontAwesomeComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
  MockViewFieldComponent,
} from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockProvider } from 'src/test/mock-providers';
import { V1AppliancesService } from 'api_client';

describe('ApplianceDetailComponent', () => {
  let component: ApplianceDetailComponent;
  let fixture: ComponentFixture<ApplianceDetailComponent>;

  beforeEach(async(() => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: convertToParamMap({ id: '1' }),
        url: [{ path: 'appliance' }],
      },
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ApplianceDetailComponent,
        MockViewFieldComponent,
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
        MockFontAwesomeComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1AppliancesService),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
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
