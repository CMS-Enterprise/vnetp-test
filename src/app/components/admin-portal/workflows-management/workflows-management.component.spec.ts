import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { V2AppCentricTenantsService, V2WorkflowsService } from 'client';

import { WorkflowsManagementComponent } from './workflows-management.component';

@Component({
  selector: 'app-table',
  template: '',
})
class TableStubComponent {
  @Input() config: any;
  @Input() data: any;
  @Input() itemsPerPage: any;
  @Input() searchColumns: any;
  @Output() tableEvent = new EventEmitter<any>();
  @Output() itemsPerPageChange = new EventEmitter<any>();
  @Output() clearResults = new EventEmitter<any>();
  @Output() searchParams = new EventEmitter<any>();
}

describe('WorkflowsManagementComponent', () => {
  let component: WorkflowsManagementComponent;
  let fixture: ComponentFixture<WorkflowsManagementComponent>;
  const workflowsServiceMock = {
    getManyWorkflow: jest.fn().mockReturnValue(
      of({
        totalPages: 0,
        count: 0,
        total: 0,
        page: 1,
        pageCount: 1,
        data: [],
      }),
    ),
    createOneWorkflow: jest.fn().mockReturnValue(of(null)),
    approveWorkflowWorkflow: jest.fn().mockReturnValue(of(null)),
  };
  const tenantsServiceMock = {
    getManyTenant: jest.fn().mockReturnValue(
      of({
        totalPages: 0,
        count: 0,
        total: 0,
        page: 1,
        pageCount: 1,
        data: [],
      }),
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowsManagementComponent, TableStubComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: V2WorkflowsService, useValue: workflowsServiceMock },
        { provide: V2AppCentricTenantsService, useValue: tenantsServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

