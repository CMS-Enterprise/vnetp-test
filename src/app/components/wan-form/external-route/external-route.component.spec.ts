import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRouteComponent } from './external-route.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { V1NetworkScopeFormsExternalRoutesService, V1NetworkScopeFormsWanFormService } from '../../../../../client';
import { MockFontAwesomeComponent, MockComponent } from '../../../../test/mock-components';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

describe('ExternalRouteComponent', () => {
  let component: ExternalRouteComponent;
  let fixture: ComponentFixture<ExternalRouteComponent>;
  let mockActivatedRoute: any;
  let mockExternalRouteService: any;
  let mockWanFormService: any;
  let mockRuntimeDataService: any;
  let mockRouter: any;
  let mockNgx: any;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        params: {
          id: 'id',
        },
        data: {
          mode: 'mode',
        },
        queryParams: { id: 'id' },
      },
    };
    mockExternalRouteService = {
      getManyExternalRoute: jest.fn(),
      createRuntimeDataJobExternalRoute: jest.fn(),
      deleteOneExternalRoute: jest.fn(),
      softDeleteOneExternalRoute: jest.fn(),
    };
    mockWanFormService = {
      getOneWanForm: jest.fn().mockReturnValue(of({})),
      addRouteToWanFormWanForm: jest.fn(),
      removeRouteFromWanFormWanForm: jest.fn(),
    };
    mockRuntimeDataService = {
      isRecentlyRefreshed: jest.fn(),
      pollJobStatus: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockNgx = {
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        onCloseFinished: of({}),
      }),
      resetModalData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSortModule,
        MatPaginatorModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
      ],
      declarations: [ExternalRouteComponent, MockFontAwesomeComponent, MockComponent({ selector: 'app-external-route-modal' })],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: V1NetworkScopeFormsExternalRoutesService, useValue: mockExternalRouteService },
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: Router, useValue: mockRouter },
        { provide: RuntimeDataService, useValue: mockRuntimeDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteComponent);
    component = fixture.componentInstance;
    component.vrfId = 'vrfId';
    component.getAllRoutes = jest.fn().mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should soft delete route', () => {
    const route = { id: 'route1' } as any;
    const deleteSpy = jest.spyOn(mockExternalRouteService, 'softDeleteOneExternalRoute').mockReturnValue(of({}));
    const getAllRoutesSpy = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute(route);
    expect(deleteSpy).toHaveBeenCalledWith({ id: 'route1' });
    expect(getAllRoutesSpy).toHaveBeenCalled();
  });

  it('should delete route', () => {
    const route = { id: 'route1', deletedAt: '2021-01-01' } as any;
    const deleteSpy = jest.spyOn(mockExternalRouteService, 'deleteOneExternalRoute').mockReturnValue(of({}));
    const getAllRoutesSpy = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute(route);
    expect(deleteSpy).toHaveBeenCalledWith({ id: 'route1' });
    expect(getAllRoutesSpy).toHaveBeenCalled();
  });

  it('should open route table modal', () => {
    component.wanForm = { id: 'wan1' } as any;
    (component as any).modalSubscription = of({}).subscribe();
    const setModalDataSpy = jest.spyOn(mockNgx, 'setModalData');
    component.openModal();
    expect(setModalDataSpy).toHaveBeenCalledWith({ wanFormId: 'wan1' }, 'externalRouteModal');
  });
});
