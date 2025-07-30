import { ComponentFixture, TestBed } from '@angular/core/testing';
import { V3GlobalEnvironmentService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';

import { EnvironmentManagementComponent } from './environment-management.component';
import { ActivatedRoute } from '@angular/router';
import { MockComponent } from '../../../../test/mock-components';

describe('EnvironmentManagementComponent', () => {
  let component: EnvironmentManagementComponent;
  let fixture: ComponentFixture<EnvironmentManagementComponent>;
  let mockEnvironmentService: Partial<V3GlobalEnvironmentService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(async () => {
    mockEnvironmentService = {
      getManyEnvironments: jest.fn().mockReturnValue(of([])),
      getManyEnvironmentSummaries: jest.fn().mockReturnValue(of([])),
    };

    mockNgxSmartModalService = {
      getModal: jest.fn().mockReturnValue({
        onCloseFinished: of({}),
      }),
      setModalData: jest.fn(),
      resetModalData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [
        EnvironmentManagementComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      providers: [
        { provide: V3GlobalEnvironmentService, useValue: mockEnvironmentService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: ActivatedRoute, useValue: jest.fn() },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
