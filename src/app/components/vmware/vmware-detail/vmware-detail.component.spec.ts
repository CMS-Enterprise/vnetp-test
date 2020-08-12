import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VmwareDetailComponent } from './vmware-detail.component';
import { MockFontAwesomeComponent, MockViewFieldComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('VmwareDetailComponent', () => {
  let component: VmwareDetailComponent;
  let fixture: ComponentFixture<VmwareDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockViewFieldComponent,
        VmwareDetailComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              url: [{ path: 'firewall-rules' }, { path: 'intravrf' }],
            },
          },
        },
        FormBuilder,
        Validators,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmwareDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
