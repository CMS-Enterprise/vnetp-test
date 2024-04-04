import { TestBed } from '@angular/core/testing';
import { F5ConfigService } from './f5-config.service';

describe('F5ConfigService', () => {
  let service: F5ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [F5ConfigService],
    });

    service = TestBed.inject(F5ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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
});
