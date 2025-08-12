import { ComponentFixture, TestBed } from '@angular/core/testing';
import { V3GlobalEnvironmentService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject, throwError } from 'rxjs';

import { EnvironmentManagementComponent } from './environment-management.component';
import { ActivatedRoute } from '@angular/router';
import { MockComponent, MockFontAwesomeComponent } from '../../../../test/mock-components';

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

    const closeSubject = new Subject<any>();
    mockNgxSmartModalService = {
      getModal: jest.fn().mockReturnValue({
        onCloseFinished: closeSubject.asObservable(),
        open: jest.fn(),
      }),
      setModalData: jest.fn(),
      resetModalData: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [
        EnvironmentManagementComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-environment-modal' }),
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

  it('ngOnInit should call getEnvironments', () => {
    const spy = jest.spyOn(component, 'getEnvironments');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  describe('getEnvironments', () => {
    it('should load environments, merge summaries, wrap in pagination and unset loading', () => {
      (mockEnvironmentService.getManyEnvironments as jest.Mock).mockReturnValue(
        of([
          { id: 'e1', name: 'Env1', description: 'D1', externalVrfs: [{}, {}] },
          { id: 'e2', name: 'Env2', description: 'D2', externalVrfs: [] },
        ]),
      );
      (mockEnvironmentService.getManyEnvironmentSummaries as jest.Mock).mockReturnValue(
        of([
          { id: 'e1', totalRoutes: 10 },
          { id: 'e2', totalRoutes: 0 },
        ]),
      );

      component.getEnvironments();

      expect(component.isLoading).toBe(false);
      expect(component.environments.data.length).toBe(2);
      const env1 = component.environments.data[0];
      expect(env1.totalRoutes).toBe(10);
      expect(env1.externalVrfCount).toBe(2);
      const env2 = component.environments.data[1];
      expect(env2.totalRoutes).toBe(0);
      expect(env2.externalVrfCount).toBe(0);
      expect(component.environments.count).toBe(2);
      expect(component.environments.total).toBe(2);
      expect(component.environments.page).toBe(1);
      expect(component.environments.pageCount).toBe(1);
    });

    it('should handle error path and unset loading', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (mockEnvironmentService.getManyEnvironments as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));

      component.isLoading = false;
      component.getEnvironments();
      expect(component.isLoading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('subscribeToEnvironmentModal and openEnvironmentModal', () => {
    it('subscribeToEnvironmentModal should reset data, unsubscribe and refresh after close', () => {
      const closeSubject = new Subject<any>();
      // arrange modal with our subject
      (mockNgxSmartModalService.getModal as jest.Mock).mockReturnValue({
        onCloseFinished: closeSubject.asObservable(),
        open: jest.fn(),
      });

      const resetSpy = jest.spyOn(mockNgxSmartModalService, 'resetModalData' as any);
      const refreshSpy = jest.spyOn(component, 'getEnvironments');

      component.subscribeToEnvironmentModal();
      // emit close
      closeSubject.next({});

      expect(resetSpy).toHaveBeenCalledWith('environmentModal');
      expect(refreshSpy).toHaveBeenCalled();
      expect(component.environmentModalSubscription.closed).toBe(true);
    });

    it('openEnvironmentModal should set modal data and open without environment', () => {
      const subscribeSpy = jest.spyOn(component, 'subscribeToEnvironmentModal');
      const setDataSpy = jest.spyOn(mockNgxSmartModalService, 'setModalData' as any);

      const modal = { onCloseFinished: of({}), open: jest.fn() };
      (mockNgxSmartModalService.getModal as jest.Mock).mockReturnValue(modal);

      component.openEnvironmentModal(1 as any);

      expect(subscribeSpy).toHaveBeenCalled();
      expect(setDataSpy).toHaveBeenCalledWith(expect.objectContaining({ ModalMode: 1 }), 'environmentModal');
      expect(modal.open).toHaveBeenCalled();
    });

    it('openEnvironmentModal should set modal data with environment and open', () => {
      const setDataSpy = jest.spyOn(mockNgxSmartModalService, 'setModalData' as any);
      const modal = { onCloseFinished: of({}), open: jest.fn() };
      (mockNgxSmartModalService.getModal as jest.Mock).mockReturnValue(modal);

      const environment = { id: 'e1' } as any;
      component.openEnvironmentModal(2 as any, environment);

      expect(setDataSpy).toHaveBeenCalledWith(expect.objectContaining({ ModalMode: 2, environment }), 'environmentModal');
      expect(modal.open).toHaveBeenCalled();
    });
  });

  describe('onTableEvent', () => {
    it('should set dto and refresh data', () => {
      const refreshSpy = jest.spyOn(component, 'getEnvironments');
      const event = { page: 2, pageSize: 50 } as any;

      component.onTableEvent(event);

      expect(component.tableComponentDto).toBe(event);
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('editEnvironment', () => {
    it('should open modal in edit mode with environment', () => {
      const openSpy = jest.spyOn(component, 'openEnvironmentModal');
      const env = { id: 'abc' } as any;
      component.editEnvironment(env);
      expect(openSpy).toHaveBeenCalledWith(expect.anything(), env);
    });
  });

  describe('getExternalVrfDisplayText', () => {
    it('should return None for null', () => {
      expect(component.getExternalVrfDisplayText(null)).toBe('None');
    });

    it('should return None for empty', () => {
      expect(component.getExternalVrfDisplayText([])).toBe('None');
    });

    it('should return 1 VRF for single item', () => {
      expect(component.getExternalVrfDisplayText([{} as any])).toBe('1 VRF');
    });

    it('should return N VRFs for multiple items', () => {
      expect(component.getExternalVrfDisplayText([{}, {}, {}] as any)).toBe('3 VRFs');
    });
  });
});
