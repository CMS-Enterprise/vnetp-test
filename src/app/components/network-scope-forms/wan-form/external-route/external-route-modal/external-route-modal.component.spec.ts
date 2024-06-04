import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import { V1NetworkScopeFormsExternalRouteService } from '../../../../../../../client';
import { DatacenterContextService } from '../../../../../services/datacenter-context.service';
import { ExternalRouteModalComponent } from './external-route-modal.component';
import { ModalMode } from '../../../../../models/other/modal-mode';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';

describe('ExternalRouteModalComponent', () => {
  let component: ExternalRouteModalComponent;
  let fixture: ComponentFixture<ExternalRouteModalComponent>;
  let mockNgxSmartModalService: any;
  let mockExternalRouteService: any;
  let mockDatacenterContextService: any;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    formBuilder = new FormBuilder();

    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({
        modalMode: 'Edit',
        externalRoute: {
          id: 'testExternalRouteId',
          externalRouteIp: '192.168.0.1/24',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
        },
        wanFormId: 'testWanFormId',
      }),
    };

    mockExternalRouteService = {
      createOneExternalRoute: jest.fn().mockReturnValue(of({})),
      updateOneExternalRoute: jest.fn().mockReturnValue(of({})),
    };

    mockDatacenterContextService = {
      currentDatacenter: of({ id: 'testDatacenterId' }),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ExternalRouteModalComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsExternalRouteService, useValue: mockExternalRouteService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set datacenterId if currentDatacenter is provided', () => {
      component.ngOnInit();
      expect((component as any).datacenterId).toBe('testDatacenterId');
    });

    it('should build the form on initialization', () => {
      const buildFormSpy = jest.spyOn(component as any, 'buildForm');
      component.ngOnInit();
      expect(buildFormSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from datacenterSubscription', () => {
      (component as any).datacenterSubscription = new Subscription();
      const unsubscribeSpy = jest.spyOn((component as any).datacenterSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('buildForm', () => {
    it('should initialize the form with the specified controls and validators', () => {
      (component as any).buildForm();
      expect(component.form.contains('ip')).toBeTruthy();
      expect(component.form.contains('description')).toBeTruthy();
      expect(component.form.contains('vrf')).toBeTruthy();
      expect(component.form.contains('environment')).toBeTruthy();

      const ipControl = component.form.get('ip');
      const descriptionControl = component.form.get('description');
      const vrfControl = component.form.get('vrf');
      const environmentControl = component.form.get('environment');

      expect(ipControl?.validator).toBeTruthy();
      expect(descriptionControl?.validator).toBeTruthy();
      expect(vrfControl?.validator).toBeTruthy();
      expect(environmentControl?.validator).toBeTruthy();
    });
  });

  describe('getData', () => {
    it('should get modal data and assign to component properties', () => {
      component.getData();
      expect(component.modalMode).toBe('Edit');
      expect(component.wanFormId).toBe('testWanFormId');
      expect(component.externalRouteId).toBe('testExternalRouteId');
    });

    it('should set form values if externalRoute is defined', () => {
      const formControls = component.form.controls;
      component.getData();
      expect(formControls.ip.value).toBe('192.168.0.1/24');
      expect(formControls.description.value).toBe('testDescription');
      expect(formControls.vrf.value).toBe('testVRF');
      expect(formControls.environment.value).toBe('testEnvironment');
    });

    it('should reset modal data after processing', () => {
      component.getData();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('externalRouteModal');
    });
  });

  describe('closeModal', () => {
    it('should close the modal and reset the form', () => {
      const resetSpy = jest.spyOn(component, 'reset');
      component.closeModal();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('externalRouteModal');
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset form and modal data', () => {
      const buildFormSpy = jest.spyOn(component as any, 'buildForm');
      component.reset();
      expect(component.submitted).toBe(false);
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('externalRouteModal');
      expect(buildFormSpy).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    beforeEach(() => {
      component.modalMode = ModalMode.Create;
      (component as any).datacenterId = 'testDatacenterId';
      component.wanFormId = 'testWanFormId';
      (component as any).buildForm();
      component.form.setValue({
        ip: '192.168.0.1/24',
        description: 'testDescription',
        vrf: 'testVRF',
        environment: 'testEnvironment',
      });
    });

    it('should set submitted to true', () => {
      component.save();
      expect(component.submitted).toBe(true);
    });

    it('should return early if form is invalid', () => {
      component.form.controls.ip.setErrors({ incorrect: true });
      component.save();
      expect(mockExternalRouteService.createOneExternalRoute).not.toHaveBeenCalled();
      expect(mockExternalRouteService.updateOneExternalRoute).not.toHaveBeenCalled();
    });
  });
});
