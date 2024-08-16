import { TestBed } from '@angular/core/testing';
import { F5ConfigService } from './f5-config.service';
import { V1RuntimeDataF5ConfigService, VirtualServer } from '../../../../client';
import { of } from 'rxjs';
import { F5PartitionInfo } from '../../../../client';

describe('F5ConfigService', () => {
  let service: F5ConfigService;
  let mockV1F5ConfigService: any;

  beforeEach(() => {
    mockV1F5ConfigService = {
      getManyF5Config: jest.fn().mockReturnValue(of()),
    };
    TestBed.configureTestingModule({
      providers: [F5ConfigService, { provide: V1RuntimeDataF5ConfigService, useValue: mockV1F5ConfigService }],
    });

    service = TestBed.inject(F5ConfigService);
  });

  describe('filterVirtualServers', () => {
    it('should filter virtual servers correctly based on query', () => {
      const partitionInfo: F5PartitionInfo[] = [
        {
          name: 'partition1',
          virtualServers: [
            { name: 'server1', poolReference: { items: { membersReference: { items: [{ name: 'member1' }] } } } } as VirtualServer,
            { name: 'server2' } as VirtualServer,
          ],
        },
      ];
      const query = 'server1';
      const filtered = service.filterVirtualServers(partitionInfo, query);

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('partition1');
      expect(filtered[0].virtualServers?.length).toBe(1);
      expect(filtered[0].virtualServers?.[0].name).toBe('server1');
    });

    it('should return empty array if no match found', () => {
      const partitionInfo: F5PartitionInfo[] = [
        {
          name: 'partition1',
          virtualServers: [
            { name: 'server1', poolReference: { items: { membersReference: { items: [{ name: 'member1' }] } } } } as VirtualServer,
            { name: 'server2' } as VirtualServer,
          ],
        },
      ];
      const query = 'server3';
      const filtered = service.filterVirtualServers(partitionInfo, query);

      expect(filtered.length).toBe(0);
    });

    it('should return empty array if virtualServers is empty', () => {
      const partitionInfo: F5PartitionInfo[] = [
        {
          name: 'partition1',
          virtualServers: [],
        },
      ];
      const query = 'server1';
      const filtered = service.filterVirtualServers(partitionInfo, query);

      expect(filtered.length).toBe(0);
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

  describe('getVirtualServerCertSearch', () => {
    it('should return a concatenated string of cert properties when all properties are present', () => {
      const virtualServer: VirtualServer = {
        certsReference: [
          {
            name: 'default.crt',
            subject: 'CN=localhost.localdomain',
            expirationDate: 1957899604,
            expirationString: 'Jan 16 21:00:04 2032 GMT',
          },
        ],
      } as VirtualServer;

      const result = service.getVirtualServerCertSearch(virtualServer);
      expect(result).toBe('default.crt CN=localhost.localdomain 1957899604 Jan 16 21:00:04 2032 GMT');
    });

    it('should handle missing properties and return only existing values', () => {
      const virtualServer: VirtualServer = {
        certsReference: [
          {
            name: 'default.crt',
            subject: 'CN=localhost.localdomain',
            expirationDate: 1957899604,
          },
        ],
      } as VirtualServer;

      const result = service.getVirtualServerCertSearch(virtualServer);
      expect(result).toBe('default.crt CN=localhost.localdomain 1957899604');
    });

    it('should return an empty string if certsReference is empty', () => {
      const virtualServer: VirtualServer = {
        certsReference: [],
      } as VirtualServer;

      const result = service.getVirtualServerCertSearch(virtualServer);
      expect(result).toBe('');
    });

    it('should return an empty string if certsReference is undefined', () => {
      const virtualServer: VirtualServer = {} as VirtualServer;

      const result = service.getVirtualServerCertSearch(virtualServer);
      expect(result).toBe('');
    });
  });
});
