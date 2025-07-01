/* eslint-disable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1TiersService, V1NetworkStaticRoutesService, Tier, StaticRoute } from 'client';
import { StaticRouteDetailComponent } from './static-route-detail.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { StaticRouteModalDto } from 'src/app/models/network/static-route-modal-dto';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

jest.mock('src/app/utils/SubscriptionUtil');

describe('StaticRouteDetailComponent', () => {
  let component: StaticRouteDetailComponent;
  let fixture: ComponentFixture<StaticRouteDetailComponent>;
  let tierService: V1TiersService;
  let staticRouteService: V1NetworkStaticRoutesService;
  let entityService: EntityService;
  let ngx: NgxSmartModalService;
  const datacenterSubject = new Subject<any>();

  const mockTier: Tier = {
    id: 'tier-1',
    name: 'Tier 1',
  } as any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        StaticRouteDetailComponent,
        YesNoModalComponent,
        MockComponent('app-static-route-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
      ],
      providers: [
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkStaticRoutesService),
        MockProvider(V1TiersService),
        {
          provide: DatacenterContextService,
          useValue: { currentDatacenter: datacenterSubject.asObservable() },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'tier-1' }) } },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticRouteDetailComponent);
    component = fixture.componentInstance;
    tierService = TestBed.inject(V1TiersService);
    staticRouteService = TestBed.inject(V1NetworkStaticRoutesService);
    entityService = TestBed.inject(EntityService);
    ngx = TestBed.inject(NgxSmartModalService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createStaticRoute', () => {
    it('should open modal in create mode', () => {
      const spy = jest.spyOn(component, 'openStaticRouteModal').mockImplementation();
      component.createStaticRoute();
      expect(spy).toHaveBeenCalledWith(ModalMode.Create);
    });
  });

  describe('openStaticRouteModal', () => {
    it('should throw error when Edit mode and no staticRoute supplied', () => {
      expect(() => component.openStaticRouteModal(ModalMode.Edit)).toThrowError('Static Route Required');
    });

    it('should set modal data and open modal for create', () => {
      // Arrange: create a persistent mock modal so the same instance is returned
      const modalMock: any = { open: jest.fn(), onCloseFinished: of({}) };
      jest.spyOn(ngx, 'getModal').mockReturnValue(modalMock);
      const setDataSpy = jest.spyOn(ngx, 'setModalData');
      const openSpy = jest.spyOn(modalMock, 'open');
      // Prevent side-effects from the internal subscription logic
      jest.spyOn(component, 'subscribeToStaticRouteModal').mockImplementation();
      component.tier = mockTier;

      // Act
      component.openStaticRouteModal(ModalMode.Create);

      // Assert
      expect(setDataSpy).toHaveBeenCalledWith(expect.any(StaticRouteModalDto), 'staticRouteModal');
      expect(openSpy).toHaveBeenCalled();
    });

    it('should set modal data and open modal for edit', () => {
      const mockRoute = { id: 'sr-edit' } as StaticRoute;
      const modalMock: any = { open: jest.fn(), onCloseFinished: of({}) };
      jest.spyOn(ngx, 'getModal').mockReturnValue(modalMock);
      jest.spyOn(component, 'subscribeToStaticRouteModal').mockImplementation();
      const setDataSpy = jest.spyOn(ngx, 'setModalData');
      component.tier = mockTier;

      component.openStaticRouteModal(ModalMode.Edit, mockRoute);

      // Capture the DTO passed into setModalData to verify the StaticRoute assignment
      const dtoArg = setDataSpy.mock.calls[0][0] as any;
      expect(dtoArg.StaticRoute).toBe(mockRoute);
      expect(setDataSpy).toHaveBeenCalledWith(expect.any(Object), 'staticRouteModal');
      expect(modalMock.open).toHaveBeenCalled();
    });
  });

  describe('subscribeToStaticRouteModal', () => {
    it('should refresh data and reset modal on close', () => {
      // Arrange: create a Subject to emit close events
      const closeSubject = new Subject<any>();
      const modalMock: any = { onCloseFinished: closeSubject.asObservable(), open: jest.fn() };
      jest.spyOn(ngx, 'getModal').mockReturnValue(modalMock);
      const refreshSpy = jest.spyOn(component, 'getStaticRoutes').mockImplementation();
      const resetSpy = jest.spyOn(ngx, 'resetModalData');

      // Act
      component.subscribeToStaticRouteModal();
      // Replace the real subscription with a stub to avoid undefined issues in the callback
      (component as any).staticRouteModalSubscription = { unsubscribe: jest.fn() };
      closeSubject.next(null);

      // Assert
      expect(refreshSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalledWith('staticRouteModal');
    });
  });

  describe('deleteStaticRoute', () => {
    it('should invoke entityService.deleteEntity with correct args', () => {
      const deleteSpy = jest.spyOn(entityService, 'deleteEntity');
      const mockRoute = { id: 'sr-1' } as StaticRoute;
      component.deleteStaticRoute(mockRoute);
      expect(deleteSpy).toHaveBeenCalled();
      const callArg = deleteSpy.mock.calls[0][0];
      expect(callArg).toEqual(mockRoute);
    });
  });

  describe('restoreStaticRoute', () => {
    it('should do nothing when route is not deleted', () => {
      const restoreSpy = jest.spyOn(staticRouteService, 'restoreOneStaticRoute');
      component.restoreStaticRoute({ id: 'sr-1' } as any);
      expect(restoreSpy).not.toHaveBeenCalled();
    });

    it('should restore and refresh when deletedAt present', () => {
      const restoreSpy = jest.spyOn(staticRouteService, 'restoreOneStaticRoute').mockReturnValue(of(null));
      const refreshSpy = jest.spyOn(component, 'getStaticRoutes').mockImplementation();
      component.restoreStaticRoute({ id: 'sr-1', deletedAt: 'yesterday' } as any);
      expect(restoreSpy).toHaveBeenCalledWith({ id: 'sr-1' });
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('getStaticRoutes', () => {
    it('should populate data on success', () => {
      const mockRoutes = [{ id: 'sr-1' }, { id: 'sr-2' }];
      jest.spyOn(tierService, 'getOneTier').mockReturnValue(of({ ...mockTier, staticRoutes: mockRoutes } as any));
      component.getStaticRoutes();
      expect(component.staticRoutes.data).toEqual(mockRoutes);
      expect(component.isLoading).toBe(false);
    });

    it('should set staticRoutes to null on error', () => {
      jest.spyOn(tierService, 'getOneTier').mockImplementation(() => {
        return {
          subscribe: (_next, error) => error(),
        } as any;
      });
      component.getStaticRoutes();
      expect(component.staticRoutes).toBeNull();
    });
  });

  describe('onTableEvent', () => {
    it('should update dto and refresh data', () => {
      const refreshSpy = jest.spyOn(component, 'getStaticRoutes').mockImplementation();
      const event = { page: 2 } as TableComponentDto;
      component.onTableEvent(event);
      expect(component.tableComponentDto).toBe(event);
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should set Id and fetch routes when datacenter present', () => {
      const refreshSpy = jest.spyOn(component, 'getStaticRoutes').mockImplementation();
      datacenterSubject.next({ id: 'dc-1' });
      expect(component.Id).toBe('tier-1');
      expect(refreshSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe via SubscriptionUtil', () => {
      const unsubSpy = jest.spyOn(SubscriptionUtil, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubSpy).toHaveBeenCalled();
    });
  });
});
