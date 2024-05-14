import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { F5ConfigCardComponent } from './f5-config-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { F5ConfigService } from '../f5-config.service';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { V1RuntimeDataF5ConfigService } from '../../../../../client';
import { MockFontAwesomeComponent } from '../../../../test/mock-components';
import { of, throwError } from 'rxjs';

describe('F5ConfigCardComponent', () => {
  let component: F5ConfigCardComponent;
  let fixture: ComponentFixture<F5ConfigCardComponent>;
  let mockF5ConfigStateManagementService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockRuntimeDataService: any;
  let mockF5ConfigService: any;

  beforeEach(() => {
    mockRuntimeDataService = {
      calculateTimeDifference: jest.fn().mockReturnValue('1'),
      isRecentlyRefreshed: jest.fn().mockReturnValue(false),
      pollJobStatus: jest.fn(),
    };
    mockF5ConfigStateManagementService = {
      changeF5Config: jest.fn(),
      f5Configs: [],
    };
    mockF5ConfigService = {
      createRuntimeDataJobF5Config: jest.fn(),
      getManyF5Config: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockActivatedRoute = {
      snapshot: {
        queryParams: { testParam: 'test' },
      },
    };
    TestBed.configureTestingModule({
      declarations: [F5ConfigCardComponent, MockFontAwesomeComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: F5ConfigService, useValue: mockF5ConfigStateManagementService },
        { provide: RuntimeDataService, useValue: mockRuntimeDataService },
        { provide: V1RuntimeDataF5ConfigService, useValue: mockF5ConfigService },
      ],
    });
    fixture = TestBed.createComponent(F5ConfigCardComponent);
    component = fixture.componentInstance;
    component.f5Config = {
      id: 'id',
      data: {
        hostInfo: {
          softwareVersion: 1,
          availability: { status: 'available' },
        },
      },
      hostname: 'hostname',
      runtimeDataLastRefreshed: new Date(),
    } as any;
    fixture.detectChanges();
  });

  it('should initialize properties correctly', () => {
    expect(component.softwareVersion).toEqual(1);
    expect(component.highAvailabilityStatus).toEqual('available');
    expect(component.hostName).toEqual('hostname');
    expect(component.lastRefreshed).toBeDefined();
    expect(component.lastRefreshed).toEqual('1');
  });

  describe('navigateToDetails', () => {
    it('should navigate to the details page with correct parameters', () => {
      component.navigateToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/f5-config/partitions', component.f5Config.id], {
        relativeTo: mockActivatedRoute,
        queryParams: mockActivatedRoute.snapshot.queryParams,
      });
    });
  });

  describe('refreshF5Config', () => {
    beforeEach(() => {
      // Reset shared conditions
      component.isRefreshingRuntimeData = false;
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
    });

    it('should not proceed if already refreshed recently or currently refreshing', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(true); // Simulate recently refreshed
      component.refreshF5Config();
      expect(mockF5ConfigService.createRuntimeDataJobF5Config).not.toHaveBeenCalled();

      component.isRefreshingRuntimeData = true; // Simulate currently refreshing
      component.refreshF5Config();
      expect((component as any).f5ConfigService.createRuntimeDataJobF5Config).not.toHaveBeenCalled();
    });

    it('should handle job creation and poll status until completion', fakeAsync(() => {
      // Mock job creation response
      const jobCreationResponse = of({ id: 'jobId' });
      jest.spyOn(mockF5ConfigService, 'createRuntimeDataJobF5Config').mockReturnValue(jobCreationResponse);
      jest
        .spyOn(mockF5ConfigService, 'getManyF5Config')
        .mockReturnValue(of([{ id: 'id', data: { hostInfo: { softwareVersion: 2, availability: { status: 'available' } } } }]));
      mockF5ConfigStateManagementService.f5Configs = [
        { id: 'id', data: { hostInfo: { softwareVersion: 1, availability: { status: 'available' } } } },
      ];
      const updateSpy = jest.spyOn(component, 'initilizeValues').mockImplementation();

      // Mock polling response with different statuses
      const statuses = ['successful', 'failed', 'running'];
      const jobStatusResponses = statuses.map(status => of({ status }));
      jest
        .spyOn(mockRuntimeDataService, 'pollJobStatus')
        .mockReturnValueOnce(jobStatusResponses[0]) // successful
        .mockReturnValueOnce(jobStatusResponses[1]) // failed
        .mockReturnValueOnce(jobStatusResponses[2]); // running

      // Successful job status
      component.refreshF5Config();
      tick();
      expect(updateSpy).toHaveBeenCalled();
      expect(component.isRefreshingRuntimeData).toBeFalsy();

      // Failed job status
      component.refreshF5Config();
      tick();
      expect(component.jobStatus).toEqual('failed');
      expect(component.isRefreshingRuntimeData).toBeFalsy();

      // Running job status - assuming it eventually completes or fails in real scenario
      component.refreshF5Config();
      tick();
      expect(component.jobStatus).toEqual('running');
      expect(component.isRefreshingRuntimeData).toBeFalsy(); // This would be set to false when polling completes or fails
    }));

    it('should set job status to error on polling error', fakeAsync(() => {
      // Mock job creation response
      jest.spyOn(mockF5ConfigService, 'createRuntimeDataJobF5Config').mockReturnValue(of({ id: 'jobId' }));

      // Mock polling to throw an error
      jest.spyOn(mockRuntimeDataService, 'pollJobStatus').mockReturnValue(throwError(() => new Error('Polling failed')));

      component.refreshF5Config();
      tick();

      expect(component.jobStatus).toEqual('error');
      expect(component.isRefreshingRuntimeData).toBeFalsy();
    }));
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
