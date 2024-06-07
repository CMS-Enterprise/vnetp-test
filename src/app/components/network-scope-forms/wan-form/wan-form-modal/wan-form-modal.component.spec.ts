import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import { V1NetworkScopeFormsWanFormService } from '../../../../../../client';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
} from '../../../../../test/mock-components';
import { DatacenterContextService } from '../../../../services/datacenter-context.service';
import { WanFormModalComponent } from './wan-form-modal.component';
import { ModalMode } from '../../../../models/other/modal-mode';

describe('WanFormModalComponent', () => {
  let component: WanFormModalComponent;
  let fixture: ComponentFixture<WanFormModalComponent>;
  let mockNgxSmartModalService: any;
  let mockWanFormService: any;
  let mockDatacenterContextService: any;
  let formBuilder: FormBuilder;
  let mockRoute: any;

  beforeEach(async () => {
    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({
        modalMode: 'Edit',
        wanForm: {
          id: 'testWanFormId',
          name: 'testName',
          description: 'testDescription',
        },
      }),
    };

    mockWanFormService = {
      createOneWanForm: jest.fn().mockReturnValue(of({})),
      updateOneWanForm: jest.fn().mockReturnValue(of({})),
    };

    mockDatacenterContextService = {
      currentDatacenter: of({ id: 'testDatacenterId' }),
    };

    formBuilder = new FormBuilder();

    mockRoute = {
      snapshot: {
        queryParams: { tenantId: 'testTenantId' },
        data: { mode: 'netcentric' },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        WanFormModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockComponent('app-external-route-modal'),
        MockNgxSmartModalComponent,
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set dcsMode and datacenterId if dcsMode is netcentric', () => {
      component.ngOnInit();
      expect(component.dcsMode).toBe('netcentric');
      expect(component.datacenterId).toBe('testDatacenterId');
    });

    it('should build the form on initialization', () => {
      const buildFormSpy = jest.spyOn(component, 'buildForm');
      component.ngOnInit();
      expect(buildFormSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from currentDatacenterSubscription', () => {
      component.currentDatacenterSubscription = new Subscription();
      const unsubscribeSpy = jest.spyOn(component.currentDatacenterSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('buildForm', () => {
    it('should initialize the form with the specified controls and validators', () => {
      component.buildForm();
      expect(component.form.contains('name')).toBeTruthy();
      expect(component.form.contains('description')).toBeTruthy();
      const nameControl = component.form.get('name');
      const descriptionControl = component.form.get('description');
      expect(nameControl?.validator).toBeTruthy();
      expect(descriptionControl?.validator).toBeTruthy();
    });
  });

  describe('getData', () => {
    it('should get modal data and assign to component properties', () => {
      component.getData();
      expect(component.modalMode).toBe('Edit');
      expect(component.wanFormId).toBe('testWanFormId');
    });

    it('should set form values and disable name control if wanForm is defined', () => {
      const formControls = component.form.controls;
      component.getData();
      expect(formControls.name.value).toBe('testName');
      expect(formControls.name.disabled).toBe(true);
      expect(formControls.description.value).toBe('testDescription');
    });

    it('should reset modal data after processing', () => {
      component.getData();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('wanFormModal');
    });
  });

  describe('closeModal', () => {
    it('should close the modal and reset the form', () => {
      const resetSpy = jest.spyOn(component, 'reset');
      component.closeModal();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('wanFormModal');
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset form and modal data', () => {
      const buildFormSpy = jest.spyOn(component, 'buildForm');
      component.reset();
      expect(component.submitted).toBe(false);
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('wanFormModal');
      expect(buildFormSpy).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    beforeEach(() => {
      component.dcsMode = 'netcentric';
      component.datacenterId = 'testDatacenterId';
      component.tenantId = 'testTenantId';
      component.buildForm();
      component.form.setValue({
        name: 'testName',
        description: 'testDescription',
      });
    });

    it('should return early if form is invalid', () => {
      component.form.controls.name.setErrors({ incorrect: true });
      component.save();
      expect(mockWanFormService.createOneWanForm).not.toHaveBeenCalled();
      expect(mockWanFormService.updateOneWanForm).not.toHaveBeenCalled();
    });

    it('should call create service method if modalMode is Create', () => {
      component.modalMode = ModalMode.Create;
      component.save();
      expect(mockWanFormService.createOneWanForm).toHaveBeenCalledWith({
        wanForm: {
          name: 'testName',
          description: 'testDescription',
          datacenterId: 'testDatacenterId',
        },
      });
    });

    it('should call update service method if modalMode is Edit', () => {
      component.modalMode = ModalMode.Edit;
      component.wanFormId = 'testWanFormId';
      component.save();
      expect(mockWanFormService.updateOneWanForm).toHaveBeenCalledWith({
        id: 'testWanFormId',
        wanForm: {
          name: 'testName',
          description: 'testDescription',
          datacenterId: 'testDatacenterId',
        },
      });
    });

    it('should call closeModal after successful save', () => {
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.save();
      expect(closeModalSpy).toHaveBeenCalled();
    });
  });
});
