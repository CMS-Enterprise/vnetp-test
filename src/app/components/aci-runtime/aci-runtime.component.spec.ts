import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AciRuntimeComponent } from './aci-runtime.component';
import { V1RuntimeDataAciRuntimeService } from '../../../../client';
import { ActivatedRoute } from '@angular/router';
import { RuntimeDataService } from '../../services/runtime-data.service';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import { MockComponent, MockFontAwesomeComponent } from '../../../test/mock-components';
import { of, throwError } from 'rxjs';

describe('AciRuntimeComponent', () => {
  let component: AciRuntimeComponent;
  let fixture: ComponentFixture<AciRuntimeComponent>;
  let mockRoute;
  let mockDatacetnerContextService;
  let mockRuntimeDataService;
  let mockAciRuntimeService;

  beforeEach(async () => {
    mockRoute = {
      paramMap: of({}),
    };

    mockDatacetnerContextService = {
      currentDatacenter: of({ id: '1' }),
    };

    mockRuntimeDataService = {
      calculateTimeDifference: jest.fn().mockReturnValue('1'),
      isRecentlyRefreshed: jest.fn().mockReturnValue(false),
      pollJobStatus: jest.fn(),
    };

    mockAciRuntimeService = {
      getManyAciRuntime: jest.fn().mockReturnValue(of([{ id: '1' }])),
      createRuntimeDataJobAciRuntime: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [
        AciRuntimeComponent,
        MockComponent({ selector: 'app-lite-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
      ],
      providers: [
        { provide: V1RuntimeDataAciRuntimeService, useValue: mockAciRuntimeService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: RuntimeDataService, useValue: mockRuntimeDataService },
        { provide: DatacenterContextService, useValue: mockDatacetnerContextService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AciRuntimeComponent);
    component = fixture.componentInstance;
    component.endpointGroup = { id: '1' } as any;
    jest.spyOn(component, 'getAciRuntimeData').mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getAciRuntimeData', () => {
    beforeEach(() => {
      (component.getAciRuntimeData as jest.Mock).mockRestore();
    });

    it('should query by vlan id when vlan is defined', () => {
      component.vlan = { id: '1' } as any;
      component.getAciRuntimeData();
      expect(mockAciRuntimeService.getManyAciRuntime).toHaveBeenCalledWith({ filter: ['vlanId||eq||1'] });
    });

    it('should query by endpoint group id when vlan is not defined', () => {
      component.vlan = undefined;
      component.getAciRuntimeData();
      expect(mockAciRuntimeService.getManyAciRuntime).toHaveBeenCalledWith({ filter: ['endpointGroupId||eq||1'] });
    });
  });

  describe('refreshRuntimeData', () => {
    it('should return if isRecentlyRefreshed is true', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(true);
      const serviceSpy = jest.spyOn(mockAciRuntimeService, 'createRuntimeDataJobAciRuntime');
      component.refreshRuntimeData();
      expect(serviceSpy).not.toHaveBeenCalled();
    });

    it('should return if isRefreshingRuntimeData is true', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
      const serviceSpy = jest.spyOn(mockAciRuntimeService, 'createRuntimeDataJobAciRuntime');
      component.isRefreshingRuntimeData = true;
      component.refreshRuntimeData();
      expect(serviceSpy).not.toHaveBeenCalled();
    });

    it('should call getAciRuntimeData when polling is complete', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
      component.isRefreshingRuntimeData = false;
      jest.spyOn(mockAciRuntimeService, 'createRuntimeDataJobAciRuntime').mockReturnValue(of({ id: '1' }));
      jest.spyOn(mockRuntimeDataService, 'pollJobStatus').mockReturnValue(of({ status: 'successful' }));
      const getAciRuntimeDataSpy = jest.spyOn(component, 'getAciRuntimeData');
      component.refreshRuntimeData();
      expect(getAciRuntimeDataSpy).toHaveBeenCalled();
      expect(component.jobStatus).toEqual('successful');
    });

    it('should set jobStatus to error when polling errors', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
      component.isRefreshingRuntimeData = false;
      jest.spyOn(mockAciRuntimeService, 'createRuntimeDataJobAciRuntime').mockReturnValue(of({ id: '1' }));
      jest.spyOn(mockRuntimeDataService, 'pollJobStatus').mockReturnValue(throwError('Polling error'));
      component.refreshRuntimeData();
      expect(component.jobStatus).toEqual('error');
    });
  });

  describe('getTooltipMessage', () => {
    it('should return "Job Status: Failed" when status is "failed"', () => {
      const message = component.getTooltipMessage('failed');
      expect(message).toEqual('Job Status: Failed');
    });

    it('should return "Job Status: Timeout" when status is "running"', () => {
      const message = component.getTooltipMessage('running');
      expect(message).toEqual('Job Status: Timeout');
    });

    it('should return "An error occurred during polling" when status is "error"', () => {
      const message = component.getTooltipMessage('error');
      expect(message).toEqual('An error occurred during polling');
    });

    it('should return an status string for any other status', () => {
      const message = component.getTooltipMessage('success');
      expect(message).toEqual('success');
    });
  });
});
