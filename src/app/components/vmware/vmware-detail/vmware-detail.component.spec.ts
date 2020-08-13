import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VmwareDetailComponent } from './vmware-detail.component';
import { MockFontAwesomeComponent, MockViewFieldComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { V1VmwareVirtualMachinesService } from 'api_client';

describe('VmwareDetailComponent', () => {
  let component: VmwareDetailComponent;
  let fixture: ComponentFixture<VmwareDetailComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), FormsModule, ReactiveFormsModule],
      declarations: [
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockViewFieldComponent,
        VmwareDetailComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1VmwareVirtualMachinesService),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              url: [{ path: 'firewall-rules' }, { path: 'intravrf' }],
            },
          },
        },
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
