import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhysicalServerDetailComponent } from './physical-server-detail.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { PhysicalServerModalComponent } from '../physical-server-modal/physical-server-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('PhysicalServerDetailComponent', () => {
  let component: PhysicalServerDetailComponent;
  let fixture: ComponentFixture<PhysicalServerDetailComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSmartModalModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NgxPaginationModule,
      ],
      declarations: [PhysicalServerDetailComponent, PhysicalServerModalComponent, YesNoModalComponent, MockFontAwesomeComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
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
