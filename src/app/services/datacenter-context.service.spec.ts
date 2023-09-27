/* eslint-disable */
import { TestBed } from '@angular/core/testing';
import { DatacenterContextService } from './datacenter-context.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { V1DatacentersService } from 'client';
import { AuthService } from './auth.service';
import { BehaviorSubject, of } from 'rxjs';

describe('DatacenterContextService', () => {
  let service: DatacenterContextService;

  beforeEach(() => {
    const authService = {
      currentUserValue: {},
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [DatacenterContextService, MockProvider(V1DatacentersService), { provide: AuthService, useValue: authService }],
    });
    service = TestBed.inject(DatacenterContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get current datacenter value', () => {
    const res = service.currentDatacenterValue;
    expect(res).toEqual(service['currentDatacenterSubject'].value);
  });

  it('should get current datacenter value (2)', () => {
    const res = service.datacentersValue;
    expect(res).toEqual(service['datacentersSubject'].value);
  });

  it('should get datacenterLockValue', () => {
    const res = service.datacenterLockValue;
    expect(res).toEqual(service['lockCurrentDatacenterSubject'].value);
  });

  it('should set the value of lockCurrentDatacenterSubject to true', () => {
    service['lockCurrentDatacenterSubject'] = new BehaviorSubject<boolean>(false);
    service.lockDatacenter();
    expect(service['lockCurrentDatacenterSubject'].value).toBe(true);
  });

  it('should set the value of lockCurrentDatacenterSubject to true', () => {
    service['lockCurrentDatacenterSubject'] = new BehaviorSubject<boolean>(false);
    service.unlockDatacenter();
    expect(service['lockCurrentDatacenterSubject'].value).toBe(false);
  });

  describe('getDatacenters', () => {
    let datacenterService: V1DatacentersService;

    beforeEach(() => {
      datacenterService = TestBed.inject(V1DatacentersService);
    });

    it('should fetch datacenters and select the specified datacenter if provided', done => {
      const datacentersMock = [
        { id: 'dc1', name: 'Datacenter 1' },
        { id: 'dc2', name: 'Datacenter 2' },
      ];
      const getManyDatacentersSpy = jest
        .spyOn(datacenterService, 'getManyDatacenters')
        .mockReturnValue(of({ data: datacentersMock } as any));

      const switchDatacenterSpy = jest.spyOn(service, 'switchDatacenter').mockImplementation(() => true);

      service['getDatacenters']('dc1');

      setTimeout(() => {
        expect(getManyDatacentersSpy).toHaveBeenCalled();
        expect(service['datacentersSubject'].value).toEqual(datacentersMock);
        expect(switchDatacenterSpy).toHaveBeenCalledWith('dc1');
        done();
      }, 0);
    });

    it('should return an array of tier ids in the current datacenter', () => {
      const currentDatacenterMock = {
        id: 'dc1',
        name: 'Datacenter 1',
        tiers: [
          { id: 'tier1', name: 'Tier 1' },
          { id: 'tier2', name: 'Tier 2' },
        ],
      } as any;

      service['currentDatacenterSubject'].next(currentDatacenterMock);

      const currentTiersValue = service.currentTiersValue;

      expect(currentTiersValue).toEqual(['tier1', 'tier2']);
    });

    it('should fetch datacenters and auto-select the single available datacenter', done => {
      const datacentersMock = [{ id: 'dc1', name: 'Datacenter 1' }];
      const getManyDatacentersSpy = jest
        .spyOn(datacenterService, 'getManyDatacenters')
        .mockReturnValue(of({ data: datacentersMock } as any));

      const switchDatacenterSpy = jest.spyOn(service, 'switchDatacenter').mockImplementation(() => true);

      service['getDatacenters']();

      setTimeout(() => {
        expect(getManyDatacentersSpy).toHaveBeenCalled();
        expect(service['datacentersSubject'].value).toEqual(datacentersMock);
        expect(switchDatacenterSpy).toHaveBeenCalledWith('dc1');
        done();
      }, 0);
    });

    it('should not call switchDatacenter if more than one datacenter is available and no datacenterParam is provided', done => {
      const datacentersMock = [
        { id: 'dc1', name: 'Datacenter 1' },
        { id: 'dc2', name: 'Datacenter 2' },
      ];
      const getManyDatacentersSpy = jest
        .spyOn(datacenterService, 'getManyDatacenters')
        .mockReturnValue(of({ data: datacentersMock } as any));

      const switchDatacenterSpy = jest.spyOn(service, 'switchDatacenter').mockImplementation(() => true);

      service['getDatacenters']();

      setTimeout(() => {
        expect(getManyDatacentersSpy).toHaveBeenCalled();
        expect(service['datacentersSubject'].value).toEqual(datacentersMock);
        expect(switchDatacenterSpy).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('refreshDatacenter', () => {
    it('should refresh datacenters and update the current datacenter', done => {
      const datacentersMock = [
        { id: 'dc1', name: 'Datacenter 1' },
        { id: 'dc2', name: 'Datacenter 2' },
      ];
      const currentDatacenterMock = { id: 'dc1', name: 'Datacenter 1' };

      service['currentDatacenterSubject'].next(currentDatacenterMock);

      const getManyDatacentersSpy = jest
        .spyOn(service['datacenterService'], 'getManyDatacenters')
        .mockReturnValue(of({ data: datacentersMock } as any));

      service.refreshDatacenter();

      setTimeout(() => {
        expect(getManyDatacentersSpy).toHaveBeenCalled();
        expect(service['datacentersSubject'].value).toEqual(datacentersMock);

        const currentDatacenter = service['currentDatacenterSubject'].value;
        expect(currentDatacenter).toEqual(currentDatacenterMock);
        done();
      }, 0);
    });
  });

  describe('switchDatacenter', () => {
    const datacenterId = 'test-datacenter-id';

    it('should return false if the datacenter id doesnt match', () => {
      service['_datacenters'] = [{ id: 'test-datacenter-id-2' }] as any;
      const result = service.switchDatacenter(datacenterId);
      expect(result).toBeFalsy();
    });

    it('should return false if isSameDatacenter', () => {
      service['_datacenters'] = [{ id: 'test-datacenter-id' }] as any;
      jest.spyOn(service, 'currentDatacenterValue', 'get').mockReturnValue({ id: 'test-datacenter-id' } as any);
      const result = service.switchDatacenter(datacenterId);
      expect(result).toBeFalsy();
    });

    it('should return true if datacenter isnt the same', () => {
      service['_datacenters'] = [{ id: 'test-datacenter-id' }] as any;
      jest.spyOn(service, 'currentDatacenterValue', 'get').mockReturnValue({ id: 'test-datacenter-id-2' } as any);
      const result = service.switchDatacenter(datacenterId);
      expect(result).toBeTruthy();
    });
  });
});
