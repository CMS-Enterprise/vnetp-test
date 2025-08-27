import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import {
  V1NetworkScopeFormsInternalRoutesService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  V2AppCentricVrfsService,
} from '../../../../../../client';
import { MockNgxSmartModalComponent, MockFontAwesomeComponent } from '../../../../../test/mock-components';
import { ApplicationMode } from '../../../../models/other/application-mode-enum';
import { ModalMode } from '../../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../../services/datacenter-context.service';
import { InternalRouteModalComponent } from './internal-route-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

describe('InternalRouteModalComponent', () => {
  let component: InternalRouteModalComponent;
  let fixture: ComponentFixture<InternalRouteModalComponent>;
  let mockRoute: any;
  let mockDatacenterContextService: any;
  let mockNgxSmartModalService: any;
  let mockInternalRouteService: any;
  let mockNetcentricSubnetService: any;
  let mockAppcentricSubnetService: any;
  let mockVrfService: any;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    formBuilder = new FormBuilder();

    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({
        wanFormId: 'testWanFormId',
        modalMode: 'Edit',
        internalRoute: {
          id: 'testInternalRouteId',
          name: 'testName',
          description: 'testDescription',
          vrf: 'testVRF',
          environment: 'testEnvironment',
        },
      }),
    };

    mockVrfService = {
      getOneVrf: jest.fn().mockReturnValue(of({ externalVrfs: ['testVRF'] })),
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

    mockInternalRouteService = {
      createOneInternalRoute: jest.fn().mockReturnValue(of({})),
      updateOneInternalRoute: jest.fn().mockReturnValue(of({})),
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
      imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatTooltipModule, NoopAnimationsModule],
      declarations: [InternalRouteModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsInternalRoutesService, useValue: mockInternalRouteService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1NetworkSubnetsService, useValue: mockNetcentricSubnetService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockAppcentricSubnetService },
        { provide: V2AppCentricVrfsService, useValue: mockVrfService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalRouteModalComponent);
    component = fixture.componentInstance;
    component.vrfId = 'vrfId';
    component.buildForm();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal', () => {
    const closeSpy = jest.spyOn(mockNgxSmartModalService, 'close');
    component.closeModal();
    expect(closeSpy).toHaveBeenCalledWith('internalRouteModal');
  });

  describe('getData', () => {
    it('should set form values and disable name control', () => {
      const formControls = component.form.controls;

      component.getData();

      expect(formControls.name.value).toBe('testName');
      expect(formControls.name.disabled).toBe(true);
      expect(formControls.description.value).toBe('testDescription');
    });

    it('should reset modal data after processing', () => {
      component.getData();

      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('internalRouteModal');
    });

    it('should not disable name control if internalRoute is undefined', () => {
      mockNgxSmartModalService.getModalData.mockReturnValueOnce({
        wanFormId: 'testWanFormId',
        modalMode: 'Create',
        internalRoute: undefined,
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
      expect(component.form.contains('exportedToVrfs')).toBeTruthy();
      expect(component.form.contains('netcentricSubnetId')).toBeTruthy();
      expect(component.form.contains('appcentricSubnetId')).toBeTruthy();

      const nameControl = component.form.get('name');
      const descriptionControl = component.form.get('description');
      const exportedToVrfsControl = component.form.get('exportedToVrfs');

      expect(nameControl?.validator).toBeTruthy();
      expect(descriptionControl?.validator).toBeTruthy();
      expect(exportedToVrfsControl?.validator).toBeTruthy();
    });
  });

  describe('save', () => {
    beforeEach(() => {
      component.modalMode = ModalMode.Create;
      component.applicationMode = ApplicationMode.NETCENTRIC;
      component.wanForm = { id: 'testWanFormId' } as any;
      (component as any).datacenterId = 'testDatacenterId';
      (component as any).buildForm();
      component.form.setValue({
        name: 'testName',
        description: 'testDescription',
        exportedToVrfs: ['testVRF'],
        netcentricSubnetId: 'testNetcentricSubnetId',
        appcentricSubnetId: 'testAppcentricSubnetId',
      });
    });

    it('should return early if form is invalid', () => {
      component.form.controls.name.setErrors({ incorrect: true });
      component.save();
      expect(mockInternalRouteService.createOneInternalRoute).not.toHaveBeenCalled();
    });

    it('should create internalRoute object with correct values', () => {
      component.save();

      expect(mockInternalRouteService.createOneInternalRoute).toHaveBeenCalledWith({
        internalRoute: {
          name: 'testName',
          description: 'testDescription',
          exportedToVrfs: ['testVRF'],
          wanFormId: 'testWanFormId',
          datacenterId: 'testDatacenterId',
          netcentricSubnetId: 'testNetcentricSubnetId',
          appcentricSubnetId: 'testAppcentricSubnetId',
        },
      });
    });

    it('should call create service method if modalMode is Create', () => {
      component.save();
      expect(mockInternalRouteService.createOneInternalRoute).toHaveBeenCalled();
      expect(mockInternalRouteService.updateOneInternalRoute).not.toHaveBeenCalled();
    });

    it('should call update service method if modalMode is Edit', () => {
      component.modalMode = ModalMode.Edit;
      component.internalRouteId = 'testInternalRouteId';
      component.save();

      expect(mockInternalRouteService.updateOneInternalRoute).toHaveBeenCalledWith({
        id: 'testInternalRouteId',
        internalRoute: {
          name: 'testName',
          description: 'testDescription',
          exportedToVrfs: ['testVRF'],
          datacenterId: 'testDatacenterId',
        },
      });
      expect(mockInternalRouteService.createOneInternalRoute).not.toHaveBeenCalled();
    });

    it('should delete appcentricSubnetId if currentDcsMode is netcentric', () => {
      component.applicationMode = ApplicationMode.NETCENTRIC;
      component.save();

      expect(mockInternalRouteService.createOneInternalRoute).toHaveBeenCalledWith({
        internalRoute: {
          name: 'testName',
          description: 'testDescription',
          exportedToVrfs: ['testVRF'],
          wanFormId: 'testWanFormId',
          datacenterId: 'testDatacenterId',
          netcentricSubnetId: 'testNetcentricSubnetId',
          appcentricSubnetId: 'testAppcentricSubnetId',
        },
      });
    });

    it('should delete netcentricSubnetId if currentDcsMode is appcentric', () => {
      component.applicationMode = ApplicationMode.APPCENTRIC;
      component.save();

      expect(mockInternalRouteService.createOneInternalRoute).toHaveBeenCalledWith({
        internalRoute: {
          name: 'testName',
          description: 'testDescription',
          exportedToVrfs: ['testVRF'],
          wanFormId: 'testWanFormId',
          datacenterId: 'testDatacenterId',
          appcentricSubnetId: 'testAppcentricSubnetId',
          netcentricSubnetId: 'testNetcentricSubnetId',
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
      component.wanForm = { tenantId: 'testTenantId' } as any;
      component.getAppcentricSubnets();

      expect(mockAppcentricSubnetService.getManyAppCentricSubnet).toHaveBeenCalledWith({
        filter: ['tenantId||eq||testTenantId'],
        relations: ['tenant', 'bridgeDomain'],
      });
    });

    it('should assign the returned data to availableAppcentricSubnets', () => {
      component.wanForm = { tenantId: 'testTenantId' } as any;
      component.getAppcentricSubnets();

      expect(component.availableAppcentricSubnets).toEqual([
        { id: 'appcentricSubnetId1', name: 'Appcentric Subnet 1' },
        { id: 'appcentricSubnetId2', name: 'Appcentric Subnet 2' },
      ]);
    });
  });
});
