import { TestBed } from '@angular/core/testing';
import { F5ConfigService } from './f5-config.service';
import { V1RuntimeDataF5ConfigService } from '../../../../client';
import { of } from 'rxjs';

describe('F5ConfigService', () => {
  let service: F5ConfigService;
  let mockV1F5ConfigService: any;
  beforeEach(() => {
    mockV1F5ConfigService = {
      getManyF5Config: jest.fn().mockReturnValue(of()),
    };
    TestBed.configureTestingModule({
      imports: [],
      providers: [F5ConfigService, { provide: V1RuntimeDataF5ConfigService, useValue: mockV1F5ConfigService }],
    });

    service = TestBed.inject(F5ConfigService);
  });

  describe('filterVirtualServers', () => {
    it('should filter virtual servers correctly based on query', () => {
      const partitionInfo = {
        partition1: [
          { name: 'server1', poolReference: { items: { membersReference: { items: [{ name: 'member1' }] } } } },
          { name: 'server2' },
        ],
      };
      const query = 'server1';
      const filtered = service.filterVirtualServers(partitionInfo, query);
      expect(Object.keys(filtered)).toContain('partition1');
      expect(filtered.partition1.length).toBe(1);
      expect(filtered.partition1[0].name).toBe('server1');
    });

    it('should return empty object if no match found', () => {
      const partitionInfo = {
        partition1: [
          { name: 'server1', poolReference: { items: { membersReference: { items: [{ name: 'member1' }] } } } },
          { name: 'server2' },
        ],
      };
      const query = 'server3';
      const filtered = service.filterVirtualServers(partitionInfo, query);
      expect(Object.keys(filtered)).toContain('partition1');
      expect(filtered.partition1.length).toBe(0);
    });

    it('should return empty object if virtualServers is empty', () => {
      const partitionInfo = { partition1: [] };
      const query = 'server1';
      const filtered = service.filterVirtualServers(partitionInfo, query);
      expect(filtered.partition1.length).toBe(0);
    });
  });

  describe('getVirtualServerStatus', () => {
    it('should return "up" for available and enabled virtual servers', () => {
      const virtualServer = {
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'available' },
              'status.enabledState': { description: 'enabled' },
            },
          },
        },
      };
      expect(service.getVirtualServerStatus(virtualServer)).toEqual('up');
    });

    it('should return "disabled" for available and disabled virtual servers', () => {
      const virtualServer = {
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'available' },
              'status.enabledState': { description: 'disabled' },
            },
          },
        },
      };
      expect(service.getVirtualServerStatus(virtualServer)).toEqual('disabled');
    });

    it('should return "down" for offline virtual servers', () => {
      const virtualServer = {
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'offline' },
              // Note: enabledState could be anything here, but offline dominates
              'status.enabledState': { description: 'anyState' },
            },
          },
        },
      };
      expect(service.getVirtualServerStatus(virtualServer)).toEqual('down');
    });

    it('should return "unknown" for any other states', () => {
      // Example where neither condition matches exactly, e.g., missing states
      const virtualServerMissingStates = {
        stats: {
          nestedStats: {
            entries: {},
          },
        },
      };
      expect(service.getVirtualServerStatus(virtualServerMissingStates)).toEqual('unknown');

      // Example with unexpected states
      const virtualServerUnexpectedStates = {
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'unexpected' },
              'status.enabledState': { description: 'unexpected' },
            },
          },
        },
      };
      expect(service.getVirtualServerStatus(virtualServerUnexpectedStates)).toEqual('unknown');
    });
  });
});
