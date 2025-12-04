/* eslint-disable max-len */

// Mock tenant-graph services before they're imported to avoid D3 dependency issues
jest.mock('src/app/services/tenant-graph', () => ({
  TenantGraphCoreService: jest.fn().mockImplementation(() => ({})),
  TenantGraphQueryService: jest.fn().mockImplementation(() => ({})),
  TenantGraphPathTraceService: jest.fn().mockImplementation(() => ({})),
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EndpointConnectivityUtilityComponent } from './endpoint-connectivity-utility.component';
import { V2AppCentricTenantsService, PathResult, TenantConnectivityGraph, Tenant } from '../../../../../../../client';
import { TenantGraphCoreService, TenantGraphQueryService, TenantGraphPathTraceService } from 'src/app/services/tenant-graph';

describe('EndpointConnectivityUtilityComponent', () => {
  let component: EndpointConnectivityUtilityComponent;
  let fixture: ComponentFixture<EndpointConnectivityUtilityComponent>;
  let mockQueryService: Partial<TenantGraphQueryService>;
  let mockTenantService: Partial<V2AppCentricTenantsService>;
  let mockTenantGraphCore: Partial<TenantGraphCoreService>;
  let mockPathTraceService: Partial<TenantGraphPathTraceService>;
  let mockRouter: Partial<Router>;

  const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTenantVersion = 42;

  const mockTenant: Tenant = {
    id: mockTenantId,
    version: mockTenantVersion,
    name: 'Test Tenant',
  } as Tenant;

  const mockGraph = {
    nodes: [
      { id: 'node1', name: 'Node 1', type: 'VRF' },
      { id: 'node2', name: 'Node 2', type: 'EPG' },
    ],
    edges: [{ id: 'edge1', source: 'node1', target: 'node2' }],
  } as any as TenantConnectivityGraph;

  beforeEach(async () => {
    mockQueryService = {
      checkIpConnectivity: jest.fn(),
    };
    mockTenantService = {
      getOneTenant: jest.fn().mockReturnValue(of(mockTenant)),
      buildTenantFullGraphTenant: jest.fn().mockReturnValue(of(mockGraph)),
    };
    mockTenantGraphCore = {
      renderGraph: jest.fn(),
    };
    mockPathTraceService = {
      clearPathTrace: jest.fn(),
      setExternalPathTraceData: jest.fn(),
      setExternalPathTraceResult: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
      routerState: {
        snapshot: {
          url: `/tenant-select/edit/${mockTenantId}/other/parts`,
        },
      } as any,
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EndpointConnectivityUtilityComponent],
      providers: [
        FormBuilder,
        { provide: TenantGraphQueryService, useValue: mockQueryService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: TenantGraphCoreService, useValue: mockTenantGraphCore },
        { provide: TenantGraphPathTraceService, useValue: mockPathTraceService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointConnectivityUtilityComponent);
    component = fixture.componentInstance;
    jest.clearAllMocks();
    fixture.detectChanges(); // This will call ngOnInit and initialize the form
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Form', () => {
    it('should extract tenantId from router on initialization', () => {
      expect(component.tenantId).toBe(mockTenantId);
    });

    it('should load tenant and graph on initialization', () => {
      expect(mockTenantService.getOneTenant).toHaveBeenCalledWith({ id: mockTenantId });
      expect(component.tenantVersion).toBe(mockTenantVersion);
      expect(mockTenantService.buildTenantFullGraphTenant).toHaveBeenCalledWith({ id: mockTenantId });
      expect(component.graph).toBe(mockGraph);
    });

    it('should initialize connectivityForm with default values and validators', () => {
      expect(component.connectivityForm).toBeDefined();
      const form = component.connectivityForm;
      expect(form.get('generatedConfigIdentifier')?.value).toContain('connectivity-test-');
      expect(form.get('sourceEndpointIp')?.validator).toBeTruthy();
      expect(form.get('destinationEndpointIp')?.validator).toBeTruthy();
      expect(form.get('ipProtocol')?.value).toBe('tcp');
      expect(form.get('generateConfig')?.value).toBe(false);
    });

    it('generatedConfigIdentifier should be required', () => {
      const control = component.connectivityForm.get('generatedConfigIdentifier');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('test-id');
      expect(control?.valid).toBeTruthy();
    });

    it('sourceEndpointIp should be required and accept IPv4 and IPv6 addresses', () => {
      const control = component.connectivityForm.get('sourceEndpointIp');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('invalid-ip');
      expect(control?.valid).toBeFalsy();
      control?.setValue('1.2.3.4');
      expect(control?.valid).toBeTruthy();
      control?.setValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
      expect(control?.valid).toBeTruthy();
      control?.setValue('2001:db8:85a3::8a2e:370:7334');
      expect(control?.valid).toBeTruthy();
      control?.setValue('::1');
      expect(control?.valid).toBeTruthy();
    });

    it('destinationEndpointIp should be required and accept IPv4 and IPv6 addresses', () => {
      const control = component.connectivityForm.get('destinationEndpointIp');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('invalid-ip');
      expect(control?.valid).toBeFalsy();
      control?.setValue('1.2.3.4');
      expect(control?.valid).toBeTruthy();
      control?.setValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
      expect(control?.valid).toBeTruthy();
      control?.setValue('2001:db8:85a3::8a2e:370:7334');
      expect(control?.valid).toBeTruthy();
      control?.setValue('::1');
      expect(control?.valid).toBeTruthy();
    });

    it('destinationEndpointPort should match number pattern when provided', () => {
      const control = component.connectivityForm.get('destinationEndpointPort');
      control?.setValue('abc');
      expect(control?.valid).toBeFalsy();
      control?.setValue('8080');
      expect(control?.valid).toBeTruthy();
      control?.setValue('');
      expect(control?.valid).toBeTruthy(); // Optional field
    });

    it('ipProtocol should be required', () => {
      const control = component.connectivityForm.get('ipProtocol');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('tcp');
      expect(control?.valid).toBeTruthy();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    let mockPathResult: PathResult;

    beforeEach(() => {
      component.connectivityForm.setValue({
        generatedConfigIdentifier: 'test-submit-id',
        sourceEndpointIp: '1.1.1.1',
        sourceEndpointPort: '100',
        destinationEndpointIp: '2.2.2.2',
        destinationEndpointPort: '200',
        ipProtocol: 'tcp',
        generateConfig: false,
      });

      mockPathResult = {
        controlPlaneAllowed: true,
        controlPath: {
          pathInfo: {
            nodes: ['node1', 'node2'],
            edges: ['edge1'],
          },
          pathTraceData: {
            source: 'node1',
            target: 'node2',
            isComplete: true,
            totalCost: 10,
            path: [
              {
                nodeId: 'node1',
                hopIndex: 0,
                incomingEdges: [],
                outgoingEdges: ['edge1'],
                dataPlaneMetadata: { metadata: {} },
              },
              {
                nodeId: 'node2',
                hopIndex: 1,
                incomingEdges: ['edge1'],
                outgoingEdges: [],
                dataPlaneMetadata: { metadata: {} },
              },
            ],
          },
        },
        dataPath: null,
        queryOutdated: false,
        graphTenantVersion: mockTenantVersion,
        traversalScope: 'FULL',
      } as any as PathResult;
      component.error = null;
      component.connectivityResult = null;
    });

    it('should not call service if form is invalid', () => {
      component.connectivityForm.get('sourceEndpointIp')?.setValue('');
      component.onSubmit();
      expect(mockQueryService.checkIpConnectivity).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalsy();
    });

    it('should call checkIpConnectivity and update state on successful submission', () => {
      (mockQueryService.checkIpConnectivity as jest.Mock).mockReturnValue(of(mockPathResult));

      component.onSubmit();

      expect(mockQueryService.checkIpConnectivity).toHaveBeenCalledTimes(1);
      const expectedQuery = {
        generatedConfigIdentifier: 'test-submit-id',
        sourceEndpointIp: '1.1.1.1',
        sourceEndpointPort: 100,
        destinationEndpointIp: '2.2.2.2',
        destinationEndpointPort: 200,
        ipProtocol: 'tcp',
        generateConfig: false,
        tenantId: mockTenantId,
        tenantVersion: mockTenantVersion,
      };
      expect(mockQueryService.checkIpConnectivity).toHaveBeenCalledWith(expectedQuery);

      expect(component.isLoading).toBeFalsy();
      expect(component.connectivityResult).toEqual(mockPathResult);
      expect(component.error).toBeNull();
      expect(mockPathTraceService.clearPathTrace).toHaveBeenCalled();
      expect(mockPathTraceService.setExternalPathTraceResult).toHaveBeenCalledWith(mockPathResult);
    });

    it('should handle null ports correctly', () => {
      component.connectivityForm.patchValue({
        sourceEndpointPort: '',
        destinationEndpointPort: '',
      });
      (mockQueryService.checkIpConnectivity as jest.Mock).mockReturnValue(of(mockPathResult));

      component.onSubmit();

      const call = (mockQueryService.checkIpConnectivity as jest.Mock).mock.calls[0][0];
      expect(call.sourceEndpointPort).toBeNull();
      expect(call.destinationEndpointPort).toBeNull();
    });

    it('should handle API error and update error state', () => {
      const errorResponse = { message: 'API Error' };
      (mockQueryService.checkIpConnectivity as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(mockQueryService.checkIpConnectivity).toHaveBeenCalledTimes(1);
      expect(component.isLoading).toBeFalsy();
      expect(component.connectivityResult).toBeNull();
      expect(component.error).toBe('API Error');
    });

    it('should set default error message if API error has no message property', () => {
      const errorResponse = {};
      (mockQueryService.checkIpConnectivity as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.isLoading).toBeFalsy();
      expect(component.error).toBe('An error occurred while testing connectivity');
    });

    it('should not inject path trace if result has no controlPath', () => {
      const resultWithoutPath: PathResult = {
        controlPlaneAllowed: false,
        controlPath: null,
        dataPath: null,
        queryOutdated: false,
      } as PathResult;
      (mockQueryService.checkIpConnectivity as jest.Mock).mockReturnValue(of(resultWithoutPath));

      component.onSubmit();

      expect(mockPathTraceService.clearPathTrace).toHaveBeenCalled();
      expect(mockPathTraceService.setExternalPathTraceData).not.toHaveBeenCalled();
    });
  });

  describe('Graph Loading', () => {
    it('should set error if no tenantId is available', () => {
      jest.clearAllMocks(); // Clear the call from ngOnInit
      component.tenantId = '';
      component['loadTenantGraph']();
      expect(component.graphError).toBe('No tenant ID available');
      expect(mockTenantService.buildTenantFullGraphTenant).not.toHaveBeenCalled();
    });

    it('should load graph successfully', () => {
      expect(component.graph).toBe(mockGraph);
      expect(component.isGraphLoading).toBe(false);
      expect(component.graphError).toBeNull();
    });

    it('should handle graph loading error', () => {
      const errorMsg = 'Graph load failed';
      (mockTenantService.buildTenantFullGraphTenant as jest.Mock).mockReturnValue(throwError(() => ({ message: errorMsg })));

      // Create new component instance to trigger fresh ngOnInit
      const newFixture = TestBed.createComponent(EndpointConnectivityUtilityComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.graphError).toBe(errorMsg);
      expect(newComponent.isGraphLoading).toBe(false);
    });
  });

  describe('resetForm', () => {
    it('should reset the form to its default state and clear results/errors', () => {
      // Dirty the form and state
      component.connectivityForm.get('sourceEndpointIp')?.setValue('1.2.3.4');
      component.connectivityResult = { controlPlaneAllowed: true } as any;
      component.error = 'An old error';
      const initialIdentifier = component.connectivityForm.get('generatedConfigIdentifier')?.value;

      component.resetForm();

      expect(component.connectivityForm.get('sourceEndpointIp')?.value).toBeNull();
      expect(component.connectivityForm.get('ipProtocol')?.value).toBe('tcp');
      expect(component.connectivityForm.get('generatedConfigIdentifier')?.value).not.toBe(initialIdentifier);
      expect(component.connectivityResult).toBeNull();
      expect(component.error).toBeNull();
      expect(mockPathTraceService.clearPathTrace).toHaveBeenCalled();
    });
  });

  describe('renderGraph', () => {
    it('should render graph with correct config when graph exists', () => {
      jest.useFakeTimers();
      component.graph = mockGraph;
      component['renderGraph']();

      jest.advanceTimersByTime(100);

      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalledWith({
        graph: mockGraph,
        containerSelector: '#endpointGraphContainer',
        svgSelector: '#endpointGraphSvg',
        showLegend: true,
        enableOptimization: true,
        enableContextMenu: false,
        enablePathTrace: false,
        defaultEdgeWidth: 1.2,
      });
      jest.useRealTimers();
    });

    it('should not render graph when graph is null', () => {
      component.graph = null;
      component['renderGraph']();
      expect(mockTenantGraphCore.renderGraph).not.toHaveBeenCalled();
    });
  });

  describe('injectPathTraceResult', () => {
    it('should inject path trace result when result has controlPath or dataPath', () => {
      const result: PathResult = {
        controlPlaneAllowed: true,
        controlPath: {
          pathInfo: { nodes: [], edges: [] },
          pathTraceData: {} as any,
          totalCost: 0,
          hopCount: 0,
          isComplete: true,
          nodes: [],
          edges: [],
        },
        graphTenantVersion: mockTenantVersion,
        traversalScope: 'FULL',
        vrfEnforced: false,
        dataPath: null,
      } as PathResult;

      component['injectPathTraceResult'](result);

      expect(mockPathTraceService.clearPathTrace).toHaveBeenCalled();
      expect(mockPathTraceService.setExternalPathTraceResult).toHaveBeenCalledWith(result);
    });

    it('should inject path trace result when result has dataPath', () => {
      const result: PathResult = {
        controlPlaneAllowed: true,
        controlPath: null,
        graphTenantVersion: mockTenantVersion,
        traversalScope: 'FULL',
        vrfEnforced: false,
        dataPath: {
          pathInfo: { nodes: [], edges: [] },
          pathTraceData: {} as any,
          totalCost: 0,
          hopCount: 0,
          isComplete: true,
          nodes: [],
          edges: [],
        },
      } as PathResult;

      component['injectPathTraceResult'](result);

      expect(mockPathTraceService.clearPathTrace).toHaveBeenCalled();
      expect(mockPathTraceService.setExternalPathTraceResult).toHaveBeenCalledWith(result);
    });

    it('should return early when result is null', () => {
      component['injectPathTraceResult'](null as any);

      expect(mockPathTraceService.clearPathTrace).not.toHaveBeenCalled();
      expect(mockPathTraceService.setExternalPathTraceResult).not.toHaveBeenCalled();
    });

    it('should return early when result is undefined', () => {
      component['injectPathTraceResult'](undefined as any);

      expect(mockPathTraceService.clearPathTrace).not.toHaveBeenCalled();
      expect(mockPathTraceService.setExternalPathTraceResult).not.toHaveBeenCalled();
    });
  });

  describe('toggleControlPath', () => {
    it('should toggle isControlPathExpanded from false to true', () => {
      component.isControlPathExpanded = false;
      component.toggleControlPath();
      expect(component.isControlPathExpanded).toBe(true);
    });

    it('should toggle isControlPathExpanded from true to false', () => {
      component.isControlPathExpanded = true;
      component.toggleControlPath();
      expect(component.isControlPathExpanded).toBe(false);
    });
  });

  describe('toggleDataPath', () => {
    it('should toggle isDataPathExpanded from false to true', () => {
      component.isDataPathExpanded = false;
      component.toggleDataPath();
      expect(component.isDataPathExpanded).toBe(true);
    });

    it('should toggle isDataPathExpanded from true to false', () => {
      component.isDataPathExpanded = true;
      component.toggleDataPath();
      expect(component.isDataPathExpanded).toBe(false);
    });
  });

  describe('toggleHop', () => {
    it('should toggle hop expansion from false to true', () => {
      expect(component.isHopExpanded('control', 0)).toBe(false);
      component.toggleHop('control', 0);
      expect(component.isHopExpanded('control', 0)).toBe(true);
    });

    it('should toggle hop expansion from true to false', () => {
      component.toggleHop('data', 1);
      expect(component.isHopExpanded('data', 1)).toBe(true);
      component.toggleHop('data', 1);
      expect(component.isHopExpanded('data', 1)).toBe(false);
    });
  });

  describe('isHopExpanded', () => {
    it('should return false when hop is not expanded', () => {
      expect(component.isHopExpanded('control', 0)).toBe(false);
    });

    it('should return true when hop is expanded', () => {
      component.toggleHop('control', 0);
      expect(component.isHopExpanded('control', 0)).toBe(true);
    });
  });

  describe('toggleEvalDetails', () => {
    it('should toggle evaluation details expansion from false to true', () => {
      expect(component.isEvalDetailsExpanded('control', 0)).toBe(false);
      component.toggleEvalDetails('control', 0);
      expect(component.isEvalDetailsExpanded('control', 0)).toBe(true);
    });

    it('should toggle evaluation details expansion from true to false', () => {
      component.toggleEvalDetails('data', 1);
      expect(component.isEvalDetailsExpanded('data', 1)).toBe(true);
      component.toggleEvalDetails('data', 1);
      expect(component.isEvalDetailsExpanded('data', 1)).toBe(false);
    });
  });

  describe('isEvalDetailsExpanded', () => {
    it('should return false when evaluation details is not expanded', () => {
      expect(component.isEvalDetailsExpanded('control', 0)).toBe(false);
    });

    it('should return true when evaluation details is expanded', () => {
      component.toggleEvalDetails('control', 0);
      expect(component.isEvalDetailsExpanded('control', 0)).toBe(true);
    });
  });

  describe('toggleGeneratedConfig', () => {
    it('should toggle generated config expansion from false to true', () => {
      expect(component.isGeneratedConfigExpanded('control', 0)).toBe(false);
      component.toggleGeneratedConfig('control', 0);
      expect(component.isGeneratedConfigExpanded('control', 0)).toBe(true);
    });

    it('should toggle generated config expansion from true to false', () => {
      component.toggleGeneratedConfig('data', 1);
      expect(component.isGeneratedConfigExpanded('data', 1)).toBe(true);
      component.toggleGeneratedConfig('data', 1);
      expect(component.isGeneratedConfigExpanded('data', 1)).toBe(false);
    });
  });

  describe('isGeneratedConfigExpanded', () => {
    it('should return false when generated config is not expanded', () => {
      expect(component.isGeneratedConfigExpanded('control', 0)).toBe(false);
    });

    it('should return true when generated config is expanded', () => {
      component.toggleGeneratedConfig('control', 0);
      expect(component.isGeneratedConfigExpanded('control', 0)).toBe(true);
    });
  });

  describe('toggleNestedPolicyEvalDetails', () => {
    it('should toggle nested policy evaluation details expansion', () => {
      expect(component.isNestedPolicyEvalDetailsExpanded('control', 0, 'policy1')).toBe(false);
      component.toggleNestedPolicyEvalDetails('control', 0, 'policy1');
      expect(component.isNestedPolicyEvalDetailsExpanded('control', 0, 'policy1')).toBe(true);
      component.toggleNestedPolicyEvalDetails('control', 0, 'policy1');
      expect(component.isNestedPolicyEvalDetailsExpanded('control', 0, 'policy1')).toBe(false);
    });
  });

  describe('isNestedPolicyEvalDetailsExpanded', () => {
    it('should return false when nested policy evaluation details is not expanded', () => {
      expect(component.isNestedPolicyEvalDetailsExpanded('control', 0, 'policy1')).toBe(false);
    });

    it('should return true when nested policy evaluation details is expanded', () => {
      component.toggleNestedPolicyEvalDetails('control', 0, 'policy1');
      expect(component.isNestedPolicyEvalDetailsExpanded('control', 0, 'policy1')).toBe(true);
    });
  });

  describe('toggleNestedPolicyGeneratedConfig', () => {
    it('should toggle nested policy generated config expansion', () => {
      expect(component.isNestedPolicyGeneratedConfigExpanded('control', 0, 'policy1')).toBe(false);
      component.toggleNestedPolicyGeneratedConfig('control', 0, 'policy1');
      expect(component.isNestedPolicyGeneratedConfigExpanded('control', 0, 'policy1')).toBe(true);
      component.toggleNestedPolicyGeneratedConfig('control', 0, 'policy1');
      expect(component.isNestedPolicyGeneratedConfigExpanded('control', 0, 'policy1')).toBe(false);
    });
  });

  describe('isNestedPolicyGeneratedConfigExpanded', () => {
    it('should return false when nested policy generated config is not expanded', () => {
      expect(component.isNestedPolicyGeneratedConfigExpanded('control', 0, 'policy1')).toBe(false);
    });

    it('should return true when nested policy generated config is expanded', () => {
      component.toggleNestedPolicyGeneratedConfig('control', 0, 'policy1');
      expect(component.isNestedPolicyGeneratedConfigExpanded('control', 0, 'policy1')).toBe(true);
    });
  });

  describe('getControlPlaneStatusText', () => {
    it('should return "✓ Allowed" when allowed is true', () => {
      expect(component.getControlPlaneStatusText(true)).toBe('✓ Allowed');
    });

    it('should return "✗ Denied" when allowed is false', () => {
      expect(component.getControlPlaneStatusText(false)).toBe('✗ Denied');
    });

    it('should return "Unknown" when allowed is undefined', () => {
      expect(component.getControlPlaneStatusText(undefined)).toBe('Unknown');
    });
  });

  describe('getMetadataStatusText', () => {
    it('should return "Allowed" when metadata.allowed is true', () => {
      const metadata = { allowed: true };
      expect(component.getMetadataStatusText(metadata)).toBe('Allowed');
    });

    it('should return "Denied" when metadata.allowed is false', () => {
      const metadata = { allowed: false };
      expect(component.getMetadataStatusText(metadata)).toBe('Denied');
    });

    it('should return empty string when metadata is null', () => {
      expect(component.getMetadataStatusText(null)).toBe('');
    });

    it('should return empty string when metadata is undefined', () => {
      expect(component.getMetadataStatusText(undefined)).toBe('');
    });
  });

  describe('formatJson', () => {
    it('should format object as JSON string', () => {
      const obj = { key: 'value', number: 123 };
      const result = component.formatJson(obj);
      expect(result).toBe(JSON.stringify(obj, null, 2));
    });

    it('should return empty string when obj is null', () => {
      expect(component.formatJson(null)).toBe('');
    });

    it('should return empty string when obj is undefined', () => {
      expect(component.formatJson(undefined)).toBe('');
    });
  });

  describe('isHopAllowed', () => {
    it('should return policyAllowed when present', () => {
      const hop = {
        controlPlaneMetadata: {
          policyAllowed: true,
          allowed: false,
        },
      };
      expect(component.isHopAllowed(hop)).toBe(true);
    });

    it('should return allowed when policyAllowed is not present', () => {
      const hop = {
        controlPlaneMetadata: {
          allowed: false,
        },
      };
      expect(component.isHopAllowed(hop)).toBe(false);
    });

    it('should return undefined when controlPlaneMetadata is missing', () => {
      const hop = {};
      expect(component.isHopAllowed(hop)).toBeUndefined();
    });

    it('should return undefined when hop is null', () => {
      expect(component.isHopAllowed(null)).toBeUndefined();
    });

    it('should return undefined when hop is undefined', () => {
      expect(component.isHopAllowed(undefined)).toBeUndefined();
    });
  });
});
