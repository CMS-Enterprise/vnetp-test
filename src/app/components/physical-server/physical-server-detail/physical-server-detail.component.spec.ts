import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhysicalServerDetailComponent } from './physical-server-detail.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { V1PhysicalServersService } from 'api_client';

describe('PhysicalServerDetailComponent', () => {
  let component: PhysicalServerDetailComponent;
  let fixture: ComponentFixture<PhysicalServerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [PhysicalServerDetailComponent, YesNoModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1PhysicalServersService),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              url: [{ path: 'appliance' }],
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalServerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
