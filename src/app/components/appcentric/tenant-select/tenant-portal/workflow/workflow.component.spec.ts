import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject, Subscription } from 'rxjs';
import { WorkflowComponent } from './workflow.component';
import { CreateWorkflowDtoWorkflowTypeEnum, V2WorkflowsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

describe('WorkflowComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  let workflowsServiceMock: jest.Mocked<Partial<V2WorkflowsService>>;
  let routerMock: any;
  let ngxSmartModalMock: any;

  const uuid = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    workflowsServiceMock = {
      getManyWorkflow: jest.fn().mockReturnValue(of({ data: [], total: 0 } as any)),
      createOneWorkflow: jest.fn().mockReturnValue(of({})),
      deleteOneWorkflow: jest.fn().mockReturnValue(of({})),
    };

    routerMock = {
      routerState: {
        snapshot: { url: `/some/prefix/tenant-select/edit/${uuid}/suffix` },
      },
    } as Partial<Router> as any;

    const closeSubject = new Subject<any>();
    ngxSmartModalMock = {
      getModal: jest.fn().mockReturnValue({
        onCloseFinished: closeSubject.asObservable(),
        open: jest.fn(),
      }),
      setModalData: jest.fn(),
      resetModalData: jest.fn(),
    } as Partial<NgxSmartModalService> as any;

    await TestBed.configureTestingModule({
      declarations: [WorkflowComponent],
      providers: [
        { provide: V2WorkflowsService, useValue: workflowsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NgxSmartModalService, useValue: ngxSmartModalMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
  });

  it('should create and parse tenantId from URL', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.tenantId).toBe(uuid);
  });

  it('ngOnInit should call getWorkflows', () => {
    const spy = jest.spyOn(component, 'getWorkflows');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  describe('getWorkflows', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should fetch workflows without event and unset isLoading', () => {
      component.getWorkflows();
      expect(workflowsServiceMock.getManyWorkflow).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(component.workflows).toBeDefined();
    });

    it('should apply event params and pagination when event provided', () => {
      (workflowsServiceMock.getManyWorkflow as jest.Mock).mockClear();
      component.getWorkflows({ page: 3, perPage: 10, searchText: 'abc', searchColumn: 'name' } as any);
      expect(workflowsServiceMock.getManyWorkflow).toHaveBeenCalled();
      const args = (workflowsServiceMock.getManyWorkflow as jest.Mock).mock.calls[0][0];
      expect(args.page).toBe(3);
      expect(args.perPage).toBe(10);
      expect(args.filter).toEqual(expect.arrayContaining([`tenantId||eq||${uuid}`, 'name||cont||abc']));
    });

    it('should not include event filter when propertyName is missing', () => {
      (workflowsServiceMock.getManyWorkflow as jest.Mock).mockClear();
      component.getWorkflows({ page: 2, perPage: 5 } as any);
      const args = (workflowsServiceMock.getManyWorkflow as jest.Mock).mock.calls[0][0];
      expect(args.filter[0]).toBe(`tenantId||eq||${uuid}`);
      // second filter may be undefined; ensure array contains 2 entries with possibly undefined
      expect(args.filter.length).toBe(2);
    });

    it('should default page and perPage when event values are nullish', () => {
      (workflowsServiceMock.getManyWorkflow as jest.Mock).mockClear();
      // page and perPage as undefined -> defaults to 1 and 20
      component.getWorkflows({ searchText: 'x', searchColumn: 'name' } as any);
      let args = (workflowsServiceMock.getManyWorkflow as jest.Mock).mock.calls[0][0];
      expect(args.page).toBe(1);
      expect(args.perPage).toBe(20);

      (workflowsServiceMock.getManyWorkflow as jest.Mock).mockClear();
      // page and perPage explicitly null -> also defaults
      component.getWorkflows({ page: null as any, perPage: null as any, searchText: 'y', searchColumn: 'status' } as any);
      args = (workflowsServiceMock.getManyWorkflow as jest.Mock).mock.calls[0][0];
      expect(args.page).toBe(1);
      expect(args.perPage).toBe(20);
    });
  });

  describe('onTableEvent', () => {
    it('should set dto and call getWorkflows with event', () => {
      fixture.detectChanges();
      const spy = jest.spyOn(component, 'getWorkflows');
      const evt = { page: 2, perPage: 50, searchText: 'z', searchColumn: 'status' } as any;
      component.onTableEvent(evt);
      expect(component.tableComponentDto).toBe(evt);
      expect(spy).toHaveBeenCalledWith(evt);
    });
  });

  describe('createWorkflow', () => {
    it('should open Yes/No modal and on confirm create workflow and refresh; on close refresh', () => {
      fixture.detectChanges();
      const subscribeSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((_dto, _ngx, onConfirm, onClose) => {
        onConfirm();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onClose && onClose();
        return new Subscription();
      });
      const refreshSpy = jest.spyOn(component, 'getWorkflows');

      const workflowType = ((Object.values(CreateWorkflowDtoWorkflowTypeEnum) as any)[0] || 'TestType') as any;
      component.createWorkflow(workflowType);

      expect(subscribeSpy).toHaveBeenCalled();
      expect(workflowsServiceMock.createOneWorkflow).toHaveBeenCalledWith({
        createWorkflowDto: { tenantId: uuid, workflowType },
      } as any);
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('deleteWorkflow', () => {
    it('should open Yes/No modal and on confirm delete workflow and refresh; on close refresh', () => {
      fixture.detectChanges();
      const subscribeSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((_dto, _ngx, onConfirm, onClose) => {
        onConfirm();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onClose && onClose();
        return new Subscription();
      });
      const refreshSpy = jest.spyOn(component, 'getWorkflows');

      component.deleteWorkflow({ id: 'w1', name: 'W1' } as any);

      expect(subscribeSpy).toHaveBeenCalled();
      expect(workflowsServiceMock.deleteOneWorkflow).toHaveBeenCalledWith({ id: 'w1' } as any);
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('openWorkflowViewModal and subscribeToWorkflowViewModal', () => {
    it('should set modal data and open', () => {
      fixture.detectChanges();
      const subSpy = jest.spyOn(component, 'subscribeToWorkflowViewModal');
      const modal = ngxSmartModalMock.getModal('workflowViewModal');
      component.openWorkflowViewModal({ id: 'w2' } as any);
      expect(subSpy).toHaveBeenCalled();
      expect(ngxSmartModalMock.setModalData).toHaveBeenCalledWith({ workflowId: 'w2' }, 'workflowViewModal');
      expect(modal.open).toHaveBeenCalled();
    });

    it('should subscribe to onCloseFinished, reset modal data, unsubscribe and refresh', () => {
      fixture.detectChanges();
      const closeSubject = new Subject<any>();
      (ngxSmartModalMock.getModal as jest.Mock).mockReturnValue({ onCloseFinished: closeSubject.asObservable(), open: jest.fn() });
      const resetSpy = jest.spyOn(ngxSmartModalMock, 'resetModalData');
      const refreshSpy = jest.spyOn(component, 'getWorkflows');

      component.subscribeToWorkflowViewModal();
      closeSubject.next({});

      expect(resetSpy).toHaveBeenCalledWith('workflowViewModal');
      expect(refreshSpy).toHaveBeenCalled();
      expect(component.workflowViewModalSubscription.closed).toBe(true);
    });
  });
});
