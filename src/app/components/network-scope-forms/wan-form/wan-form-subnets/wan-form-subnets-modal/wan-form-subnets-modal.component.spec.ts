import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormSubnetsModalComponent } from './wan-form-subnets-modal.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../../test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  V1NetworkScopeFormsWanFormSubnetService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
} from '../../../../../../../client';
import { DatacenterContextService } from '../../../../../services/datacenter-context.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalMode } from '../../../../../models/other/modal-mode';

describe('WanFormSubnetsModalComponent', () => {
  let component: WanFormSubnetsModalComponent;
  let fixture: ComponentFixture<WanFormSubnetsModalComponent>;
  let mockRoute: any;
  let mockDatacenterContextService: any;
  let mockNgxSmartModalService: any;
  let mockWanFormSubnetService: any;
  let mockNetcentricSubnetService: any;
  let mockAppcentricSubnetService: any;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    formBuilder = new FormBuilder();

    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({
        wanFormId: 'testWanFormId',
        modalMode: 'Edit',
        wanFormSubnet: {
          id: 'testWanFormSubnetId',
          name: 'testName',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
        },
      }),
    };
    mockRoute = {
      snapshot: {
        data: {
          mode: 'netcentric',
        },
        queryParams: {
          tenantId: undefined,
        },
      },
    };

    mockDatacenterContextService = {
      currentDatacenter: of({ id: 'datacenterId' }),
    };

    mockWanFormSubnetService = {
      createOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
      updateOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
    };

    mockNetcentricSubnetService = {
      getSubnetsByDatacenterIdSubnet: jest.fn().mockReturnValue(
        of([
          { id: 'netcentricSubnetId1', name: 'Netcentric Subnet 1' },
          { id: 'netcentricSubnetId2', name: 'Netcentric Subnet 2' },
        ]),
      ),
    };

    mockAppcentricSubnetService = {
      getManyAppCentricSubnet: jest.fn().mockReturnValue(
        of([
          { id: 'appcentricSubnetId1', name: 'Appcentric Subnet 1' },
          { id: 'appcentricSubnetId2', name: 'Appcentric Subnet 2' },
        ]),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [WanFormSubnetsModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsWanFormSubnetService, useValue: mockWanFormSubnetService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1NetworkSubnetsService, useValue: mockNetcentricSubnetService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockAppcentricSubnetService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormSubnetsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal', () => {
    const closeSpy = jest.spyOn(mockNgxSmartModalService, 'close');
    component.closeModal();
    expect(closeSpy).toHaveBeenCalledWith('wanFormSubnetModal');
  });

  describe('getData', () => {
    it('should get modal data and assign to component properties', () => {
      component.getData();

      expect(component.wanFormId).toBe('testWanFormId');
      expect(component.modalMode).toBe('Edit');
      expect(component.wanFormSubnetId).toBe('testWanFormSubnetId');
    });

    it('should set form values and disable name control', () => {
      const formControls = component.form.controls;

      component.getData();

      expect(formControls.name.value).toBe('testName');
      expect(formControls.name.disabled).toBe(true);
      expect(formControls.description.value).toBe('testDescription');
      expect(formControls.vrf.value).toBe('testVRF');
      expect(formControls.environment.value).toBe('testEnvironment');
    });

    it('should reset modal data after processing', () => {
      component.getData();

      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('wanFormSubnetModal');
    });

    it('should not disable name control if wanFormSubnet is undefined', () => {
      mockNgxSmartModalService.getModalData.mockReturnValueOnce({
        wanFormId: 'testWanFormId',
        modalMode: 'Create',
        wanFormSubnet: undefined,
      });

      component.getData();

      expect(component.form.controls.name.disabled).toBe(false);
    });
  });

  it('should reset form', () => {
    const resetSpy = jest.spyOn(component as any, 'buildForm');
    component.reset();
    expect(resetSpy).toHaveBeenCalled();
  });

  describe('buildForm', () => {
    it('should initialize the form with the specified controls and validators', () => {
      component.modalMode = ModalMode.Create;
      (component as any).buildForm();

      expect(component.form.contains('name')).toBeTruthy();
      expect(component.form.contains('description')).toBeTruthy();
      expect(component.form.contains('vrf')).toBeTruthy();
      expect(component.form.contains('environment')).toBeTruthy();
      expect(component.form.contains('netcentricSubnetId')).toBeTruthy();
      expect(component.form.contains('appcentricSubnetId')).toBeTruthy();

      const nameControl = component.form.get('name');
      const descriptionControl = component.form.get('description');
      const vrfControl = component.form.get('vrf');
      const environmentControl = component.form.get('environment');

      expect(nameControl?.validator).toBeTruthy();
      expect(descriptionControl?.validator).toBeTruthy();
      expect(vrfControl?.validator).toBeTruthy();
      expect(environmentControl?.validator).toBeTruthy();
    });
  });

  describe('save', () => {
    beforeEach(() => {
      component.modalMode = ModalMode.Create;
      component.currentDcsMode = 'netcentric';
      component.wanFormId = 'testWanFormId';
      (component as any).datacenterId = 'testDatacenterId';
      (component as any).buildForm();
      component.form.setValue({
        name: 'testName',
        description: 'testDescription',
        vrf: 'testVRF',
        environment: 'testEnvironment',
        netcentricSubnetId: 'testNetcentricSubnetId',
        appcentricSubnetId: 'testAppcentricSubnetId',
      });
    });

    it('should return early if form is invalid', () => {
      component.form.controls.name.setErrors({ incorrect: true });
      component.save();
      expect(mockWanFormSubnetService.createOneWanFormSubnet).not.toHaveBeenCalled();
    });

    it('should create wanFormSubnet object with correct values', () => {
      component.save();

      expect(mockWanFormSubnetService.createOneWanFormSubnet).toHaveBeenCalledWith({
        wanFormSubnet: {
          name: 'testName',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
          wanFormId: 'testWanFormId',
          datacenterId: 'testDatacenterId',
          netcentricSubnetId: 'testNetcentricSubnetId',
        },
      });
    });

    it('should call create service method if modalMode is Create', () => {
      component.save();
      expect(mockWanFormSubnetService.createOneWanFormSubnet).toHaveBeenCalled();
      expect(mockWanFormSubnetService.updateOneWanFormSubnet).not.toHaveBeenCalled();
    });

    it('should call update service method if modalMode is Edit', () => {
      component.modalMode = ModalMode.Edit;
      component.wanFormSubnetId = 'testWanFormSubnetId';
      component.save();

      expect(mockWanFormSubnetService.updateOneWanFormSubnet).toHaveBeenCalledWith({
        id: 'testWanFormSubnetId',
        wanFormSubnet: {
          name: 'testName',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
          datacenterId: 'testDatacenterId',
        },
      });
      expect(mockWanFormSubnetService.createOneWanFormSubnet).not.toHaveBeenCalled();
    });

    it('should delete appcentricSubnetId if currentDcsMode is netcentric', () => {
      component.currentDcsMode = 'netcentric';
      component.save();

      expect(mockWanFormSubnetService.createOneWanFormSubnet).toHaveBeenCalledWith({
        wanFormSubnet: {
          name: 'testName',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
          wanFormId: 'testWanFormId',
          datacenterId: 'testDatacenterId',
          netcentricSubnetId: 'testNetcentricSubnetId',
        },
      });
    });

    it('should delete netcentricSubnetId if currentDcsMode is appcentric', () => {
      component.currentDcsMode = 'appcentric';
      component.save();

      expect(mockWanFormSubnetService.createOneWanFormSubnet).toHaveBeenCalledWith({
        wanFormSubnet: {
          name: 'testName',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
          wanFormId: 'testWanFormId',
          datacenterId: 'testDatacenterId',
          appcentricSubnetId: 'testAppcentricSubnetId',
        },
      });
    });

    it('should call closeModal after successful create', () => {
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.save();

      expect(closeModalSpy).toHaveBeenCalled();
    });

    it('should call closeModal after successful update', () => {
      component.modalMode = ModalMode.Edit;
      const closeModalSpy = jest.spyOn(component, 'closeModal');
      component.save();

      expect(closeModalSpy).toHaveBeenCalled();
    });
  });

  describe('getNetcentricSubnets', () => {
    it('should call getSubnetsByDatacenterIdSubnet with the correct parameters', () => {
      (component as any).datacenterId = 'testDatacenterId';
      component.getNetcentricSubnets();

      expect(mockNetcentricSubnetService.getSubnetsByDatacenterIdSubnet).toHaveBeenCalledWith({
        datacenterId: 'testDatacenterId',
      });
    });

    it('should assign the returned data to availableNetcentricSubnets', () => {
      (component as any).datacenterId = 'testDatacenterId';
      component.getNetcentricSubnets();

      expect(component.availableNetcentricSubnets).toEqual([
        { id: 'netcentricSubnetId1', name: 'Netcentric Subnet 1' },
        { id: 'netcentricSubnetId2', name: 'Netcentric Subnet 2' },
      ]);
    });
  });

  describe('getAppcentricSubnets', () => {
    it('should call getManyAppCentricSubnet with the correct parameters', () => {
      component.tenantId = 'testTenantId';
      component.getAppcentricSubnets();

      expect(mockAppcentricSubnetService.getManyAppCentricSubnet).toHaveBeenCalledWith({
        filter: ['tenantId||eq||testTenantId'],
        relations: ['tenant', 'bridgeDomain'],
      });
    });

    it('should assign the returned data to availableAppcentricSubnets', () => {
      component.tenantId = 'testTenantId';
      component.getAppcentricSubnets();

      expect(component.availableAppcentricSubnets).toEqual([
        { id: 'appcentricSubnetId1', name: 'Appcentric Subnet 1' },
        { id: 'appcentricSubnetId2', name: 'Appcentric Subnet 2' },
      ]);
    });
  });
});
