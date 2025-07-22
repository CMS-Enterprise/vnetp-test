/* eslint-disable max-len */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EndpointConnectivityUtilityComponent } from './endpoint-connectivity-utility.component';
import { UtilitiesService } from 'client/api/utilities.service';
import { V1NetworkSecurityFirewallRulesService } from '../../../../../../../client/api/v1NetworkSecurityFirewallRules.service';
import { V2AppCentricFilterEntriesService } from '../../../../../../../client/api/v2AppCentricFilterEntries.service';
import { V2AppCentricFiltersService } from '../../../../../../../client/api/v2AppCentricFilters.service';
import { V2AppCentricSubjectsService } from '../../../../../../../client/api/v2AppCentricSubjects.service';
import { V2AppCentricContractsService } from '../../../../../../../client/api/v2AppCentricContracts.service';
import { V2AppCentricEndpointGroupsService } from '../../../../../../../client/api/v2AppCentricEndpointGroups.service';
import { V2AppCentricEndpointSecurityGroupsService } from '../../../../../../../client/api/v2AppCentricEndpointSecurityGroups.service';
import {
  EndpointConnectionUtilityResponse,
  EndpointConnectionUtilityResponseConnectivityResultEnum,
  ConnectivityNodeNodeTypeEnum,
  ConnectivityNode,
} from '../../../../../../../client';

