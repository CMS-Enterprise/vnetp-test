import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UndeployedChangesService } from './undeployed-changes.service';
import { DatacenterContextService } from './datacenter-context.service';
import { V1TiersService } from '../../../client';

// Mock dependencies
const mockDatacenterContextService = {
  currentDatacenter: of({ id: 'datacenter1' }), // Mock Observable datacenter
};

const mockV1TiersService = {
  getManyTier: jest.fn().mockReturnValue(of({ data: [{ id: 'tier1', name: 'Tier 1' }] })), // Mock tier service response
};

describe('UndeployedChangesService', () => {
  let service: UndeployedChangesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UndeployedChangesService,
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1TiersService, useValue: mockV1TiersService },
      ],
    });

    service = TestBed.inject(UndeployedChangesService);
  });

  it('should subscribe to currentDatacenter and fetch undeployed changes on initialization', done => {
    service.undeployedChangeObjects.subscribe(objects => {
      expect(objects).toEqual([{ id: 'tier1', name: 'Tier 1' }]);
      done();
    });
  });

  jest.useFakeTimers();

  it('should periodically fetch undeployed changes', () => {
    const spy = jest.spyOn(service, 'getUndeployedChanges');

    jest.advanceTimersByTime(30 * 1000); // Advance time by 30 seconds

    expect(spy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(30 * 1000); // Advance again to simulate another interval

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should update observables correctly when getNetcentricChanges is called', done => {
    service.getNetcentricChanges(); // Manually call the method to simulate fetching changes

    service.undeployedChanges.subscribe(hasChanges => {
      expect(hasChanges).toBeTruthy();
      done();
    });
  });

  it('should throw an "Not implemented" error when getAppCentricChanges is called', () => {
    expect(() => service.getAppCentricChanges()).toThrow('Not implemented');
  });
});
