import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { StaticRoute, V1NetworkStaticRoutesService } from 'client';
import { of } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { StaticRouteModalDto } from 'src/app/models/network/static-route-modal-dto';
import { StaticRouteModalComponent } from './static-route-modal.component';

const MOCK_STATIC_ROUTE: StaticRoute = {
  id: 'sr-1',
  name: 'test-route',
  destinationNetwork: '1.1.1.1/32',
  nextHop: '2.2.2.2',
  metric: 10,
  tierId: 'tier-1',
};

describe('StaticRouteModalComponent', () => {
  let component: StaticRouteModalComponent;
  let fixture: ComponentFixture<StaticRouteModalComponent>;
  let mockStaticRouteService: V1NetworkStaticRoutesService;
  let mockNgxSmartModalService: NgxSmartModalService;

  beforeEach(() => {
    mockStaticRouteService = {
      createOneStaticRoute: jest.fn().mockReturnValue(of({})),
      updateOneStaticRoute: jest.fn().mockReturnValue(of({})),
    } as any;

    mockNgxSmartModalService = {
      getModalData: jest.fn(),
      resetModalData: jest.fn(),
      close: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [StaticRouteModalComponent],
      providers: [
        UntypedFormBuilder,
        { provide: V1NetworkStaticRoutesService, useValue: mockStaticRouteService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StaticRouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call buildForm', () => {
    const buildFormSpy = jest.spyOn(component as any, 'buildForm');
    component.ngOnInit();
    expect(buildFormSpy).toHaveBeenCalled();
  });

  describe('save', () => {
    it('should not save if form is invalid', () => {
      component.form.setErrors({ invalid: true });
      component.save();
      expect(component.submitted).toBe(true);
      expect(mockStaticRouteService.createOneStaticRoute).not.toHaveBeenCalled();
      expect(mockStaticRouteService.updateOneStaticRoute).not.toHaveBeenCalled();
    });

    it('should call create service in Create mode', () => {
      component.ModalMode = ModalMode.Create;
      component.TierId = 'tier-1';
      component.form.setValue({
        name: 'new-route',
        destinationNetwork: '3.3.3.3/32',
        nextHop: '4.4.4.4',
        metric: 100,
      });
      const closeModalSpy = jest.spyOn(component as any, 'closeModal');

      component.save();

      const expectedPayload: StaticRoute = {
        name: 'new-route',
        tierId: 'tier-1',
        destinationNetwork: '3.3.3.3/32',
        nextHop: '4.4.4.4',
        metric: 100,
      };

      expect(mockStaticRouteService.createOneStaticRoute).toHaveBeenCalledWith({ staticRoute: expectedPayload });
      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('should call update service in Edit mode', () => {
      component.ModalMode = ModalMode.Edit;
      component.StaticRouteId = 'sr-1';
      component.form.setValue({
        name: 'test-route',
        destinationNetwork: '1.1.1.1/32',
        nextHop: '2.2.2.2',
        metric: 50,
      });
      const closeModalSpy = jest.spyOn(component as any, 'closeModal');

      component.save();

      const expectedPayload: Partial<StaticRoute> = { metric: 50 };
      expect(mockStaticRouteService.updateOneStaticRoute).toHaveBeenCalledWith({
        id: 'sr-1',
        staticRoute: expectedPayload,
      });
      expect(closeModalSpy).toHaveBeenCalled();
    });
  });

  describe('modal actions', () => {
    it('closeModal should close the modal and reset', () => {
      const resetSpy = jest.spyOn(component, 'reset');
      (component as any).closeModal();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('staticRouteModal');
      expect(resetSpy).toHaveBeenCalled();
    });

    it('cancel should close the modal and reset', () => {
      const resetSpy = jest.spyOn(component, 'reset');
      component.cancel();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('staticRouteModal');
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  it('f getter should return form controls', () => {
    expect(component.f).toBe(component.form.controls);
  });

  describe('getData', () => {
    it('should configure for Edit mode', () => {
      const dto: StaticRouteModalDto = {
        ModalMode: ModalMode.Edit,
        StaticRoute: MOCK_STATIC_ROUTE,
        TierId: 'tier-1',
      };
      (mockNgxSmartModalService.getModalData as jest.Mock).mockReturnValue(dto);

      fixture.detectChanges();
      component.getData();

      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.TierId).toBe('tier-1');
      expect(component.StaticRouteId).toBe(MOCK_STATIC_ROUTE.id);
      expect(component.form.get('name').disabled).toBe(true);
      expect(component.form.get('destinationNetwork').disabled).toBe(true);
      expect(component.form.get('nextHop').disabled).toBe(true);

      const formValue = component.form.getRawValue();
      expect(formValue.name).toBe(MOCK_STATIC_ROUTE.name);
      expect(formValue.destinationNetwork).toBe(MOCK_STATIC_ROUTE.destinationNetwork);
      expect(formValue.nextHop).toBe(MOCK_STATIC_ROUTE.nextHop);
      expect(formValue.metric).toBe(MOCK_STATIC_ROUTE.metric);

      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('staticRouteModal');
    });

    it('should configure for Create mode', () => {
      const dto: StaticRouteModalDto = {
        ModalMode: ModalMode.Create,
        TierId: 'tier-1',
        StaticRoute: null,
      };
      (mockNgxSmartModalService.getModalData as jest.Mock).mockReturnValue(dto);

      fixture.detectChanges();
      component.getData();

      expect(component.ModalMode).toBe(ModalMode.Create);
      expect(component.TierId).toBe('tier-1');
      expect(component.form.get('name').enabled).toBe(true);
      expect(component.form.get('destinationNetwork').enabled).toBe(true);
      expect(component.form.get('nextHop').enabled).toBe(true);
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('staticRouteModal');
    });

    it('should handle undefined static route', () => {
      const dto: StaticRouteModalDto = {
        ModalMode: ModalMode.Create,
        TierId: 'tier-1',
        StaticRoute: undefined,
      };
      (mockNgxSmartModalService.getModalData as jest.Mock).mockReturnValue(dto);

      fixture.detectChanges();
      component.getData();
      expect(component.form.value.name).toBe(''); // or default value
    });
  });

  it('reset should clear flags and rebuild form', () => {
    const buildFormSpy = jest.spyOn(component as any, 'buildForm');
    component.submitted = true;
    component.TierId = 'tier-1';
    component.StaticRouteId = 'sr-1';

    component.reset();

    expect(component.submitted).toBe(false);
    expect(component.TierId).toBe('');
    expect(component.StaticRouteId).toBe('');
    expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('staticRouteModal');
    expect(buildFormSpy).toHaveBeenCalled();
  });
});
