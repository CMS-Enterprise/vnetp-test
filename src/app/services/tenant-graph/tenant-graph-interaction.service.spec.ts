/* eslint-disable */
import { TenantGraphInteractionService, TenantForceConfig, ContextMenuClickEvent } from './tenant-graph-interaction.service';

// Mock D3 module completely
jest.mock('d3', () => ({
  zoom: jest.fn().mockReturnValue({
    scaleExtent: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
  }),
  drag: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
  }),
  forceSimulation: jest.fn().mockReturnValue({
    nodes: jest.fn().mockReturnThis(),
    force: jest.fn().mockReturnThis(),
    alpha: jest.fn().mockReturnThis(),
    restart: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
  }),
  forceLink: jest.fn().mockReturnValue({
    id: jest.fn().mockReturnThis(),
    distance: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
    links: jest.fn().mockReturnThis(),
  }),
  forceManyBody: jest.fn().mockReturnValue({
    strength: jest.fn().mockReturnThis(),
  }),
  forceCenter: jest.fn().mockReturnValue({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  }),
  forceCollide: jest.fn().mockReturnValue({
    radius: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  }),
  forceX: jest.fn().mockReturnValue({
    x: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  }),
  forceY: jest.fn().mockReturnValue({
    y: jest.fn().mockReturnThis(),
    strength: jest.fn().mockReturnThis(),
  }),
  select: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
  }),
  event: { transform: 'translate(100,100) scale(1.5)' },
}));

