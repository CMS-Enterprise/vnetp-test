import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ExternalVrf, V3GlobalEnvironmentsService, V3GlobalExternalVrfsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';

import { EnvironmentModalComponent } from './environment-modal.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { NgxSmartModalModule } from 'ngx-smart-modal';

describe('EnvironmentModalComponent', () => {
  let component: EnvironmentModalComponent;
  let fixture: ComponentFixture<EnvironmentModalComponent>;
  let mockEnvironmentService: Partial<V3GlobalEnvironmentsService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;
  let mockExternalVrfService: Partial<V3GlobalExternalVrfsService>;

  beforeEach(async () => {
    mockEnvironmentService = {
      getOneEnvironment: jest.fn().mockReturnValue(
        of({
          id: 'e1',
          name: 'Env1',
          description: 'Desc',
          externalVrfs: [{ id: 'vrf-a', name: 'A' }] as ExternalVrf[],
        }),
      ),
      createOneEnvironment: jest.fn().mockReturnValue(of({})),
      updateOneEnvironment: jest.fn().mockReturnValue(of({})),
    };

    mockNgxSmartModalService = {
      getModalData: jest.fn().mockReturnValue({}),
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        close: jest.fn(),
        onCloseFinished: of({}),
      }),
      close: jest.fn(),
      resetModalData: jest.fn(),
    };

    mockExternalVrfService = {
      getManyExternalVrf: jest
        .fn()
        .mockReturnValue(of([{ id: 'v1', name: 'V1' } as unknown as ExternalVrf, { id: 'v2', name: 'V2' } as unknown as ExternalVrf])),
    } as Partial<V3GlobalExternalVrfsService> as any;

    await TestBed.configureTestingModule({
      declarations: [EnvironmentModalComponent, MockFontAwesomeComponent],
      imports: [ReactiveFormsModule, NgxSmartModalModule],
      providers: [
        UntypedFormBuilder,
        { provide: V3GlobalEnvironmentsService, useValue: mockEnvironmentService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V3GlobalExternalVrfsService, useValue: mockExternalVrfService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit/buildForm', () => {
    it('should initialize the form with validators', () => {
      expect(component.form).toBeTruthy();
      component.form.patchValue({ name: '', description: '', externalVrfs: [] });
      expect(component.form.invalid).toBe(true);
      component.form.patchValue({ name: 'A', description: 'B', externalVrfs: ['X'] });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('getData', () => {
    it('should handle Create mode: reset and enable form, then reset modal data', () => {
      (mockNgxSmartModalService.getModalData as jest.Mock).mockReturnValue({ ModalMode: ModalMode.Create });
      const resetSpy = jest.spyOn(mockNgxSmartModalService, 'resetModalData' as any);
      const enableSpy = jest.spyOn(component.form, 'enable');

      component.getData();

      expect(component.modalMode).toBe(ModalMode.Create as any);
      expect(enableSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalledWith('environmentModal');
    });

    it('should handle Edit mode: set environmentId and loadEnvironment', () => {
      const dto = { ModalMode: ModalMode.Edit, environment: { id: 'e1' } };
      (mockNgxSmartModalService.getModalData as jest.Mock).mockReturnValue(dto);
      const loadSpy = jest.spyOn(component as any, 'loadEnvironment');
      const resetSpy = jest.spyOn(mockNgxSmartModalService, 'resetModalData' as any);

      component.getData();

      expect(component.modalMode).toBe(ModalMode.Edit as any);
      expect(component.environmentId).toBe('e1');
      expect(loadSpy).toHaveBeenCalledWith('e1');
      expect(resetSpy).toHaveBeenCalledWith('environmentModal');
    });
  });

  describe('loadEnvironment', () => {
    it('should patch form, enable it and disable name in Edit mode', () => {
      (component as any).modalMode = ModalMode.Edit; // Edit mode
      (component as any).loadEnvironment('e1');

      expect(component.isLoading).toBe(false);
      expect(component.form.get('name')?.value).toBe('Env1');
      expect(component.form.get('description')?.value).toBe('Desc');
      expect(component.form.get('externalVrfs')?.value).toEqual(['A']);
      expect(component.form.get('name')?.disabled).toBe(true);
    });

    it('should handle error and unset loading', () => {
      (mockEnvironmentService.getOneEnvironment as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (component as any).modalMode = ModalMode.Edit;

      (component as any).loadEnvironment('e1');

      expect(component.isLoading).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('getters/actions', () => {
    it('f getter should return controls', () => {
      expect(component.f).toBe(component.form.controls);
    });

    it('closeModal should close and reset', () => {
      const resetSpy = jest.spyOn(component, 'reset');
      component.closeModal();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('environmentModal');
      expect(resetSpy).toHaveBeenCalled();
    });

    it('reset should clear submitted, reset modal data, rebuild form, and unset loading', () => {
      component.submitted = true;
      component.isLoading = true;
      const originalForm = component.form;
      component.reset();
      expect(component.submitted).toBe(false);
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('environmentModal');
      expect(component.form).not.toBe(originalForm);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('save/create/update', () => {
    it('should early-return on invalid form', () => {
      const createSpy = jest.spyOn(component as any, 'createEnvironment');
      const updateSpy = jest.spyOn(component as any, 'updateEnvironment');
      component.form.reset({ name: '', description: '', externalVrfs: [] });

      component.save();

      expect(component.submitted).toBe(true);
      expect(createSpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should create environment in Create mode', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      (component as any).modalMode = ModalMode.Create; // Create
      const createSpy = jest.spyOn(component as any, 'createEnvironment');
      component.form.setValue({ name: 'N', description: 'D', externalVrfs: ['X'] });

      component.save();

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'N',
          description: 'D',
          externalVrfs: [{ id: 'X' }],
          lastRouteSyncAt: '2024-01-01T00:00:00.000Z',
        }),
      );
      jest.useRealTimers();
    });

    it('should update environment in Edit mode', () => {
      (component as any).modalMode = ModalMode.Edit; // Edit
      (component as any).environmentId = 'e1';
      const updateSpy = jest.spyOn(component as any, 'updateEnvironment');
      component.form.setValue({ name: 'N', description: 'D', externalVrfs: ['X'] });

      component.save();

      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'N', description: 'D', externalVrfs: [{ id: 'X' }] }));
    });

    it('createEnvironment success should close modal', () => {
      const closeSpy = jest.spyOn(component, 'closeModal');
      (component as any).createEnvironment({ name: 'N' });
      expect(mockEnvironmentService.createOneEnvironment).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalled();
    });

    it('createEnvironment error should set submitted=false', () => {
      (mockEnvironmentService.createOneEnvironment as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      component.submitted = true;
      (component as any).createEnvironment({ name: 'N' });
      expect(errorSpy).toHaveBeenCalled();
      expect(component.submitted).toBe(false);
      errorSpy.mockRestore();
    });

    it('updateEnvironment success should close modal', () => {
      const closeSpy = jest.spyOn(component, 'closeModal');
      (component as any).environmentId = 'e1';
      (component as any).updateEnvironment({ name: 'N' });
      expect(mockEnvironmentService.updateOneEnvironment).toHaveBeenCalledWith({ id: 'e1', environment: expect.any(Object) });
      expect(closeSpy).toHaveBeenCalled();
    });

    it('updateEnvironment error should set submitted=false', () => {
      (mockEnvironmentService.updateOneEnvironment as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      component.submitted = true;
      (component as any).environmentId = 'e1';
      (component as any).updateEnvironment({ name: 'N' });
      expect(errorSpy).toHaveBeenCalled();
      expect(component.submitted).toBe(false);
      errorSpy.mockRestore();
    });
  });

  describe('VRF helpers', () => {
    beforeEach(() => {
      component.vrfOptions = [
        { value: 'v1', label: 'V1' },
        { value: 'v2', label: 'V2' },
      ];
      component.form.get('externalVrfs')?.setValue([]);
    });

    it('addVrf should append when not present', () => {
      component.form.get('externalVrfs')?.setValue(['A']);
      component.addVrf('B');
      expect(component.form.get('externalVrfs')?.value).toEqual(['A', 'B']);
    });

    it('addVrf should not duplicate existing value', () => {
      component.form.get('externalVrfs')?.setValue(['A']);
      component.addVrf('A');
      expect(component.form.get('externalVrfs')?.value).toEqual(['A']);
    });

    it('getSelectedVrfs should return current selection or empty array', () => {
      component.form.get('externalVrfs')?.setValue(['X']);
      expect(component.getSelectedVrfs()).toEqual(['X']);
      component.form.get('externalVrfs')?.setValue(null);
      expect(component.getSelectedVrfs()).toEqual([]);
    });

    it('getAvailableVrfs should exclude selected', () => {
      component.form.get('externalVrfs')?.setValue([component.vrfOptions[0].value, component.vrfOptions[1].value]);
      const available = component.getAvailableVrfs();
      expect(available.find(v => v.value === component.vrfOptions[0].value)).toBeUndefined();
      expect(available.find(v => v.value === component.vrfOptions[1].value)).toBeUndefined();
    });

    it('getVrfLabel should return label or the raw value', () => {
      const first = component.vrfOptions[0];
      expect(component.getVrfLabel(first.value)).toBe(first.label);
      expect(component.getVrfLabel('UNKNOWN_VRF')).toBe('UNKNOWN_VRF');
    });
  });
});
