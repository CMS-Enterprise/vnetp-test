import { SortVirtualServersByStatusPipe } from './sort-servers-by-status.pipe';

describe('SortVirtualServersByStatusPipe', () => {
  let pipe: SortVirtualServersByStatusPipe;

  beforeEach(() => {
    pipe = new SortVirtualServersByStatusPipe();
  });

  it('should return an empty array for invalid inputs', () => {
    expect(pipe.transform(null)).toEqual([]);
    expect(pipe.transform(undefined)).toEqual([]);
    expect(pipe.transform('not an array' as any)).toEqual([]);
  });

  it('should correctly sort virtual servers by status', () => {
    const virtualServers = [
      {
        // Priority 1: 'available' & 'disabled' (Black)
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'available' },
              'status.enabledState': { description: 'disabled' },
            },
          },
        },
      },
      {
        // Priority 2: 'offline' (Red)
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'offline' },
            },
          },
        },
      },
      {
        // Priority 4: 'available' & 'enabled' (Green)
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'available' },
              'status.enabledState': { description: 'enabled' },
            },
          },
        },
      },
      {}, // Priority 3: Undefined status (Blue)
    ];

    const sortedServers = pipe.transform(virtualServers);
    expect(sortedServers[0]).toEqual(virtualServers[0]); // First: 'available' & 'disabled' (Black)
    expect(sortedServers[1]).toEqual(virtualServers[1]); // Second: 'offline' (Red)
    expect(sortedServers[2]).toEqual(virtualServers[2]); // Third: Undefined status (Blue)
    expect(sortedServers[3]).toEqual(virtualServers[3]); // Last: 'available' & 'enabled' (Green)
  });
});
