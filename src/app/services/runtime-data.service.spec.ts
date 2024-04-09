import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RuntimeDataService } from './runtime-data.service';
import { of } from 'rxjs';
import { V1JobsService } from '../../../client';

describe('RuntimeDataService', () => {
  let service: RuntimeDataService;
  let jobsServiceMock: any;

  beforeEach(() => {
    jobsServiceMock = {
      getJobStatusJob: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [RuntimeDataService, { provide: V1JobsService, useValue: jobsServiceMock }],
    });

    service = TestBed.inject(RuntimeDataService);
  });

  describe('calculateTimeDifference', () => {
    it('should return "-" for null or undefined timestamps', () => {
      expect(service.calculateTimeDifference(null)).toEqual('-');
      expect(service.calculateTimeDifference(undefined)).toEqual('-');
    });

    it('should return correct time difference string for various cases', () => {
      const now = new Date();

      // Mocking Date.now() to return the current timestamp for consistency in tests
      jest.spyOn(global.Date, 'now').mockImplementation(() => now.getTime());

      // Test cases for seconds, minutes, hours, and days
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      // More cases can be added similarly

      expect(service.calculateTimeDifference(oneHourAgo)).toContain('hour ago');
      expect(service.calculateTimeDifference(oneDayAgo)).toContain('day ago');
    });

    it('should return the correct minute difference', () => {
      // Mock Date.now() to return a fixed timestamp
      const now = new Date('2020-01-01T00:05:00Z').getTime(); // Fixed current time
      jest.spyOn(global.Date, 'now').mockReturnValue(now);

      // Test case for 1 minute ago
      const oneMinuteAgo = new Date('2020-01-01T00:04:00Z').toISOString();
      expect(service.calculateTimeDifference(oneMinuteAgo)).toEqual('1 minute ago');

      // Test case for multiple minutes ago
      const fiveMinutesAgo = new Date('2020-01-01T00:00:00Z').toISOString();
      expect(service.calculateTimeDifference(fiveMinutesAgo)).toEqual('5 minutes ago');

      // Restore the original Date.now function
      jest.restoreAllMocks();
    });

    it('should return the correct second difference', () => {
      // Mock Date.now() to return a fixed timestamp
      const now = new Date('2020-01-01T00:00:50Z').getTime(); // Fixed current time
      jest.spyOn(global.Date, 'now').mockReturnValue(now);

      // Test case for 1 second ago
      const oneSecondAgo = new Date('2020-01-01T00:00:49Z').toISOString();
      expect(service.calculateTimeDifference(oneSecondAgo)).toEqual('1 second ago');

      // Test case for multiple seconds ago
      const thirtySecondsAgo = new Date('2020-01-01T00:00:20Z').toISOString();
      expect(service.calculateTimeDifference(thirtySecondsAgo)).toEqual('30 seconds ago');

      // Restore the original Date.now function
      jest.restoreAllMocks();
    });

    it('should return the correct day difference with pluralization', () => {
      // Mock Date.now() to return a fixed timestamp
      const now = new Date('2020-01-03T00:00:00Z').getTime(); // Fixed current time
      jest.spyOn(global.Date, 'now').mockReturnValue(now);

      // Test case for 2 days ago
      const twoDaysAgo = new Date('2020-01-01T00:00:00Z').toISOString();
      expect(service.calculateTimeDifference(twoDaysAgo)).toEqual('2 days ago');

      // Restore the original Date.now function
      jest.restoreAllMocks();
    });

    it('should return the correct hour difference with pluralization', () => {
      // Mock Date.now() to return a fixed timestamp
      const now = new Date('2020-01-01T03:00:00Z').getTime(); // Fixed current time
      jest.spyOn(global.Date, 'now').mockReturnValue(now);

      // Test case for 2 hours ago
      const twoHoursAgo = new Date('2020-01-01T01:00:00Z').toISOString();
      expect(service.calculateTimeDifference(twoHoursAgo)).toEqual('2 hours ago');

      // Restore the original Date.now function
      jest.restoreAllMocks();
    });
  });

  describe('isRecentlyRefreshed', () => {
    it('should return false for null or undefined timestamps', () => {
      expect(service.isRecentlyRefreshed(null)).toBeFalsy();
      expect(service.isRecentlyRefreshed(undefined)).toBeFalsy();
    });

    it('should return true if the timestamp is within the threshold', () => {
      const recentTimestamp = new Date(Date.now() - 30 * 1000).toISOString(); // 30 seconds ago
      expect(service.isRecentlyRefreshed(recentTimestamp)).toBeTruthy();
    });

    it('should return false if the timestamp is outside the threshold', () => {
      const oldTimestamp = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 minutes ago
      expect(service.isRecentlyRefreshed(oldTimestamp)).toBeFalsy();
    });
  });

  describe('pollJobStatus', () => {
    it('should stop polling when the job status is not running or max attempts reached', fakeAsync(() => {
      const jobId = 'testJob';
      let pollCount = 0;
      const mockJobStatusResponses = [
        { id: jobId, status: 'running' },
        { id: jobId, status: 'running' },
        { id: jobId, status: 'success' }, // Assume success on the third attempt
      ];

      // eslint-disable-next-line arrow-body-style
      jobsServiceMock.getJobStatusJob.mockImplementation(() => {
        return of(mockJobStatusResponses[pollCount++]);
      });

      const emittedStatuses = [];
      service.pollJobStatus(jobId, 10, 3).subscribe(status => {
        emittedStatuses.push(status);
      });

      // Simulate the passage of time for all polling attempts
      // 10ms * number of responses since pollCount will increment per response
      tick(10 * mockJobStatusResponses.length);
      const result = [
        { id: jobId, status: 'running' },
        { id: jobId, status: 'running' },
        { id: jobId, status: 'success' },
      ];

      // Assertions
      expect(emittedStatuses).toEqual(result);
      expect(jobsServiceMock.getJobStatusJob).toHaveBeenCalledTimes(mockJobStatusResponses.length);
    }));
  });
});