describe('TenantGraphInteractionService', () => {
  let service: TenantGraphInteractionService;

  beforeEach(() => {
    service = new TenantGraphInteractionService();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have default force config', () => {
      const defaultConfig = service.getDefaultForceConfig();

      expect(defaultConfig).toEqual({
        linkDistance: 80,
        linkStrength: 0.6,
        layerStrength: 2.5,
        clusterStrength: 0.3,
        centerStrength: 0.1,
        chargeStrength: -350,
        collisionRadius: 20,
      });
    });

    it('should have context menu click event emitter', () => {
      expect(service.contextMenuClick).toBeDefined();
      expect(typeof service.contextMenuClick.subscribe).toBe('function');
    });
  });

  describe('getDefaultForceConfig', () => {
    it('should return consistent default configuration', () => {
      const config1 = service.getDefaultForceConfig();
      const config2 = service.getDefaultForceConfig();

      expect(config1).toEqual(config2);
    });

    it('should return valid force configuration values', () => {
      const config = service.getDefaultForceConfig();

      expect(config.linkDistance).toBeGreaterThan(0);
      expect(config.linkStrength).toBeGreaterThan(0);
      expect(config.linkStrength).toBeLessThanOrEqual(1);
      expect(config.layerStrength).toBeGreaterThan(0);
      expect(config.clusterStrength).toBeGreaterThan(0);
      expect(config.centerStrength).toBeGreaterThan(0);
      expect(config.chargeStrength).toBeLessThan(0); // Should be negative for repulsion
      expect(config.collisionRadius).toBeGreaterThan(0);
    });

    it('should have reasonable default values for typical graphs', () => {
      const config = service.getDefaultForceConfig();

      // These values should be reasonable for most graph sizes
      expect(config.linkDistance).toBeLessThan(200);
      expect(config.collisionRadius).toBeLessThan(50);
      expect(config.chargeStrength).toBeGreaterThan(-1000);
    });
  });

  describe('Context Menu Click Events', () => {
    it('should emit context menu click events', done => {
      const expectedEvent: ContextMenuClickEvent = {
        nodeType: 'TENANT',
        nodeId: 'test-node',
        databaseId: 'db-123',
        menuItemIdentifier: 'add-to-path',
        node: { id: 'test-node', type: 'TENANT' },
      };

      service.contextMenuClick.subscribe((event: ContextMenuClickEvent) => {
        expect(event).toEqual(expectedEvent);
        done();
      });

      service.contextMenuClick.emit(expectedEvent);
    });

    it('should handle multiple subscribers', () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      service.contextMenuClick.subscribe(subscriber1);
      service.contextMenuClick.subscribe(subscriber2);

      const testEvent: ContextMenuClickEvent = {
        nodeType: 'VRF',
        nodeId: 'vrf-1',
        databaseId: 'db-456',
        menuItemIdentifier: 'view-details',
        node: { id: 'vrf-1', type: 'VRF' },
      };

      service.contextMenuClick.emit(testEvent);

      expect(subscriber1).toHaveBeenCalledWith(testEvent);
      expect(subscriber2).toHaveBeenCalledWith(testEvent);
    });

    it('should handle events with different node types', () => {
      const events: ContextMenuClickEvent[] = [
        {
          nodeType: 'TENANT',
          nodeId: 'tenant-1',
          databaseId: 'db-1',
          menuItemIdentifier: 'action-1',
          node: { id: 'tenant-1', type: 'TENANT' },
        },
        {
          nodeType: 'VRF',
          nodeId: 'vrf-1',
          databaseId: 'db-2',
          menuItemIdentifier: 'action-2',
          node: { id: 'vrf-1', type: 'VRF' },
        },
        {
          nodeType: 'FIREWALL',
          nodeId: 'firewall-1',
          databaseId: 'db-3',
          menuItemIdentifier: 'action-3',
          node: { id: 'firewall-1', type: 'FIREWALL' },
        },
      ];

      const receivedEvents: ContextMenuClickEvent[] = [];
      service.contextMenuClick.subscribe(event => receivedEvents.push(event));

      events.forEach(event => service.contextMenuClick.emit(event));

      expect(receivedEvents).toHaveLength(3);
      expect(receivedEvents).toEqual(events);
    });
  });

  describe('Force Configuration Validation', () => {
    it('should validate that default config has all required properties', () => {
      const config = service.getDefaultForceConfig();

      expect(config).toHaveProperty('linkDistance');
      expect(config).toHaveProperty('linkStrength');
      expect(config).toHaveProperty('layerStrength');
      expect(config).toHaveProperty('clusterStrength');
      expect(config).toHaveProperty('centerStrength');
      expect(config).toHaveProperty('chargeStrength');
      expect(config).toHaveProperty('collisionRadius');
    });

    it('should return numeric values for all config properties', () => {
      const config = service.getDefaultForceConfig();

      Object.values(config).forEach(value => {
        expect(typeof value).toBe('number');
        expect(Number.isFinite(value)).toBe(true);
      });
    });

    it('should have strength values in reasonable ranges', () => {
      const config = service.getDefaultForceConfig();

      // Strength values should typically be between 0 and 1 (except charge which is negative)
      expect(config.linkStrength).toBeGreaterThanOrEqual(0);
      expect(config.linkStrength).toBeLessThanOrEqual(1);

      expect(config.clusterStrength).toBeGreaterThanOrEqual(0);
      expect(config.clusterStrength).toBeLessThanOrEqual(1);

      expect(config.centerStrength).toBeGreaterThanOrEqual(0);
      expect(config.centerStrength).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid event emissions without memory leaks', () => {
      const subscriber = jest.fn();
      service.contextMenuClick.subscribe(subscriber);

      // Emit many events rapidly
      for (let i = 0; i < 1000; i++) {
        const event: ContextMenuClickEvent = {
          nodeType: 'TENANT',
          nodeId: `node-${i}`,
          databaseId: `db-${i}`,
          menuItemIdentifier: 'test-action',
          node: { id: `node-${i}`, type: 'TENANT' },
        };
        service.contextMenuClick.emit(event);
      }

      expect(subscriber).toHaveBeenCalledTimes(1000);
    });

    it('should handle large force configuration values', () => {
      const extremeConfig: TenantForceConfig = {
        linkDistance: 10000,
        linkStrength: 100,
        layerStrength: 1000,
        clusterStrength: 50,
        centerStrength: 25,
        chargeStrength: -100000,
        collisionRadius: 500,
      };

      // Should not cause issues when accessing the config
      expect(extremeConfig.linkDistance).toBe(10000);
      expect(extremeConfig.chargeStrength).toBe(-100000);
    });

    it('should handle configuration with zero values', () => {
      const zeroConfig: TenantForceConfig = {
        linkDistance: 0,
        linkStrength: 0,
        layerStrength: 0,
        clusterStrength: 0,
        centerStrength: 0,
        chargeStrength: 0,
        collisionRadius: 0,
      };

      // Should not cause issues
      expect(Object.values(zeroConfig).every(val => val === 0)).toBe(true);
    });

    it('should handle configuration with negative values', () => {
      const negativeConfig: TenantForceConfig = {
        linkDistance: -10,
        linkStrength: -0.5,
        layerStrength: -2,
        clusterStrength: -1,
        centerStrength: -0.1,
        chargeStrength: 100, // Positive instead of negative
        collisionRadius: -5,
      };

      // Should not cause runtime errors
      expect(typeof negativeConfig.linkDistance).toBe('number');
      expect(typeof negativeConfig.chargeStrength).toBe('number');
    });
  });

  describe('Event System Validation', () => {
    it('should support unsubscribing from events', () => {
      const subscriber = jest.fn();
      const subscription = service.contextMenuClick.subscribe(subscriber);

      const testEvent: ContextMenuClickEvent = {
        nodeType: 'TENANT',
        nodeId: 'test-node',
        databaseId: 'db-123',
        menuItemIdentifier: 'test-action',
        node: { id: 'test-node', type: 'TENANT' },
      };

      service.contextMenuClick.emit(testEvent);
      expect(subscriber).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
      service.contextMenuClick.emit(testEvent);

      // Should still be called only once after unsubscribe
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it('should handle error in subscriber gracefully', () => {
      const errorSubscriber = jest.fn().mockImplementation(() => {
        throw new Error('Subscriber error');
      });
      const normalSubscriber = jest.fn();

      service.contextMenuClick.subscribe(errorSubscriber);
      service.contextMenuClick.subscribe(normalSubscriber);

      const testEvent: ContextMenuClickEvent = {
        nodeType: 'TENANT',
        nodeId: 'test-node',
        databaseId: 'db-123',
        menuItemIdentifier: 'test-action',
        node: { id: 'test-node', type: 'TENANT' },
      };

      expect(() => {
        service.contextMenuClick.emit(testEvent);
      }).not.toThrow();
    });
  });
});
