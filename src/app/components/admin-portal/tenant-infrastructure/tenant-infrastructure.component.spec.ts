import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subject, of, throwError, BehaviorSubject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TenantInfrastructureComponent } from './tenant-infrastructure.component';
import { TenantGraphCoreService } from '../../../services/tenant-graph/tenant-graph-core.service';

// Mock the TenantGraphCoreService to avoid D3 import issues
jest.mock('../../../services/tenant-graph/tenant-graph-core.service', () => ({
  TenantGraphCoreService: jest.fn().mockImplementation(() => ({
    renderGraph: jest.fn(),
    contextMenuClick: {
      subscribe: jest.fn(),
      emit: jest.fn(),
    },
    pathTraceStateChange: {
      subscribe: jest.fn(),
      emit: jest.fn(),
    },
  })),
}));
import {
  V2AdminTenantOrchestratorService,
  V3GlobalEnvironmentsService,
  TenantInfrastructureConfigDto,
  TenantInfrastructureValidationResponse,
  TenantConnectivityGraph,
  TenantConnectivityGraphNodesTypeEnum,
  TenantConnectivityGraphEdgesTypeEnum,
  Environment,
  TenantInfrastructureResponse,
} from 'client';
import { MockComponent } from '../../../../test/mock-components';

describe('TenantInfrastructureComponent', () => {
  let component: TenantInfrastructureComponent;
  let fixture: ComponentFixture<TenantInfrastructureComponent>;
  let mockOrchestrator: jest.Mocked<V2AdminTenantOrchestratorService>;
  let mockTenantGraphCore: jest.Mocked<TenantGraphCoreService>;
  let mockGlobalEnvironmentService: jest.Mocked<V3GlobalEnvironmentsService>;
  let mockClipboard: jest.Mocked<Clipboard>;
  let mockNgxService: jest.Mocked<NgxSmartModalService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let parentParamMapSubject: BehaviorSubject<any>;

  const mockEnvironments: Environment[] = [
    { id: 'env1', name: 'Environment 1' } as Environment,
    { id: 'env2', name: 'Environment 2' } as Environment,
  ];

  const mockConfig: TenantInfrastructureConfigDto = {
    tenant: {
      name: 'test-tenant',
      environmentId: 'env1',
      alias: 'Test Tenant',
      description: 'Test Description',
    },
    externalFirewalls: [
      {
        name: 'ext-fw',
        firewallDeviceType: 'PaloAlto',
        vsysName: 'vsys1',
        bgpAsn: null,
        bgpAsnAutoGenerate: true,
        routingCost: 0,
        externalVrfConnections: [],
      },
    ],
    vrfs: [
      {
        name: 'default_vrf',
        alias: 'Default VRF',
        displayOrder: 1,
        maxExternalRoutes: 150,
        bgpAsn: null,
        bgpAsnAutoGenerate: true,
        serviceGraphs: [],
        l3outs: [],
      },
    ],
  } as TenantInfrastructureConfigDto;

  const mockGraph: TenantConnectivityGraph = {
    nodes: { node1: { id: 'node1', name: 'Node 1', type: TenantConnectivityGraphNodesTypeEnum.Tenant } },
    edges: {
      edge1: {
        id: 'edge1',
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        type: TenantConnectivityGraphEdgesTypeEnum.TenantContainsVrf,
      },
    },
    buildStrategy: 'default' as any,
    indexes: {} as any,
    routingPaths: [] as any,
    metadata: {} as any,
    utils: {} as any,
  } as TenantConnectivityGraph;

  const mockValidationResponse: TenantInfrastructureValidationResponse = {
    success: true,
    errors: [],
  };

  beforeEach(async () => {
    parentParamMapSubject = new BehaviorSubject(new Map());

    mockOrchestrator = {
      validateTenantInfrastructureTenantOrchestrator: jest.fn().mockReturnValue(of(mockValidationResponse) as any),
      buildTenantInfrastructureGraphTenantOrchestrator: jest.fn().mockReturnValue(of(mockGraph) as any),
      getTenantInfrastructureGraphTenantOrchestrator: jest.fn().mockReturnValue(of(mockGraph) as any),
      configureTenantInfrastructureTenantOrchestrator: jest.fn().mockReturnValue(of({ success: true }) as any),
      getTenantInfrastructureConfigTenantOrchestrator: jest.fn().mockReturnValue(of(mockConfig) as any),
    } as any;

    mockTenantGraphCore = {
      renderGraph: jest.fn(),
      contextMenuClick: new Subject(),
      pathTraceStateChange: new Subject(),
    } as any;

    mockGlobalEnvironmentService = {
      getManyEnvironments: jest.fn(),
    } as any;

    mockClipboard = {
      copy: jest.fn(),
    } as any;

    mockNgxService = {
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        close: jest.fn(),
        setData: jest.fn(),
        getData: jest.fn(),
      }),
      close: jest.fn(),
      setModalData: jest.fn(),
      getModalData: jest.fn(),
      resetModalData: jest.fn(),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    mockActivatedRoute = {
      parent: {
        paramMap: parentParamMapSubject.asObservable(),
      },
    };

    await TestBed.configureTestingModule({
      declarations: [TenantInfrastructureComponent, MockComponent('fa-icon'), MockComponent('app-tabs'), MockComponent('app-yes-no-modal')],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: V2AdminTenantOrchestratorService, useValue: mockOrchestrator },
        { provide: TenantGraphCoreService, useValue: mockTenantGraphCore },
        { provide: V3GlobalEnvironmentsService, useValue: mockGlobalEnvironmentService },
        { provide: Clipboard, useValue: mockClipboard },
        { provide: NgxSmartModalService, useValue: mockNgxService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantInfrastructureComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.graph).toBeNull();
      expect(component.mode).toBe('create');
      expect(component.activeTab).toBe('tenant');
      expect(component.previewFormat).toBe('json');
      expect(component.rightPanelView).toBe('config');
      expect(component.isSubmitting).toBe(false);
      expect(component.hasValidated).toBe(false);
      expect(component.leftPanelCollapsed).toBe(false);
      expect(component.hasUnsavedChanges).toBe(false);
    });
  });

  describe('Lifecycle Methods', () => {
    beforeEach(() => {
      mockGlobalEnvironmentService.getManyEnvironments.mockReturnValue(of(mockEnvironments) as any);
    });

    it('should initialize in create mode when no ID in route params', fakeAsync(() => {
      parentParamMapSubject.next(new Map());

      // Don't trigger change detection to avoid form control errors
      component.ngOnInit();
      tick();

      expect(component.mode).toBe('create');
      expect(component.tenantId).toBeUndefined();
      expect(mockGlobalEnvironmentService.getManyEnvironments).toHaveBeenCalled();
    }));

    it('should initialize in edit mode when ID exists in route params', fakeAsync(() => {
      const paramMap = new Map();
      paramMap.set('id', 'tenant-123');
      parentParamMapSubject.next(paramMap);

      component.ngOnInit();
      tick(300); // Wait for all setTimeout calls to complete

      expect(component.mode).toBe('edit');
      expect(component.tenantId).toBe('tenant-123');
      expect(mockOrchestrator.getTenantInfrastructureConfigTenantOrchestrator).toHaveBeenCalledWith({ id: 'tenant-123' });
    }));

    it('should setup debounced graph updates on init', fakeAsync(() => {
      component.ngOnInit();
      tick(300); // Wait for all setTimeout calls to complete

      expect((component as any).graphUpdateSubscription).toBeDefined();
    }));

    it('should unsubscribe on destroy', () => {
      const mockSub = { unsubscribe: jest.fn() };
      (component as any).sub = mockSub as any;
      (component as any).graphUpdateSubscription = mockSub as any;

      component.ngOnDestroy();

      expect(mockSub.unsubscribe).toHaveBeenCalledTimes(2);
    });
  });

  describe('Graph Service Integration', () => {
    beforeEach(() => {
      component.config = mockConfig;
      component.graph = mockGraph;
    });

    it('should call renderGraph with correct config for create mode', fakeAsync(() => {
      component.mode = 'create';
      component.config = mockConfig;

      (component as any).generateGraphInternal();
      tick(200); // Wait for both the observable and the setTimeout

      expect(mockOrchestrator.buildTenantInfrastructureGraphTenantOrchestrator).toHaveBeenCalledWith({
        tenantInfrastructureConfigDto: mockConfig,
      });
      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalledWith({
        graph: mockGraph,
        containerSelector: '#graphContainer',
        svgSelector: '#graphSvg',
        hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL', 'INTERVRF_CONNECTION'],
        enableContextMenu: true,
        enablePathTrace: true,
        contextMenuConfig: {},
        defaultEdgeWidth: 1.2,
      });
    }));

    it('should call renderGraph with correct config for edit mode', fakeAsync(() => {
      component.mode = 'edit';
      component.tenantId = 'tenant-123';

      (component as any).generateGraphInternal();
      tick(200); // Wait for both the observable and the setTimeout

      expect(mockOrchestrator.getTenantInfrastructureGraphTenantOrchestrator).toHaveBeenCalledWith({ id: 'tenant-123' });
      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalledWith({
        graph: mockGraph,
        containerSelector: '#graphContainer',
        svgSelector: '#graphSvg',
        hideEdgeTypes: ['TENANT_CONTAINS_FIREWALL', 'INTERVRF_CONNECTION'],
        enableContextMenu: true,
        enablePathTrace: true,
        contextMenuConfig: {},
        defaultEdgeWidth: 1.2,
      });
    }));

    it('should trigger graph update when getGraph is called', () => {
      const graphUpdateSpy = jest.spyOn((component as any).graphUpdateSubject, 'next');
      component.rightPanelView = 'graph';

      component.getGraph();

      expect(component.rightPanelView).toBe('graph');
      expect(graphUpdateSpy).toHaveBeenCalled();
    });

    it('should not trigger graph update when submitting', () => {
      const graphUpdateSpy = jest.spyOn((component as any).graphUpdateSubject, 'next');
      component.isSubmitting = true;

      component.getGraph();

      expect(graphUpdateSpy).not.toHaveBeenCalled();
    });

    it('should render graph when showGraph is called', fakeAsync(() => {
      component.graph = mockGraph;

      component.showGraph();
      tick(100);

      expect(component.rightPanelView).toBe('graph');
      expect(mockTenantGraphCore.renderGraph).toHaveBeenCalled();
    }));
  });

  describe('Configuration Management', () => {
    it('should load existing config in edit mode', fakeAsync(() => {
      component.tenantId = 'tenant-123';
      component.mode = 'edit';

      component.loadExistingConfig();
      tick(300); // Wait for both config load and graph generation with all setTimeout calls

      expect(mockOrchestrator.getTenantInfrastructureConfigTenantOrchestrator).toHaveBeenCalledWith({ id: 'tenant-123' });
      expect(component.config).toEqual(mockConfig);
      expect(component.rightPanelView).toBe('graph');
    }));

    it('should handle config loading error', fakeAsync(() => {
      component.tenantId = 'tenant-123';
      mockOrchestrator.getTenantInfrastructureConfigTenantOrchestrator.mockReturnValue(throwError({ message: 'Config not found' }) as any);

      component.loadExistingConfig();
      tick();

      expect(component.config).toEqual({
        tenant: { name: '', environmentId: '', alias: '', description: '' },
        externalFirewalls: [],
        vrfs: [],
      });
      expect(component.isLoadingConfig).toBe(false);
    }));

    it('should update raw config when format changes', () => {
      component.config = mockConfig;
      component.previewFormat = 'json';

      component.onFormatChange();

      expect(component.displayConfig).toContain('"name": "test-tenant"');
    });

    it('should handle YAML format conversion', () => {
      component.config = mockConfig;
      component.previewFormat = 'yaml';

      component.onFormatChange();

      expect(component.displayConfig).toContain('name: test-tenant');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      component.config = mockConfig;
    });

    it('should validate configuration successfully', fakeAsync(() => {
      mockOrchestrator.validateTenantInfrastructureTenantOrchestrator.mockReturnValue(of(mockValidationResponse) as any);

      component.validate();
      tick();

      expect(mockOrchestrator.validateTenantInfrastructureTenantOrchestrator).toHaveBeenCalledWith({
        tenantInfrastructureConfigDto: mockConfig,
      });
      expect(component.validation).toEqual(mockValidationResponse);
      expect(component.hasValidated).toBe(true);
      expect(component.rightPanelView).toBe('config');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should handle validation errors', fakeAsync(() => {
      const errorResponse = {
        error: {
          detail: {
            message: ['externalFirewalls.0.bgpAsn must be provided if bgpAsnAutoGenerate is not true'],
          },
        },
      };
      mockOrchestrator.validateTenantInfrastructureTenantOrchestrator.mockReturnValue(throwError(errorResponse) as any);

      component.validate();
      tick();

      expect(component.hasValidated).toBe(false);
      expect(component.validationErrors.has('externalFirewalls.0.bgpAsn')).toBe(true);
      expect(component.isSubmitting).toBe(false);
    }));

    it('should parse validation error messages correctly', () => {
      const message = 'externalFirewalls.0.bgpAsn must be provided if bgpAsnAutoGenerate is not true';

      (component as any).parseValidationError(message);

      expect(component.validationErrors.get('externalFirewalls.0.bgpAsn')).toBe(message);
    });

    it('should check if field has error', () => {
      component.validationErrors.set('tenant.name', 'Name is required');

      expect(component.hasFieldError('tenant.name')).toBe(true);
      expect(component.hasFieldError('tenant.alias')).toBe(false);
    });

    it('should get field error message', () => {
      const errorMessage = 'Name is required';
      component.validationErrors.set('tenant.name', errorMessage);

      expect(component.getFieldError('tenant.name')).toBe(errorMessage);
      expect(component.getFieldError('tenant.alias')).toBeNull();
    });
  });

  describe('Save Configuration', () => {
    beforeEach(() => {
      component.config = mockConfig;
    });

    it('should save configuration successfully', fakeAsync(() => {
      const saveResponse: TenantInfrastructureResponse = { success: true } as any;
      mockOrchestrator.configureTenantInfrastructureTenantOrchestrator.mockReturnValue(of(saveResponse) as any);

      component.saveConfig();
      tick();

      expect(mockOrchestrator.configureTenantInfrastructureTenantOrchestrator).toHaveBeenCalledWith({
        tenantInfrastructureConfigDto: mockConfig,
      });
      expect(component.saveResponse).toEqual(saveResponse);
      expect(component.hasUnsavedChanges).toBe(false);
      expect(component.rightPanelView).toBe('response');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should handle save errors', fakeAsync(() => {
      mockOrchestrator.configureTenantInfrastructureTenantOrchestrator.mockReturnValue(throwError({ message: 'Save failed' }) as any);

      component.saveConfig();
      tick();

      expect(component.validation?.success).toBe(false);
      expect(component.validation?.errors?.[0]?.message).toBe('Save failed');
      expect(component.rightPanelView).toBe('config');
      expect(component.isSubmitting).toBe(false);
    }));

    it('should not save when already submitting', () => {
      component.isSubmitting = true;

      component.saveConfig();

      expect(mockOrchestrator.configureTenantInfrastructureTenantOrchestrator).not.toHaveBeenCalled();
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      component.config = mockConfig;
    });

    describe('Firewalls', () => {
      it('should add new firewall', () => {
        const initialCount = component.config.externalFirewalls.length;

        component.addFirewall();

        expect(component.config.externalFirewalls.length).toBe(initialCount + 1);
        expect(component.selectedFirewallIdx).toBe(initialCount);
        expect(component.hasUnsavedChanges).toBe(true);
      });

      it('should add external VRF connection', () => {
        component.addExternalVrfConnection(0);

        const firewall = component.config.externalFirewalls[0] as any;
        expect(firewall.externalVrfConnections.length).toBe(1);
        expect(firewall.externalVrfConnections[0].name).toBe('connection');
        expect(component.hasUnsavedChanges).toBe(true);
      });
    });

    describe('VRFs', () => {
      it('should add new VRF', () => {
        const initialCount = component.config.vrfs.length;

        component.addVrf();

        expect(component.config.vrfs.length).toBe(initialCount + 1);
        expect(component.selectedVrfIdx).toBe(initialCount);
        expect(component.hasUnsavedChanges).toBe(true);
      });

      it('should move VRF up', () => {
        // Add another VRF to have something to move
        component.addVrf();
        const vrf1 = component.config.vrfs[0];
        const vrf2 = component.config.vrfs[1];

        component.moveVrfUp(1);

        expect(component.config.vrfs[0]).toBe(vrf2);
        expect(component.config.vrfs[1]).toBe(vrf1);
        expect(component.hasUnsavedChanges).toBe(true);
      });

      it('should move VRF down', () => {
        // Add another VRF to have something to move
        component.addVrf();
        const vrf1 = component.config.vrfs[0];
        const vrf2 = component.config.vrfs[1];

        component.moveVrfDown(0);

        expect(component.config.vrfs[0]).toBe(vrf2);
        expect(component.config.vrfs[1]).toBe(vrf1);
        expect(component.hasUnsavedChanges).toBe(true);
      });

      it('should update VRF display orders', () => {
        component.addVrf(); // Add second VRF

        (component as any).updateVrfDisplayOrders();

        expect((component.config.vrfs[0] as any).displayOrder).toBe(1);
        expect((component.config.vrfs[1] as any).displayOrder).toBe(2);
      });

      it('should add service graph', () => {
        component.addServiceGraph(0);

        const vrf = component.config.vrfs[0] as any;
        expect(vrf.serviceGraphs.length).toBe(1);
        expect(vrf.serviceGraphs[0].name).toBe('new-sg');
        expect(component.hasUnsavedChanges).toBe(true);
      });

      it('should add L3Out', () => {
        component.addL3Out(0);

        const vrf = component.config.vrfs[0] as any;
        expect(vrf.l3outs.length).toBe(1);
        expect(vrf.l3outs[0].name).toBe('new-l3out');
        expect(component.hasUnsavedChanges).toBe(true);
      });
    });
  });

  describe('Error Indicators', () => {
    beforeEach(() => {
      component.validationErrors.set('tenant.name', 'Name error');
      component.validationErrors.set('externalFirewalls.0.bgpAsn', 'BGP error');
      component.validationErrors.set('vrfs.0.name', 'VRF error');
      component.validationErrors.set('vrfs.0.serviceGraphs.0.name', 'Service graph error');
      component.validationErrors.set('vrfs.0.l3outs.0.name', 'L3Out error');
      component.validationErrors.set('externalFirewalls.0.externalVrfConnections.0.name', 'VRF connection error');
    });

    it('should detect tenant tab errors', () => {
      expect(component.tenantTabHasErrors).toBe(true);
    });

    it('should detect firewall tab errors', () => {
      expect(component.firewallsTabHasErrors).toBe(true);
    });

    it('should detect VRF tab errors', () => {
      expect(component.vrfsTabHasErrors).toBe(true);
    });

    it('should detect specific firewall errors', () => {
      expect(component.hasFirewallErrors(0)).toBe(true);
      expect(component.hasFirewallErrors(1)).toBe(false);
    });

    it('should detect specific VRF errors', () => {
      expect(component.hasVrfErrors(0)).toBe(true);
      expect(component.hasVrfErrors(1)).toBe(false);
    });

    it('should detect service graph errors', () => {
      expect(component.hasServiceGraphErrors(0, 0)).toBe(true);
      expect(component.hasServiceGraphErrors(0, 1)).toBe(false);
    });

    it('should detect L3Out errors', () => {
      expect(component.hasL3OutErrors(0, 0)).toBe(true);
      expect(component.hasL3OutErrors(0, 1)).toBe(false);
    });

    it('should detect external VRF connection errors', () => {
      expect(component.hasExternalVrfConnectionErrors(0, 0)).toBe(true);
      expect(component.hasExternalVrfConnectionErrors(0, 1)).toBe(false);
    });
  });

  describe('UI Interactions', () => {
    it('should set active tab', () => {
      component.setActiveTab('firewalls');
      expect(component.activeTab).toBe('firewalls');

      component.setActiveTab('vrfs');
      expect(component.activeTab).toBe('vrfs');
    });

    it('should toggle left panel', () => {
      expect(component.leftPanelCollapsed).toBe(false);

      component.toggleLeftPanel();
      expect(component.leftPanelCollapsed).toBe(true);

      component.toggleLeftPanel();
      expect(component.leftPanelCollapsed).toBe(false);
    });

    it('should show config panel', () => {
      component.showConfig();
      expect(component.rightPanelView).toBe('config');
    });

    it('should show response panel', () => {
      component.showResponse();
      expect(component.rightPanelView).toBe('response');
    });

    it('should handle config mutation', () => {
      component.validation = mockValidationResponse;
      component.hasValidated = true;
      component.hasUnsavedChanges = false;
      component.validationErrors.set('test', 'error');

      component.onConfigMutated();

      expect(component.validation).toBeNull();
      expect(component.hasValidated).toBe(false);
      expect(component.hasUnsavedChanges).toBe(true);
      expect(component.validationErrors.size).toBe(0);
    });

    it('should navigate back', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/adminportal/tenant-v2'], { queryParamsHandling: 'merge' });
    });
  });

  describe('Clipboard Operations', () => {
    beforeEach(() => {
      component.displayConfig = '{"test": "data"}';
    });

    it('should copy to clipboard successfully', () => {
      mockClipboard.copy.mockReturnValue(true);

      component.copyToClipboard();

      expect(mockClipboard.copy).toHaveBeenCalledWith('{"test": "data"}');
    });

    it('should handle clipboard copy failure', () => {
      mockClipboard.copy.mockReturnValue(false);

      component.copyToClipboard();

      expect(mockClipboard.copy).toHaveBeenCalledWith('{"test": "data"}');
    });

    it('should handle empty config', () => {
      component.displayConfig = '';

      component.copyToClipboard();

      expect(mockClipboard.copy).not.toHaveBeenCalled();
    });
  });

  describe('Text Parsing', () => {
    it('should parse valid JSON', () => {
      component.previewFormat = 'json';
      component.displayConfig = '{"tenant": {"name": "test"}}';

      component.onTextChange();

      expect(component.parseError).toBeNull();
      expect(component.parsedConfig).toEqual({
        tenant: { name: 'test' },
        externalFirewalls: [],
        vrfs: [],
      });
    });

    it('should handle invalid JSON', () => {
      component.previewFormat = 'json';
      component.displayConfig = '{"invalid": json}';

      component.onTextChange();

      expect(component.parseError).toContain('not valid JSON');
      expect(component.parsedConfig).toBeNull();
    });

    it('should parse valid YAML', () => {
      component.previewFormat = 'yaml';
      component.displayConfig = 'tenant:\n  name: test';

      component.onTextChange();

      expect(component.parseError).toBeNull();
      expect(component.parsedConfig).toEqual({
        tenant: { name: 'test' },
        externalFirewalls: [],
        vrfs: [],
      });
    });

    it('should clamp selections when arrays shrink', () => {
      component.config = {
        ...mockConfig,
        externalFirewalls: [],
        vrfs: [],
      };
      component.selectedFirewallIdx = 5;
      component.selectedVrfIdx = 5;
      component.displayConfig = JSON.stringify(component.config);

      component.onTextChange();

      expect(component.selectedFirewallIdx).toBe(0);
      expect(component.selectedVrfIdx).toBe(0);
    });
  });

  describe('Window Unload Handler', () => {
    it('should show warning when has unsaved changes in create mode', () => {
      component.hasUnsavedChanges = true;
      component.mode = 'create';
      const mockEvent = { returnValue: '' };

      component.unloadNotification(mockEvent);

      expect(mockEvent.returnValue).toBe('You have unsaved changes. Are you sure you want to leave?');
    });

    it('should not show warning when no unsaved changes', () => {
      component.hasUnsavedChanges = false;
      component.mode = 'create';
      const mockEvent = { returnValue: '' };

      component.unloadNotification(mockEvent);

      expect(mockEvent.returnValue).toBe('');
    });

    it('should not show warning in edit mode', () => {
      component.hasUnsavedChanges = true;
      component.mode = 'edit';
      const mockEvent = { returnValue: '' };

      component.unloadNotification(mockEvent);

      expect(mockEvent.returnValue).toBe('');
    });
  });
});
