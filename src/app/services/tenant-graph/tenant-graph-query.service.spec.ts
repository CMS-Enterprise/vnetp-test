/* eslint-disable */
import { TenantGraphQueryService } from './tenant-graph-query.service';
import { UtilitiesService, EndpointConnectivityNodeQuery, EndpointConnectivityQuery, PathResult } from 'client';
import { of, throwError } from 'rxjs';

describe('TenantGraphQueryService', () => {
  let service: TenantGraphQueryService;
  let mockUtilitiesService: jest.Mocked<UtilitiesService>;
  let consoleErrorSpy: jest.SpyInstance;

  const mockPathResult: PathResult = {
    graphTenantVersion: 1,
    controlPath: {
      nodes: ['vrf-1', 'firewall-1', 'vrf-2'],
      edges: ['edge-1', 'edge-2'],
      totalCost: 100,
      hopCount: 3,
      isComplete: true,
      pathTraceData: {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [],
        isComplete: true,
        totalCost: 100,
      },
    },
    dataPath: {
      nodes: ['vrf-1', 'vrf-2'],
      edges: ['edge-3'],
      totalCost: 50,
      hopCount: 2,
      isComplete: true,
      pathTraceData: {
        source: { id: 'vrf-1', name: 'VRF 1', type: 'VRF' },
        target: { id: 'vrf-2', name: 'VRF 2', type: 'VRF' },
        path: [],
        isComplete: true,
        totalCost: 50,
      },
    },
    traversalScope: 'FULL',
    controlPlaneAllowed: true,
    vrfEnforced: true,
  };

  beforeEach(() => {
    mockUtilitiesService = {
      checkNodeConnectivityUtilities: jest.fn().mockReturnValue(of(mockPathResult)),
      checkIpConnectivityUtilities: jest.fn().mockReturnValue(of(mockPathResult)),
    } as any;

    service = new TenantGraphQueryService(mockUtilitiesService);

    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('checkNodeConnectivity', () => {
    it('should call checkNodeConnectivityUtilities with correct parameters', done => {
      service.checkNodeConnectivity('source-node', 'dest-node', 'tenant-123', 1).subscribe(result => {
        expect(mockUtilitiesService.checkNodeConnectivityUtilities).toHaveBeenCalledWith({
          endpointConnectivityNodeQuery: {
            sourceNodeId: 'source-node',
            destinationNodeId: 'dest-node',
            tenantId: 'tenant-123',
            tenantVersion: 1,
          },
        });
        expect(result).toEqual(mockPathResult);
        done();
      });
    });

    it('should work without tenant version', done => {
      service.checkNodeConnectivity('source-node', 'dest-node', 'tenant-123').subscribe(result => {
        expect(mockUtilitiesService.checkNodeConnectivityUtilities).toHaveBeenCalledWith({
          endpointConnectivityNodeQuery: {
            sourceNodeId: 'source-node',
            destinationNodeId: 'dest-node',
            tenantId: 'tenant-123',
            tenantVersion: undefined,
          },
        });
        expect(result).toEqual(mockPathResult);
        done();
      });
    });

    it('should return PathResult on success', done => {
      service.checkNodeConnectivity('vrf-1', 'vrf-2', 'tenant-123', 1).subscribe(result => {
        expect(result).toEqual(mockPathResult);
        expect(result.controlPath.nodes).toEqual(['vrf-1', 'firewall-1', 'vrf-2']);
        expect(result.controlPlaneAllowed).toBe(true);
        done();
      });
    });

    it('should handle API errors', done => {
      const error = new Error('Network error');
      mockUtilitiesService.checkNodeConnectivityUtilities.mockReturnValue(throwError(() => error));

      service.checkNodeConnectivity('vrf-1', 'vrf-2', 'tenant-123', 1).subscribe({
        next: () => fail('Should have thrown error'),
        error: err => {
          expect(err).toBe(error);
          expect(consoleErrorSpy).toHaveBeenCalledWith('Node connectivity query failed:', error);
          done();
        },
      });
    });

    it('should log errors to console', done => {
      const error = { message: 'API error', status: 500 };
      mockUtilitiesService.checkNodeConnectivityUtilities.mockReturnValue(throwError(() => error));

      service.checkNodeConnectivity('vrf-1', 'vrf-2', 'tenant-123').subscribe({
        next: () => fail('Should have thrown error'),
        error: () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(consoleErrorSpy.mock.calls[0][0]).toBe('Node connectivity query failed:');
          done();
        },
      });
    });
  });

  describe('checkIpConnectivity', () => {
    it('should call checkIpConnectivityUtilities with correct parameters', done => {
      const query: EndpointConnectivityQuery = {
        generatedConfigIdentifier: 'test-query-1',
        sourceEndpointIp: '10.0.0.1',
        sourceEndpointPort: 12345,
        destinationEndpointIp: '10.0.0.2',
        destinationEndpointPort: 443,
        ipProtocol: 'tcp',
        tenantId: 'tenant-123',
        tenantVersion: 1,
        generateConfig: false,
      };

      service.checkIpConnectivity(query).subscribe(result => {
        expect(mockUtilitiesService.checkIpConnectivityUtilities).toHaveBeenCalledWith({
          endpointConnectivityQuery: query,
        });
        expect(result).toEqual(mockPathResult);
        done();
      });
    });

    it('should return PathResult on success', done => {
      const query: EndpointConnectivityQuery = {
        generatedConfigIdentifier: 'test-query-2',
        sourceEndpointIp: '10.0.0.1',
        destinationEndpointIp: '10.0.0.2',
        destinationEndpointPort: 443,
        ipProtocol: 'tcp',
        tenantId: 'tenant-123',
        tenantVersion: 1,
        generateConfig: false,
      };

      service.checkIpConnectivity(query).subscribe(result => {
        expect(result).toEqual(mockPathResult);
        expect(result.controlPath).toBeDefined();
        expect(result.dataPath).toBeDefined();
        done();
      });
    });

    it('should handle API errors', done => {
      const error = new Error('Connection refused');
      mockUtilitiesService.checkIpConnectivityUtilities.mockReturnValue(throwError(() => error));

      const query: EndpointConnectivityQuery = {
        generatedConfigIdentifier: 'test-query-3',
        sourceEndpointIp: '10.0.0.1',
        destinationEndpointIp: '10.0.0.2',
        destinationEndpointPort: 443,
        ipProtocol: 'tcp',
        tenantId: 'tenant-123',
        tenantVersion: 1,
        generateConfig: false,
      };

      mockUtilitiesService.checkIpConnectivityUtilities.mockReturnValue(throwError(() => error));

      service.checkIpConnectivity(query).subscribe({
        next: () => fail('Should have thrown error'),
        error: err => {
          expect(err).toBe(error);
          expect(consoleErrorSpy).toHaveBeenCalledWith('IP connectivity query failed:', error);
          done();
        },
      });
    });

    it('should log errors to console', done => {
      const error = { message: 'Invalid IP address', status: 400 };
      mockUtilitiesService.checkIpConnectivityUtilities.mockReturnValue(throwError(() => error));

      const query: EndpointConnectivityQuery = {
        generatedConfigIdentifier: 'test-query-4',
        sourceEndpointIp: 'invalid-ip',
        destinationEndpointIp: '10.0.0.2',
        destinationEndpointPort: 443,
        ipProtocol: 'tcp',
        tenantId: 'tenant-123',
        tenantVersion: 1,
        generateConfig: false,
      };

      service.checkIpConnectivity(query).subscribe({
        next: () => fail('Should have thrown error'),
        error: () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(consoleErrorSpy.mock.calls[0][0]).toBe('IP connectivity query failed:');
          done();
        },
      });
    });

    it('should handle queries with minimal parameters', done => {
      const minimalQuery: EndpointConnectivityQuery = {
        generatedConfigIdentifier: 'test-query-5',
        sourceEndpointIp: '10.0.0.1',
        destinationEndpointIp: '10.0.0.2',
        destinationEndpointPort: 80,
        ipProtocol: 'tcp',
        tenantId: 'tenant-123',
        tenantVersion: 1,
        generateConfig: false,
      };

      service.checkIpConnectivity(minimalQuery).subscribe(result => {
        expect(result).toEqual(mockPathResult);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from node connectivity queries', done => {
      const customError = new Error('Custom error message');
      mockUtilitiesService.checkNodeConnectivityUtilities.mockReturnValue(throwError(() => customError));

      service.checkNodeConnectivity('node-1', 'node-2', 'tenant-123').subscribe({
        next: () => fail('Should have thrown error'),
        error: err => {
          expect(err).toBe(customError);
          expect(err.message).toBe('Custom error message');
          done();
        },
      });
    });

    it('should propagate errors from IP connectivity queries', done => {
      const customError = new Error('IP query failed');
      mockUtilitiesService.checkIpConnectivityUtilities.mockReturnValue(throwError(() => customError));

      const query: EndpointConnectivityQuery = {
        generatedConfigIdentifier: 'test-query-6',
        sourceEndpointIp: '10.0.0.1',
        destinationEndpointIp: '10.0.0.2',
        destinationEndpointPort: 443,
        ipProtocol: 'tcp',
        tenantId: 'tenant-123',
        tenantVersion: 1,
        generateConfig: false,
      };

      mockUtilitiesService.checkIpConnectivityUtilities.mockReturnValue(throwError(() => customError));

      service.checkIpConnectivity(query).subscribe({
        next: () => fail('Should have thrown error'),
        error: err => {
          expect(err).toBe(customError);
          expect(err.message).toBe('IP query failed');
          done();
        },
      });
    });
  });
});

