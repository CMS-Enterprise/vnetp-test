import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilitiesService, EndpointConnectivityNodeQuery, EndpointConnectivityQuery, PathResult } from 'client';

/**
 * # Tenant Graph Query Service
 *
 * ## Overview
 *
 * This service provides a unified interface for all path trace and connectivity queries
 * against the backend API. It handles both node-to-node path tracing (used by interactive
 * graph path trace) and IP-to-IP connectivity queries (used by connectivity utilities).
 *
 * ## Main Features
 *
 * ### 1. **Node-to-Node Connectivity**
 * - Query path between two graph nodes by their IDs
 * - Returns complete PathResult with control and data plane paths
 * - Includes control plane validation and routing costs
 * - Used by interactive path tracing in tenant graphs
 *
 * ### 2. **IP-to-IP Connectivity**
 * - Query path between two IP endpoints with port and protocol
 * - Resolves IPs to graph nodes and calculates paths
 * - Supports additional options (bypass service graph, bidirectional, etc.)
 * - Used by endpoint connectivity utility component
 *
 * ### 3. **Consistent Error Handling**
 * - Standardized error handling across all query types
 * - Console logging for debugging
 * - Observable-based error propagation
 *
 * ## Usage Example
 *
 * ```typescript
 * // Inject the service
 * constructor(private queryService: TenantGraphQueryService) {}
 *
 * // Node-to-node query (for interactive path trace)
 * checkNodePath() {
 *   this.queryService
 *     .checkNodeConnectivity('vrf-1', 'vrf-2', 'tenant-uuid', 1)
 *     .subscribe({
 *       next: (result) => console.log('Path found:', result),
 *       error: (err) => console.error('Query failed:', err)
 *     });
 * }
 *
 * // IP-to-IP query (for connectivity utility)
 * checkIpPath() {
 *   const query: EndpointConnectivityQuery = {
 *     sourceEndpointIp: '10.0.0.1',
 *     destinationEndpointIp: '10.0.0.2',
 *     destinationEndpointPort: 443,
 *     ipProtocol: 'tcp',
 *     tenantId: 'tenant-uuid',
 *     tenantVersion: 1,
 *     bypassServiceGraph: true,
 *   };
 *
 *   this.queryService
 *     .checkIpConnectivity(query)
 *     .subscribe({
 *       next: (result) => console.log('Connectivity:', result),
 *       error: (err) => console.error('Query failed:', err)
 *     });
 * }
 * ```
 *
 * ## PathResult Structure
 *
 * Both query types return the same `PathResult` structure:
 * ```typescript
 * interface PathResult {
 *   controlPath: PathInfo;           // Control plane path with policy validation
 *   dataPath: PathInfo;              // Data plane path (physical connectivity)
 *   controlPlaneAllowed?: boolean;   // Whether control plane allows connectivity
 *   graphTenantVersion: number;      // Graph version used for calculation
 *   traversalScope: string;          // Scope of path traversal
 *   queryOutdated?: boolean;         // Whether query is stale (version mismatch)
 * }
 * ```
 *
 * ## Integration Points
 *
 * This service is used by:
 * - **TenantGraphPathTraceService**: For interactive node selection and path tracing
 * - **EndpointConnectivityUtilityComponent**: For IP-based connectivity testing
 * - Any future components needing path calculations
 *
 * ## Performance Considerations
 *
 * - All queries are server-side (no client-side graph processing)
 * - Queries include database lookups for firewall rules and routing policies
 * - Consider debouncing rapid queries to avoid overwhelming the backend
 * - Results should be cached if the same query is repeated
 */

@Injectable({
  providedIn: 'root',
})
export class TenantGraphQueryService {
  constructor(private utilitiesService: UtilitiesService) {}

  /**
   * Execute node-to-node connectivity query
   *
   * Calculates the path between two nodes in the tenant graph, validating
   * control plane policies (firewall rules, contracts) and data plane connectivity.
   *
   * @param sourceNodeId - ID of the source node in the graph
   * @param destinationNodeId - ID of the destination node in the graph
   * @param tenantId - UUID of the tenant
   * @param tenantVersion - Optional version of the tenant for version checking
   * @returns Observable<PathResult> containing control and data plane paths
   *
   * @example
   * ```typescript
   * queryService.checkNodeConnectivity('vrf-1', 'firewall-1', 'tenant-uuid', 1)
   *   .subscribe(result => {
   *     console.log('Control path hops:', result.controlPath.hopCount);
   *     console.log('Allowed:', result.controlPlaneAllowed);
   *   });
   * ```
   */
  public checkNodeConnectivity(
    sourceNodeId: string,
    destinationNodeId: string,
    tenantId: string,
    tenantVersion?: number,
  ): Observable<PathResult> {
    const query: EndpointConnectivityNodeQuery = {
      sourceNodeId,
      destinationNodeId,
      tenantId,
      tenantVersion,
    };

    return this.utilitiesService.checkNodeConnectivityUtilities({ endpointConnectivityNodeQuery: query }).pipe(
      catchError(err => {
        console.error('Node connectivity query failed:', err);
        throw err;
      }),
    );
  }

  /**
   * Execute IP-to-IP connectivity query
   *
   * Tests connectivity between two IP endpoints, resolving them to graph nodes
   * and calculating the path with full control plane validation.
   *
   * @param query - Complete endpoint connectivity query parameters
   * @returns Observable<PathResult> containing control and data plane paths
   *
   * @example
   * ```typescript
   * const query: EndpointConnectivityQuery = {
   *   sourceEndpointIp: '10.0.0.1',
   *   sourceEndpointPort: 12345,
   *   destinationEndpointIp: '10.0.0.2',
   *   destinationEndpointPort: 443,
   *   ipProtocol: 'tcp',
   *   tenantId: 'tenant-uuid',
   *   tenantVersion: 1,
   *   bypassServiceGraph: true,
   *   generateConfig: false,
   *   applyConfig: false,
   *   bidirectional: false,
   * };
   *
   * queryService.checkIpConnectivity(query)
   *   .subscribe(result => {
   *     if (result.controlPlaneAllowed) {
   *       console.log('Connectivity allowed');
   *     }
   *   });
   * ```
   */
  public checkIpConnectivity(query: EndpointConnectivityQuery): Observable<PathResult> {
    return this.utilitiesService.checkIpConnectivityUtilities({ endpointConnectivityQuery: query }).pipe(
      catchError(err => {
        console.error('IP connectivity query failed:', err);
        throw err;
      }),
    );
  }
}

