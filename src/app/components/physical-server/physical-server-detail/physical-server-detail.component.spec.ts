import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalServerDetailComponent } from './physical-server-detail.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhysicalServerModalComponent } from 'src/app/modals/physical-server-modal/physical-server-modal.component';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

describe('PhysicalServerDetailComponent', () => {
  let component: PhysicalServerDetailComponent;
  let fixture: ComponentFixture<PhysicalServerDetailComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FontAwesomeModule,
        NgxSmartModalModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NgxPaginationModule,
      ],
      declarations: [PhysicalServerDetailComponent, PhysicalServerModalComponent, YesNoModalComponent],
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
