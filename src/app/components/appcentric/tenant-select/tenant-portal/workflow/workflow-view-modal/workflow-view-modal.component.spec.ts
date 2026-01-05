import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { V2WorkflowsService, Workflow, WorkflowStatusEnum } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WorkflowViewModalComponent } from './workflow-view-modal.component';

describe('WorkflowViewModalComponent', () => {
  let component: WorkflowViewModalComponent;
  let fixture: ComponentFixture<WorkflowViewModalComponent>;

  let workflowsServiceMock: jest.Mocked<Partial<V2WorkflowsService>>;
  let ngxSmartModalMock: jest.Mocked<Partial<NgxSmartModalService>>;

  const workflowId = 'wf-123';

  beforeEach(async () => {
    workflowsServiceMock = {
      getOneWorkflow: jest.fn().mockReturnValue(of({ id: workflowId } as Workflow)),
      approveWorkflowWorkflow: jest.fn().mockReturnValue(of(null)),
      disapproveWorkflowWorkflow: jest.fn().mockReturnValue(of(null)),
      applyWorkflowWorkflow: jest.fn().mockReturnValue(of(null)),
    };

    ngxSmartModalMock = {
      getModalData: jest.fn().mockReturnValue({ workflowId }),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [WorkflowViewModalComponent],
      providers: [
        { provide: V2WorkflowsService, useValue: workflowsServiceMock },
        { provide: NgxSmartModalService, useValue: ngxSmartModalMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.displayedColumns).toEqual(['actions', 'address', 'type', 'name', 'diff']);
  });

  describe('getData', () => {
    it('should read modal data, set workflowId and call getWorkflow', () => {
      const getWorkflowSpy = jest.spyOn(component, 'getWorkflow');
      (ngxSmartModalMock.getModalData as jest.Mock).mockReturnValue({ workflowId });

      component.getData();

      expect(ngxSmartModalMock.getModalData).toHaveBeenCalledWith('workflowViewModal');
      expect(component.workflowId).toBe(workflowId);
      expect(getWorkflowSpy).toHaveBeenCalled();
    });
  });

  describe('getWorkflow', () => {
    it('should fetch workflow and set planJson when planJson exists', () => {
      const planObject = { foo: 'bar', count: 1 };
      const workflow: Partial<Workflow> = {
        id: workflowId,
        plan: { planJson: planObject } as any,
        events: [] as any,
      };
      (workflowsServiceMock.getOneWorkflow as jest.Mock).mockReturnValue(of(workflow as Workflow));

      component.workflowId = workflowId;
      component.getWorkflow();

      expect(workflowsServiceMock.getOneWorkflow).toHaveBeenCalledWith({ id: workflowId, relations: ['plan', 'events', 'executionLogs'] });
      expect(component.workflow).toEqual(workflow as Workflow);
      expect(component.planJson).toBe(JSON.stringify(planObject, null, 2));
    });

    it('should fetch workflow and leave planJson undefined when planJson is missing', () => {
      const workflow: Partial<Workflow> = {
        id: workflowId,
        plan: undefined as any,
      };
      (workflowsServiceMock.getOneWorkflow as jest.Mock).mockReturnValue(of(workflow as Workflow));

      component.planJson = 'previous';
      component.workflowId = workflowId;
      component.getWorkflow();

      expect(workflowsServiceMock.getOneWorkflow).toHaveBeenCalledWith({ id: workflowId, relations: ['plan', 'events', 'executionLogs'] });
      expect(component.workflow).toEqual(workflow as Workflow);
      expect(component.planJson).toBe('previous'); // unchanged because code sets only when present
    });
  });

  describe('approve/disapprove/apply workflow', () => {
    it('approveWorkflow should call service then refresh workflow', () => {
      const refreshSpy = jest.spyOn(component, 'getWorkflow');
      component.workflowId = workflowId;

      component.approveWorkflow();

      expect(workflowsServiceMock.approveWorkflowWorkflow).toHaveBeenCalledWith({ id: workflowId });
      expect(refreshSpy).toHaveBeenCalled();
    });

    it('disapproveWorkflow should call service then refresh workflow', () => {
      const refreshSpy = jest.spyOn(component, 'getWorkflow');
      component.workflowId = workflowId;

      component.disapproveWorkflow();

      expect(workflowsServiceMock.disapproveWorkflowWorkflow).toHaveBeenCalledWith({ id: workflowId });
      expect(refreshSpy).toHaveBeenCalled();
    });

    it('applyWorkflow should call service and set status to Applying', fakeAsync(() => {
      component.workflowId = workflowId;
      component.workflow = { status: WorkflowStatusEnum.Approved } as any;
      (workflowsServiceMock.getOneWorkflow as jest.Mock).mockReturnValue(of({ status: WorkflowStatusEnum.Applying } as Workflow));

      component.applyWorkflow();

      expect(workflowsServiceMock.applyWorkflowWorkflow).toHaveBeenCalledWith({ id: workflowId });
      expect(component.workflow.status).toBe(WorkflowStatusEnum.Applying);
    }));
  });

  describe('reset', () => {
    it('should reset component state', () => {
      component.workflow = { id: workflowId } as Workflow;
      component.workflowId = workflowId;
      component.planJson = '{}';

      component.reset();

      expect(component.workflow).toBeNull();
      expect(component.workflowId).toBeNull();
      expect(component.planJson).toBeNull();
    });
  });

  describe('trackByEventId', () => {
    it('should return the event id', () => {
      const event = { id: 'evt-1', other: 'x' };
      expect(component.trackByEventId(0, event)).toBe('evt-1');
    });
  });
});