describe('EndpointConnectivityUtilityComponent', () => {
  let component: EndpointConnectivityUtilityComponent;
  let fixture: ComponentFixture<EndpointConnectivityUtilityComponent>;
  let mockUtilitiesService: Partial<UtilitiesService>;
  let mockRouter: Partial<Router>;
  let mockContractsService: Partial<V2AppCentricContractsService>;
  let mockFiltersService: Partial<V2AppCentricFiltersService>;
  let mockSubjectsService: Partial<V2AppCentricSubjectsService>;
  let mockFilterEntriesService: Partial<V2AppCentricFilterEntriesService>;
  let mockEndpointGroupsService: Partial<V2AppCentricEndpointGroupsService>;
  let mockEndpointSecurityGroupsService: Partial<V2AppCentricEndpointSecurityGroupsService>;
  let mockFirewallRulesService: Partial<V1NetworkSecurityFirewallRulesService>;

  const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    mockUtilitiesService = {
      generateConnectivityReportUtilities: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(), // Example method, add others if needed for tests
      routerState: {
        snapshot: {
          url: `/tenant-select/edit/${mockTenantId}/other/parts`,
        },
      } as any, // Cast to any or define a more specific partial type for RouterStateSnapshot
    };
    mockContractsService = { createManyContract: jest.fn() };
    mockFiltersService = { createManyFilter: jest.fn() };
    mockSubjectsService = { createManySubject: jest.fn(), addFilterToSubjectSubject: jest.fn() };
    mockFilterEntriesService = { createManyFilterEntry: jest.fn() };
    mockEndpointGroupsService = {
      addConsumedContractToEndpointGroupEndpointGroup: jest.fn(),
      addProvidedContractToEndpointGroupEndpointGroup: jest.fn(),
      addIntraContractToEndpointGroupEndpointGroup: jest.fn(),
    };
    mockEndpointSecurityGroupsService = {
      addConsumedContractToEndpointSecurityGroupEndpointSecurityGroup: jest.fn(),
      addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup: jest.fn(),
      addIntraContractToEndpointSecurityGroupEndpointSecurityGroup: jest.fn(),
    };
    mockFirewallRulesService = {
      /* relevant methods as jest.fn() if any */
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EndpointConnectivityUtilityComponent],
      providers: [
        FormBuilder,
        { provide: UtilitiesService, useValue: mockUtilitiesService },
        { provide: Router, useValue: mockRouter },
        { provide: V2AppCentricContractsService, useValue: mockContractsService },
        { provide: V2AppCentricFiltersService, useValue: mockFiltersService },
        { provide: V2AppCentricSubjectsService, useValue: mockSubjectsService },
        { provide: V2AppCentricFilterEntriesService, useValue: mockFilterEntriesService },
        { provide: V2AppCentricEndpointGroupsService, useValue: mockEndpointGroupsService },
        { provide: V2AppCentricEndpointSecurityGroupsService, useValue: mockEndpointSecurityGroupsService },
        { provide: V1NetworkSecurityFirewallRulesService, useValue: mockFirewallRulesService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointConnectivityUtilityComponent);
    component = fixture.componentInstance;
    // Reset mocks before each test if they might carry state from previous tests
    // For jest.fn(), this is often done with mockClear() or specific mockReset(), but often not needed if mocks are just returning values.
    fixture.detectChanges(); // This will call ngOnInit and initialize the form
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization and Form', () => {
    it('should extract tenantId from router on initialization', () => {
      expect(component.tenantId).toBe(mockTenantId);
    });

    it('should initialize connectivityForm with default values and validators', () => {
      expect(component.connectivityForm).toBeDefined();
      const form = component.connectivityForm;
      expect(form.get('generatedConfigIdentifier')?.value).toContain('connectivity-test-');
      expect(form.get('sourceEndpointIp')?.validator).toBeTruthy();
      expect(form.get('destinationEndpointIp')?.validator).toBeTruthy();
      expect(form.get('destinationEndpointPort')?.validator).toBeTruthy();
      expect(form.get('ipProtocol')?.value).toBe('tcp');
      expect(form.get('bypassServiceGraph')?.value).toBe(true);
      expect(form.get('generateConfig')?.value).toBe(false);
      expect(form.get('applyConfig')?.value).toBe(false);
      expect(form.get('bidirectional')?.value).toBe(false);
    });

    it('generatedConfigIdentifier should be required', () => {
      const control = component.connectivityForm.get('generatedConfigIdentifier');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('test-id');
      expect(control?.valid).toBeTruthy();
    });

    it('sourceEndpointIp should be required and match IP pattern', () => {
      const control = component.connectivityForm.get('sourceEndpointIp');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('invalid-ip');
      expect(control?.valid).toBeFalsy();
      control?.setValue('1.2.3.4');
      expect(control?.valid).toBeTruthy();
    });

    it('destinationEndpointIp should be required and match IP pattern', () => {
      const control = component.connectivityForm.get('destinationEndpointIp');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('invalid-ip');
      expect(control?.valid).toBeFalsy();
      control?.setValue('1.2.3.4');
      expect(control?.valid).toBeTruthy();
    });

    it('destinationEndpointPort should be required and match number pattern', () => {
      const control = component.connectivityForm.get('destinationEndpointPort');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('abc');
      expect(control?.valid).toBeFalsy();
      control?.setValue('8080');
      expect(control?.valid).toBeTruthy();
    });

    it('ipProtocol should be required', () => {
      const control = component.connectivityForm.get('ipProtocol');
      control?.setValue('');
      expect(control?.valid).toBeFalsy();
      control?.setValue('tcp');
      expect(control?.valid).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    let mockConnectivityResponse: EndpointConnectionUtilityResponse;

    beforeEach(() => {
      component.connectivityForm.setValue({
        generatedConfigIdentifier: 'test-submit-id',
        sourceEndpointIp: '1.1.1.1',
        sourceEndpointPort: '100',
        destinationEndpointIp: '2.2.2.2',
        destinationEndpointPort: '200',
        ipProtocol: 'tcp',
        bypassServiceGraph: true,
        generateConfig: false,
        applyConfig: false,
        bidirectional: false,
      });

      mockConnectivityResponse = {
        sourceEndpoint: { id: 'src-ep-id', name: 'Source EP' } as any, // Cast as any if Endpoint type is complex
        destinationEndpoint: { id: 'dst-ep-id', name: 'Dest EP' } as any, // Cast as any if Endpoint type is complex
        connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed,
        connectivityResultDetail: 'Detail',
        connectionTrace: {
          sourcePath: [],
          contractPath: [],
          destinationPath: [],
          fullPath: [
            {
              name: 'node1',
              nodeType: ConnectivityNodeNodeTypeEnum.Epg,
              nodeId: '1',
              generated: false,
            },
          ] as ConnectivityNode[],
        },
        generatedConfig: null,
      } as EndpointConnectionUtilityResponse;
      component.error = null;
      component.connectivityResult = null;
    });

    it('should not call service if form is invalid', () => {
      component.connectivityForm.get('sourceEndpointIp')?.setValue('');
      component.onSubmit();
      expect(mockUtilitiesService.generateConnectivityReportUtilities).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalsy();
    });

    it('should call generateConnectivityReportUtilities and update state on successful submission', () => {
      (mockUtilitiesService.generateConnectivityReportUtilities as jest.Mock).mockReturnValue(of(mockConnectivityResponse));

      component.onSubmit();
      // isLoading becomes true, then immediately false due to synchronous 'of()' observable.
      // We will test the final state.

      expect(mockUtilitiesService.generateConnectivityReportUtilities).toHaveBeenCalledTimes(1);
      const expectedQuery = {
        generatedConfigIdentifier: 'test-submit-id',
        sourceEndpointIp: '1.1.1.1',
        sourceEndpointPort: 100,
        destinationEndpointIp: '2.2.2.2',
        destinationEndpointPort: 200,
        ipProtocol: 'tcp',
        bypassServiceGraph: true,
        generateConfig: false,
        applyConfig: false,
        bidirectional: false,
        tenantId: mockTenantId,
      };
      expect(mockUtilitiesService.generateConnectivityReportUtilities).toHaveBeenCalledWith({ endpointConnectivityQuery: expectedQuery });

      expect(component.isLoading).toBeFalsy(); // Should be false after success
      expect(component.connectivityResult).toEqual(mockConnectivityResponse);
      expect(component.error).toBeNull();
    });

    it('should handle API error and update error state', () => {
      const errorResponse = { message: 'API Error' };
      (mockUtilitiesService.generateConnectivityReportUtilities as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();
      // isLoading becomes true, then immediately false due to synchronous throwError() observable.
      // We will test the final state.

      expect(mockUtilitiesService.generateConnectivityReportUtilities).toHaveBeenCalledTimes(1);
      expect(component.isLoading).toBeFalsy();
      expect(component.connectivityResult).toBeNull();
      expect(component.error).toBe('API Error');
    });

    it('should set default error message if API error has no message property', () => {
      const errorResponse = {}; // Error without a message property
      (mockUtilitiesService.generateConnectivityReportUtilities as jest.Mock).mockReturnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.isLoading).toBeFalsy();
      expect(component.error).toBe('An error occurred while testing connectivity');
    });

    it('should ensure fullPath is an array for denied connections when initially null or empty', () => {
      const deniedResponseNullPath: EndpointConnectionUtilityResponse = {
        ...mockConnectivityResponse,
        connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
        connectionTrace: { ...mockConnectivityResponse.connectionTrace, fullPath: null as any },
      };
      (mockUtilitiesService.generateConnectivityReportUtilities as jest.Mock).mockReturnValue(of(deniedResponseNullPath));
      component.onSubmit();
      expect(component.connectivityResult?.connectionTrace.fullPath).toEqual([]);

      const deniedResponseEmptyPath: EndpointConnectionUtilityResponse = {
        ...mockConnectivityResponse,
        connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
        connectionTrace: { ...mockConnectivityResponse.connectionTrace, fullPath: [] },
      };
      (mockUtilitiesService.generateConnectivityReportUtilities as jest.Mock).mockReturnValue(of(deniedResponseEmptyPath));
      component.onSubmit();
      expect(component.connectivityResult?.connectionTrace.fullPath).toEqual([]);
    });
  });

  describe('UI Helper Methods', () => {
    let baseResponse: EndpointConnectionUtilityResponse;

    beforeEach(() => {
      baseResponse = {
        sourceEndpoint: { id: 'src-ep', name: 'Source' } as any,
        destinationEndpoint: { id: 'dst-ep', name: 'Destination' } as any,
        connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed,
        connectivityResultDetail: 'Detail text',
        connectionTrace: {
          sourcePath: [{ name: 's1', nodeId: 's1id', nodeType: ConnectivityNodeNodeTypeEnum.Epg }],
          contractPath: [{ name: 'c1', nodeId: 'c1id', nodeType: ConnectivityNodeNodeTypeEnum.Contract }],
          destinationPath: [{ name: 'd1', nodeId: 'd1id', nodeType: ConnectivityNodeNodeTypeEnum.Epg }],
          fullPath: [{ name: 'f1', nodeId: 'f1id', nodeType: ConnectivityNodeNodeTypeEnum.Epg }],
        },
        generatedConfig: null,
      } as EndpointConnectionUtilityResponse;
      component.connectivityResult = null; // Reset before each UI test
    });

    describe('getConnectionStatus', () => {
      it('should return unknown if no connectivityResult', () => {
        component.connectivityResult = null;
        expect(component.getConnectionStatus()).toBe('unknown');
      });
      it('should return allowed for allowed status', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed,
        };
        expect(component.getConnectionStatus()).toBe('allowed');
      });
      it('should return denied for denied status', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
        };
        expect(component.getConnectionStatus()).toBe('denied');
      });
      it('should return denied for denied-generated-config status', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig,
        };
        expect(component.getConnectionStatus()).toBe('denied'); // Function simplifies this to 'denied'
      });
      it('should return the raw status for other cases', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.NotSupported,
        };
        expect(component.getConnectionStatus()).toBe(EndpointConnectionUtilityResponseConnectivityResultEnum.NotSupported);
      });
    });

    describe('getStatusClass', () => {
      it('should return status-unknown for unknown status', () => {
        component.connectivityResult = null;
        expect(component.getStatusClass()).toBe('status-unknown');
      });
      it('should return status-allowed for allowed', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed,
        };
        expect(component.getStatusClass()).toBe('status-allowed');
      });
      it('should return status-denied for denied', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
        };
        expect(component.getStatusClass()).toBe('status-denied');
      });
      it('should return status-denied-config for denied-generated-config', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig,
        };
        expect(component.getStatusClass()).toBe('status-denied-config');
      });
      it('should return status-unknown for other statuses', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.NotSupported,
        };
        expect(component.getStatusClass()).toBe('status-unknown');
      });
    });

    describe('isConnectionAllowed', () => {
      it('should return false if no connectivityResult', () => {
        component.connectivityResult = null;
        expect(component.isConnectionAllowed()).toBeFalsy();
      });
      it('should return true for allowed status', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed,
        };
        expect(component.isConnectionAllowed()).toBeTruthy();
      });
      it('should return true for denied-generated-config status', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig,
        };
        expect(component.isConnectionAllowed()).toBeTruthy();
      });
      it('should return false for denied status', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
        };
        expect(component.isConnectionAllowed()).toBeFalsy();
      });
    });

    describe('shouldShowGeneratedConfig', () => {
      it('should return false if no connectivityResult', () => {
        component.connectivityResult = null;
        expect(component.shouldShowGeneratedConfig()).toBeFalsy();
      });
      it('should return false if connectivityResult has no generatedConfig', () => {
        component.connectivityResult = { ...baseResponse, generatedConfig: null };
        expect(component.shouldShowGeneratedConfig()).toBeFalsy();
      });
      it('should return true for denied-generated-config', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig,
          generatedConfig: {} as any,
        };
        expect(component.shouldShowGeneratedConfig()).toBeTruthy();
      });
      it('should return true for denied status when form.generateConfig is true', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
          generatedConfig: {} as any,
        };
        component.connectivityForm.get('generateConfig')?.setValue(true);
        expect(component.shouldShowGeneratedConfig()).toBeTruthy();
      });
      it('should return false for denied status when form.generateConfig is false', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Denied,
          generatedConfig: {} as any,
        };
        component.connectivityForm.get('generateConfig')?.setValue(false);
        expect(component.shouldShowGeneratedConfig()).toBeFalsy();
      });
      it('should return false for allowed status even if generatedConfig exists', () => {
        component.connectivityResult = {
          ...baseResponse,
          connectivityResult: EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed,
          generatedConfig: {} as any,
        };
        expect(component.shouldShowGeneratedConfig()).toBeFalsy();
      });
    });

    describe('getConnectionDetail', () => {
      it('should return detail string when available', () => {
        component.connectivityResult = { ...baseResponse, connectivityResultDetail: 'Test Detail' };
        expect(component.getConnectionDetail()).toBe('Test Detail');
      });
      it('should return empty string if detail is undefined', () => {
        component.connectivityResult = { ...baseResponse, connectivityResultDetail: undefined as any };
        expect(component.getConnectionDetail()).toBe('');
      });
      it('should return empty string if no connectivityResult', () => {
        component.connectivityResult = null;
        expect(component.getConnectionDetail()).toBe('');
      });
    });

    describe('hasPathNodes', () => {
      it('should return false if no connectivityResult', () => {
        component.connectivityResult = null;
        expect(component.hasPathNodes('source')).toBeFalsy();
      });
      it('should return false if no connectionTrace', () => {
        component.connectivityResult = { ...baseResponse, connectionTrace: null as any };
        expect(component.hasPathNodes('source')).toBeFalsy();
      });
      it('should correctly check sourcePath', () => {
        component.connectivityResult = { ...baseResponse, connectionTrace: { ...baseResponse.connectionTrace, sourcePath: [] } };
        expect(component.hasPathNodes('source')).toBeFalsy();
        component.connectivityResult.connectionTrace.sourcePath = [{ name: 's1' } as any];
        expect(component.hasPathNodes('source')).toBeTruthy();
      });
      // Similar tests for contractPath, destinationPath, fullPath
      it('should correctly check contractPath', () => {
        component.connectivityResult = { ...baseResponse, connectionTrace: { ...baseResponse.connectionTrace, contractPath: [] } };
        expect(component.hasPathNodes('contract')).toBeFalsy();
        component.connectivityResult.connectionTrace.contractPath = [{ name: 'c1' } as any];
        expect(component.hasPathNodes('contract')).toBeTruthy();
      });
      it('should correctly check destinationPath', () => {
        component.connectivityResult = { ...baseResponse, connectionTrace: { ...baseResponse.connectionTrace, destinationPath: [] } };
        expect(component.hasPathNodes('destination')).toBeFalsy();
        component.connectivityResult.connectionTrace.destinationPath = [{ name: 'd1' } as any];
        expect(component.hasPathNodes('destination')).toBeTruthy();
      });
      it('should correctly check fullPath', () => {
        component.connectivityResult = { ...baseResponse, connectionTrace: { ...baseResponse.connectionTrace, fullPath: [] } };
        expect(component.hasPathNodes('full')).toBeFalsy();
        component.connectivityResult.connectionTrace.fullPath = [{ name: 'f1' } as any];
        expect(component.hasPathNodes('full')).toBeTruthy();
      });
      it('should return false for invalid pathType', () => {
        component.connectivityResult = baseResponse;
        expect(component.hasPathNodes('invalid' as any)).toBeFalsy();
      });
    });

    describe('getNodeColor', () => {
      it('should return green for generated nodes', () => {
        expect(component.getNodeColor('epg', true)).toBe('#27ae60');
      });
      it('should return correct colors for different node types', () => {
        expect(component.getNodeColor('endpoint')).toBe('#2c3e50');
        expect(component.getNodeColor('epg')).toBe('#3498db');
        expect(component.getNodeColor('esg')).toBe('#16a085');
        expect(component.getNodeColor('contract')).toBe('#9b59b6');
        expect(component.getNodeColor('subject')).toBe('#6c757d');
        expect(component.getNodeColor('filter')).toBe('#e67e22');
        expect(component.getNodeColor('filter_entry')).toBe('#e74c3c');
        expect(component.getNodeColor('unknown_type')).toBe('#f8f9fa');
      });
    });

    describe('getNodeTextColor', () => {
      it('should return white for dark backgrounds', () => {
        expect(component.getNodeTextColor('endpoint')).toBe('#ffffff');
        expect(component.getNodeTextColor('esg')).toBe('#ffffff');
        expect(component.getNodeTextColor('epg')).toBe('#ffffff');
        expect(component.getNodeTextColor('contract')).toBe('#ffffff');
      });
      it('should return dark for light backgrounds', () => {
        expect(component.getNodeTextColor('subject')).toBe('#212529');
        expect(component.getNodeTextColor('filter')).toBe('#212529');
        expect(component.getNodeTextColor('filter_entry')).toBe('#212529');
        expect(component.getNodeTextColor('unknown_type')).toBe('#212529');
      });
    });
  });

  describe('resetForm', () => {
    it('should reset the form to its default state and clear results/errors', () => {
      // Dirty the form and state
      component.connectivityForm.get('sourceEndpointIp')?.setValue('1.2.3.4');
      component.connectivityResult = { connectivityResult: 'allowed' } as any;
      component.error = 'An old error';
      const initialIdentifier = component.connectivityForm.get('generatedConfigIdentifier')?.value;

      component.resetForm();

      expect(component.connectivityForm.get('sourceEndpointIp')?.value).toBeNull();
      expect(component.connectivityForm.get('ipProtocol')?.value).toBe('tcp');
      expect(component.connectivityForm.get('generatedConfigIdentifier')?.value).not.toBe(initialIdentifier);
      expect(component.connectivityResult).toBeNull();
      expect(component.error).toBeNull();
    });
  });

  describe('applyGeneratedConfig', () => {
    let mockGeneratedConfig;

    beforeEach(() => {
      mockGeneratedConfig = {
        existingContract: false,
        Contracts: [{ name: 'new-contract', tenantId: mockTenantId }],
        Filters: [{ name: 'new-filter', tenantId: mockTenantId }],
        Subjects: [{ name: 'new-subject', contractId: 'new-contract' }],
        FilterEntries: [{ name: 'new-fe', filterId: 'new-filter' }],
        SubjectToFilter: [{ subjectId: 'new-subject', filterId: 'new-filter' }],
        ContractToEpg: [
          { contractId: 'new-contract', epgId: 'epg-1', contractRelationType: 'Consumer' },
          { contractId: 'new-contract', epgId: 'epg-2', contractRelationType: 'Provider' },
          { contractId: 'new-contract', epgId: 'epg-3', contractRelationType: 'Intra' },
        ],
        ContractToEsg: [
          { contractId: 'new-contract', esgId: 'esg-1', contractRelationType: 'Consumer' },
          { contractId: 'new-contract', esgId: 'esg-2', contractRelationType: 'Provider' },
          { contractId: 'new-contract', esgId: 'esg-3', contractRelationType: 'Intra' },
        ],
      };
      component.connectivityResult = {
        generatedConfig: mockGeneratedConfig,
      } as any;
      component.error = null;
      component.isLoading = false;

      // Mock successful service calls by default
      (mockContractsService.createManyContract as jest.Mock).mockReturnValue(of({ data: [{ id: 'contract-uuid', name: 'new-contract' }] }));
      (mockFiltersService.createManyFilter as jest.Mock).mockReturnValue(of({ data: [{ id: 'filter-uuid', name: 'new-filter' }] }));
      (mockSubjectsService.createManySubject as jest.Mock).mockReturnValue(of({ data: [{ id: 'subject-uuid', name: 'new-subject' }] }));
      (mockFilterEntriesService.createManyFilterEntry as jest.Mock).mockReturnValue(of({ data: [{ id: 'fe-uuid', name: 'new-fe' }] }));
      (mockSubjectsService.addFilterToSubjectSubject as jest.Mock).mockReturnValue(of(null));
      (mockEndpointGroupsService.addConsumedContractToEndpointGroupEndpointGroup as jest.Mock).mockReturnValue(of(null));
      (mockEndpointGroupsService.addProvidedContractToEndpointGroupEndpointGroup as jest.Mock).mockReturnValue(of(null));
      (mockEndpointGroupsService.addIntraContractToEndpointGroupEndpointGroup as jest.Mock).mockReturnValue(of(null));
      (mockEndpointSecurityGroupsService.addConsumedContractToEndpointSecurityGroupEndpointSecurityGroup as jest.Mock).mockReturnValue(
        of(null),
      );
      (mockEndpointSecurityGroupsService.addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup as jest.Mock).mockReturnValue(
        of(null),
      );
      (mockEndpointSecurityGroupsService.addIntraContractToEndpointSecurityGroupEndpointSecurityGroup as jest.Mock).mockReturnValue(
        of(null),
      );
    });

    it('should not run if there is no generated config', () => {
      component.connectivityResult = null;
      component.applyGeneratedConfig();
      expect(component.isLoading).toBeFalsy();
      expect(mockContractsService.createManyContract).not.toHaveBeenCalled();
    });

    it('should execute full success path for new contract scenario', () => {
      component.applyGeneratedConfig();

      expect(mockContractsService.createManyContract).toHaveBeenCalled();
      expect(mockFiltersService.createManyFilter).toHaveBeenCalled();
      expect(mockSubjectsService.createManySubject).toHaveBeenCalledWith({
        createManySubjectDto: { bulk: [{ name: 'new-subject', contractId: 'contract-uuid', id: undefined }] },
      });
      expect(mockFilterEntriesService.createManyFilterEntry).toHaveBeenCalledWith({
        createManyFilterEntryDto: { bulk: [{ name: 'new-fe', filterId: 'filter-uuid', id: undefined }] },
      });
      expect(mockSubjectsService.addFilterToSubjectSubject).toHaveBeenCalledWith({ subjectId: 'subject-uuid', filterId: 'filter-uuid' });

      // EPG Links
      expect(mockEndpointGroupsService.addConsumedContractToEndpointGroupEndpointGroup).toHaveBeenCalledWith({
        contractId: 'contract-uuid',
        endpointGroupId: 'epg-1',
      });
      expect(mockEndpointGroupsService.addProvidedContractToEndpointGroupEndpointGroup).toHaveBeenCalledWith({
        contractId: 'contract-uuid',
        endpointGroupId: 'epg-2',
      });
      expect(mockEndpointGroupsService.addIntraContractToEndpointGroupEndpointGroup).toHaveBeenCalledWith({
        contractId: 'contract-uuid',
        endpointGroupId: 'epg-3',
      });

      // ESG Links
      expect(mockEndpointSecurityGroupsService.addConsumedContractToEndpointSecurityGroupEndpointSecurityGroup).toHaveBeenCalledWith({
        contractId: 'contract-uuid',
        endpointSecurityGroupId: 'esg-1',
      });
      expect(mockEndpointSecurityGroupsService.addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup).toHaveBeenCalledWith({
        contractId: 'contract-uuid',
        endpointSecurityGroupId: 'esg-2',
      });
      expect(mockEndpointSecurityGroupsService.addIntraContractToEndpointSecurityGroupEndpointSecurityGroup).toHaveBeenCalledWith({
        contractId: 'contract-uuid',
        endpointSecurityGroupId: 'esg-3',
      });

      expect(component.isLoading).toBe(false);
      expect(component.error).toBe(null);
    });

    it('should handle existing contract scenario', () => {
      mockGeneratedConfig.existingContract = true;
      mockGeneratedConfig.Contracts[0].id = 'existing-contract-uuid'; // For linking
      component.connectivityResult = { generatedConfig: mockGeneratedConfig } as any;

      component.applyGeneratedConfig();

      expect(mockContractsService.createManyContract).not.toHaveBeenCalled();
      // Subject should be created with the existing contract id
      expect(mockSubjectsService.createManySubject).toHaveBeenCalledWith({
        createManySubjectDto: { bulk: [{ name: 'new-subject', contractId: 'new-contract', id: undefined }] },
      });
      // Linking should use the correct id
      expect(mockEndpointGroupsService.addConsumedContractToEndpointGroupEndpointGroup).toHaveBeenCalledWith({
        contractId: 'new-contract',
        endpointGroupId: 'epg-1',
      });
    });

    it('should handle API error during contract creation', () => {
      const error = new Error('Contract creation failed');
      (mockContractsService.createManyContract as jest.Mock).mockReturnValue(throwError(() => error));
      component.applyGeneratedConfig();
      expect(component.isLoading).toBe(false);
      expect(component.error).toBe('Error creating contracts: Contract creation failed');
    });

    it('should handle API error during subject-to-filter linking', () => {
      const error = new Error('Linking failed');
      (mockSubjectsService.addFilterToSubjectSubject as jest.Mock).mockReturnValue(throwError(() => error));
      component.applyGeneratedConfig();
      expect(component.isLoading).toBe(false);
      expect(component.error).toContain('Error linking subject');
    });

    it('should handle ID resolution failure for subjects', () => {
      // Simulate createManyContract returning a contract with a different name
      (mockContractsService.createManyContract as jest.Mock).mockReturnValue(of({ data: [{ id: 'contract-uuid', name: 'other-name' }] }));
      component.applyGeneratedConfig();
      expect(component.isLoading).toBe(false);
      expect(component.error).toContain('ID_RESOLVE_FAIL');
    });

    it('should handle ID resolution failure for filter entries', () => {
      (mockFiltersService.createManyFilter as jest.Mock).mockReturnValue(of({ data: [{ id: 'filter-uuid', name: 'other-name' }] }));
      component.applyGeneratedConfig();
      expect(component.isLoading).toBe(false);
      expect(component.error).toContain('ID_RESOLVE_FAIL');
    });

    it('should handle partial config (no filters/subjects)', () => {
      mockGeneratedConfig.Filters = [];
      mockGeneratedConfig.Subjects = [];
      mockGeneratedConfig.FilterEntries = [];
      mockGeneratedConfig.SubjectToFilter = [];
      component.connectivityResult = { generatedConfig: mockGeneratedConfig } as any;

      component.applyGeneratedConfig();

      expect(mockContractsService.createManyContract).toHaveBeenCalled();
      expect(mockFiltersService.createManyFilter).not.toHaveBeenCalled();
      expect(mockSubjectsService.createManySubject).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(component.error).toBe(null);
    });

    it('should propagate error for unknown ContractToEpg relation type', () => {
      mockGeneratedConfig.ContractToEpg[0].contractRelationType = 'InvalidType';
      component.applyGeneratedConfig();
      expect(component.isLoading).toBe(false);
      expect(component.error).toContain('Unknown contractRelationType \'InvalidType\'');
    });

    it('should propagate error for unknown ContractToEsg relation type', () => {
      mockGeneratedConfig.ContractToEsg[0].contractRelationType = 'InvalidType';
      component.applyGeneratedConfig();
      expect(component.isLoading).toBe(false);
      expect(component.error).toContain('Unknown contractRelationType \'InvalidType\'');
    });

    describe('Error Scenarios', () => {
      it('should handle API error during filter creation', () => {
        const error = new Error('Filter creation failed');
        (mockFiltersService.createManyFilter as jest.Mock).mockReturnValue(throwError(() => error));
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('Error creating filters:');
      });

      it('should handle API error during subject creation', () => {
        const error = new Error('Subject creation failed');
        (mockSubjectsService.createManySubject as jest.Mock).mockReturnValue(throwError(() => error));
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('Error creating subjects:');
      });

      it('should handle API error during filter entry creation', () => {
        const error = new Error('Filter entry creation failed');
        (mockFilterEntriesService.createManyFilterEntry as jest.Mock).mockReturnValue(throwError(() => error));
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('Error creating filter entries:');
      });

      it('should handle link failure when subject or filter not found', () => {
        (mockSubjectsService.createManySubject as jest.Mock).mockReturnValue(
          of({ data: [{ id: 'subject-uuid', name: 'a-different-subject' }] }),
        );
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('LINK_FAIL: Could not find subject');
      });

      it('should handle EPG link failure for new contract when contract not found', () => {
        (mockContractsService.createManyContract as jest.Mock).mockReturnValue(
          of({ data: [{ id: 'contract-uuid', name: 'a-different-contract' }] }),
        );
        mockGeneratedConfig.Subjects = [];
        mockGeneratedConfig.SubjectToFilter = [];
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('LINK_FAIL: Could not resolve contract name');
      });

      it('should handle EPG link API error', () => {
        const error = new Error('EPG linking failed');
        (mockEndpointGroupsService.addConsumedContractToEndpointGroupEndpointGroup as jest.Mock).mockReturnValue(throwError(() => error));
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('Error linking contract');
      });

      it('should handle ESG link failure for new contract when contract not found', () => {
        (mockContractsService.createManyContract as jest.Mock).mockReturnValue(
          of({ data: [{ id: 'contract-uuid', name: 'a-different-contract' }] }),
        );
        mockGeneratedConfig.ContractToEpg = [];
        mockGeneratedConfig.Subjects = [];
        mockGeneratedConfig.SubjectToFilter = [];
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('LINK_FAIL: Could not resolve contract name');
      });

      it('should handle ESG link API error', () => {
        const error = new Error('ESG linking failed');
        (mockEndpointSecurityGroupsService.addConsumedContractToEndpointSecurityGroupEndpointSecurityGroup as jest.Mock).mockReturnValue(
          throwError(() => error),
        );
        component.applyGeneratedConfig();
        expect(component.isLoading).toBe(false);
        expect(component.error).toContain('Error linking contract');
      });
    });
  });
});
