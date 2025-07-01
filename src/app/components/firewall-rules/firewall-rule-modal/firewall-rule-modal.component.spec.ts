/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FirewallRuleModalComponent } from './firewall-rule-modal.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockNgSelectComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import {
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  FirewallRuleSourceAddressTypeEnum,
  FirewallRuleDestinationAddressTypeEnum,
  FirewallRuleServiceTypeEnum,
  FirewallRuleGroupTypeEnum,
} from 'client';
import { FirewallRuleObjectInfoModalComponent } from './firewall-rule-object-info-modal/firewall-rule-object-info-modal.component';
import { of } from 'rxjs';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { AppIdRuntimeService } from '../../app-id-runtime/app-id-runtime.service';
import { TierContextService } from '../../../services/tier-context.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('FirewallRuleModalComponent', () => {
  let component: FirewallRuleModalComponent;
  let fixture: ComponentFixture<FirewallRuleModalComponent>;
  let mockActivatedRoute: any;
  let mockTierContextService: jest.Mocked<TierContextService>;
  let mockAppIdRuntimeService;
  let getFormControl: (prop: string) => FormControl;
  let isRequired: (prop: string) => boolean;

  beforeEach(() => {
    getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
    isRequired = (prop: string): boolean => {
      const fc = getFormControl(prop);
      if (!fc) return false; // Guard against null fc if form not fully built
      fc.setValue(null);
      return !!fc.errors && !!fc.errors.required;
    };

    mockActivatedRoute = {
      snapshot: {
        data: {
          // mode: ApplicationMode.TENANTV2 // Example if a default mode is needed
        },
        parent: null,
        firstChild: null,
      },
      parent: null,
      firstChild: null,
    };

    mockAppIdRuntimeService = { resetDto: jest.fn(), isDtoEmpty: jest.fn(), saveDto: jest.fn() };
    mockTierContextService = {
      currentTierValue: {},
    } as any;
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        FirewallRuleModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockNgSelectComponent,
        FirewallRuleObjectInfoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityFirewallRulesService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AppIdRuntimeService, useValue: mockAppIdRuntimeService },
        { provide: TierContextService, useValue: mockTierContextService },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRuleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct required and optional fields by default', () => {
    const requiredFields = [
      'name',
      'action',
      'protocol',
      'ruleIndex',
      'sourceIpAddress',
      'sourcePorts',
      'destinationIpAddress',
      'destinationPorts',
      'logging',
      'enabled',
    ];
    const optionalFields = [
      'description',
      'sourceNetworkType',
      'sourceNetworkObject',
      'sourceNetworkObjectGroup',
      'serviceType',
      'serviceObject',
      'serviceObjectGroup',
      'destinationNetworkType',
      'destinationNetworkObject',
      'destinationNetworkObjectGroup',
    ];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  it('sourceNetworkType should have default value "IpAddress"', () => {
    const sourceNetworkType = getFormControl('sourceNetworkType');
    expect(sourceNetworkType.value).toBe('IpAddress');
  });

  it('serviceType should have default value "Port"', () => {
    const serviceType = getFormControl('serviceType');
    expect(serviceType.value).toBe('Port');
  });

  it('destinationNetworkType should have default value "IpAddress"', () => {
    const destinationNetworkType = getFormControl('destinationNetworkType');
    expect(destinationNetworkType.value).toBe('IpAddress');
  });

  it('sourceIp should be required if source network type is ip', () => {
    const sourceNetworkType = getFormControl('sourceNetworkType');
    sourceNetworkType.setValue('IpAddress');

    expect(isRequired('sourceIpAddress')).toBe(true);
  });

  it('sourceNetworkObject should be required if source network type is object', () => {
    const sourceNetworkType = getFormControl('sourceNetworkType');
    sourceNetworkType.setValue('NetworkObject');

    expect(isRequired('sourceNetworkObject')).toBe(true);
  });

  it('sourceNetworkObject should be required if source network type is objectGroup', () => {
    const sourceNetworkType = getFormControl('sourceNetworkType');
    sourceNetworkType.setValue('NetworkObjectGroup');

    expect(isRequired('sourceNetworkObjectGroup')).toBe(true);
  });

  it('sourcePort should be required if source service type is port', () => {
    const serviceType = getFormControl('serviceType');
    serviceType.setValue('Port');

    expect(isRequired('sourcePorts')).toBe(true);
  });

  it('serviceObject should be required if source service type is object', () => {
    const serviceType = getFormControl('serviceType');
    serviceType.setValue('ServiceObject');

    expect(isRequired('serviceObject')).toBe(true);
  });

  it('serviceObjectGroup should be required if source service type is objectGroup', () => {
    const serviceType = getFormControl('serviceType');
    serviceType.setValue('ServiceObjectGroup');

    expect(isRequired('serviceObjectGroup')).toBe(true);
  });

  it('destinationIp should be required if destination network type is ip', () => {
    const destinationNetworkType = getFormControl('destinationNetworkType');
    destinationNetworkType.setValue('IpAddress');

    expect(isRequired('destinationIpAddress')).toBe(true);
  });

  it('destinationNetworkObject should be required if destination network type is object', () => {
    const destinationNetworkType = getFormControl('destinationNetworkType');
    destinationNetworkType.setValue('NetworkObject');

    expect(isRequired('destinationNetworkObject')).toBe(true);
  });

  it('destinationNetworkObject should be required if destination network type is objectGroup', () => {
    const destinationNetworkType = getFormControl('destinationNetworkType');
    destinationNetworkType.setValue('NetworkObjectGroup');

    expect(isRequired('destinationNetworkObjectGroup')).toBe(true);
  });

  it('destinationPort should be required if destination service type is port', () => {
    const serviceType = getFormControl('serviceType');
    serviceType.setValue('Port');

    expect(isRequired('destinationPorts')).toBe(true);
  });

  it('service inputs should be reset if protocol changes to IP', () => {
    const protocol = getFormControl('protocol');
    protocol.setValue('TCP');

    const serviceType = getFormControl('serviceType');
    serviceType.setValue('Port');
    const sourcePorts = getFormControl('sourcePorts');
    const destinationPorts = getFormControl('destinationPorts');
    destinationPorts.setValue('80');
    sourcePorts.setValue('80');

    protocol.setValue('IP');

    expect(sourcePorts.value).toBe('any');
    expect(destinationPorts.value).toBe('any');
    expect(serviceType.value).toBe('Port');
  });

  it('service inputs should be reset if protocol changes to ICMP', () => {
    jest.spyOn(mockAppIdRuntimeService, 'resetDto').mockImplementation();
    const protocol = getFormControl('protocol');
    protocol.setValue('TCP');

    const serviceType = getFormControl('serviceType');
    serviceType.setValue('Port');
    const sourcePorts = getFormControl('sourcePorts');
    const destinationPorts = getFormControl('destinationPorts');
    destinationPorts.setValue('80');
    sourcePorts.setValue('80');

    protocol.setValue('ICMP');

    expect(sourcePorts.value).toBe('any');
    expect(destinationPorts.value).toBe('any');
    expect(serviceType.value).toBe('Port');
  });

  it('service inputs should be cleared when protocol changes to UDP', () => {
    const protocol = getFormControl('protocol');
    protocol.setValue('UDP');

    const serviceType = getFormControl('serviceType');
    serviceType.setValue('Port');
    const sourcePorts = getFormControl('sourcePorts');
    const destinationPorts = getFormControl('destinationPorts');
    destinationPorts.setValue('80');
    sourcePorts.setValue('80');

    protocol.setValue('IP');
    protocol.setValue('UDP');

    expect(sourcePorts.value).toBe(null);
    expect(destinationPorts.value).toBe(null);
    expect(serviceType.value).toBe('Port');
  });

  it('service inputs should be cleared when protocol changes to TCP', () => {
    const protocol = getFormControl('protocol');
    protocol.setValue('TCP');

    const serviceType = getFormControl('serviceType');
    serviceType.setValue('Port');
    const sourcePorts = getFormControl('sourcePorts');
    const destinationPorts = getFormControl('destinationPorts');
    destinationPorts.setValue('80');
    sourcePorts.setValue('80');

    protocol.setValue('IP');
    protocol.setValue('TCP');

    expect(sourcePorts.value).toBe(null);
    expect(destinationPorts.value).toBe(null);
    expect(serviceType.value).toBe('Port');
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  describe('getObjectInfo', () => {
    let handleNetworkObjectSpy: jest.SpyInstance;
    let handleNetworkObjectGroupSpy: jest.SpyInstance;
    let handleServiceObjectSpy: jest.SpyInstance;
    let handleServiceObjectGroupSpy: jest.SpyInstance;

    beforeEach(() => {
      handleNetworkObjectSpy = jest.spyOn(component as any, 'handleNetworkObject').mockImplementation();
      handleNetworkObjectGroupSpy = jest.spyOn(component as any, 'handleNetworkObjectGroup').mockImplementation();
      handleServiceObjectSpy = jest.spyOn(component as any, 'handleServiceObject').mockImplementation();
      handleServiceObjectGroupSpy = jest.spyOn(component as any, 'handleServiceObjectGroup').mockImplementation();
    });

    it('should do nothing if objectId is missing', () => {
      component.getObjectInfo('prop', 'type', null);
      expect(handleNetworkObjectSpy).not.toHaveBeenCalled();
      expect(handleNetworkObjectGroupSpy).not.toHaveBeenCalled();
      expect(handleServiceObjectSpy).not.toHaveBeenCalled();
      expect(handleServiceObjectGroupSpy).not.toHaveBeenCalled();
    });

    it('should call handleNetworkObject for NetworkObject type', () => {
      component.getObjectInfo('Source', FirewallRuleSourceAddressTypeEnum.NetworkObject, 'id1');
      expect(handleNetworkObjectSpy).toHaveBeenCalledWith('Source', 'id1');
    });

    it('should call handleNetworkObject for destination NetworkObject type', () => {
      component.getObjectInfo('Destination', FirewallRuleDestinationAddressTypeEnum.NetworkObject, 'id1');
      expect(handleNetworkObjectSpy).toHaveBeenCalledWith('Destination', 'id1');
    });

    it('should call handleNetworkObjectGroup for NetworkObjectGroup type', () => {
      component.getObjectInfo('Source', FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup, 'id2');
      expect(handleNetworkObjectGroupSpy).toHaveBeenCalledWith('Source', 'id2');
    });

    it('should call handleNetworkObjectGroup for destination NetworkObjectGroup type', () => {
      component.getObjectInfo('Destination', FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup, 'id2');
      expect(handleNetworkObjectGroupSpy).toHaveBeenCalledWith('Destination', 'id2');
    });

    it('should call handleServiceObject for ServiceObject type', () => {
      component.getObjectInfo('Service', FirewallRuleServiceTypeEnum.ServiceObject, 'id3');
      expect(handleServiceObjectSpy).toHaveBeenCalledWith('Service', 'id3');
    });

    it('should call handleServiceObjectGroup for ServiceObjectGroup type', () => {
      component.getObjectInfo('Service', FirewallRuleServiceTypeEnum.ServiceObjectGroup, 'id4');
      expect(handleServiceObjectGroupSpy).toHaveBeenCalledWith('Service', 'id4');
    });
  });

  describe('Object Info Handlers', () => {
    let ngxSmartModalService: NgxSmartModalService;
    beforeEach(() => {
      ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngxSmartModalService, 'getModal').mockReturnValue({
        open: jest.fn(),
        onCloseFinished: of(null),
      } as any);
    });

    it('should handle NetworkObject info correctly', () => {
      const networkObjectService = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
      const getOneSpy = jest
        .spyOn(networkObjectService, 'getOneNetworkObject')
        .mockReturnValue(of({ name: 'test-name', type: 'IpAddress', ipAddress: '1.1.1.1' } as any));
      component.handleNetworkObject('Source', 'no-1');
      expect(getOneSpy).toHaveBeenCalledWith({ id: 'no-1' });
    });

    it('should handle NetworkObject info for Fqdn type', () => {
      const networkObjectService = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
      const getOneSpy = jest
        .spyOn(networkObjectService, 'getOneNetworkObject')
        .mockReturnValue(of({ name: 'test-name', type: 'Fqdn', fqdn: 'a.com' } as any));
      component.handleNetworkObject('Source', 'no-1');
      expect(getOneSpy).toHaveBeenCalledWith({ id: 'no-1' });
    });

    it('should handle NetworkObject info for Range type', () => {
      const networkObjectService = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
      const getOneSpy = jest
        .spyOn(networkObjectService, 'getOneNetworkObject')
        .mockReturnValue(of({ name: 'test-name', type: 'Range', startIpAddress: '1.1.1.1', endIpAddress: '1.1.1.2' } as any));
      component.handleNetworkObject('Source', 'no-1');
      expect(getOneSpy).toHaveBeenCalledWith({ id: 'no-1' });
    });

    it('should handle NetworkObjectGroup info correctly with different member types', () => {
      const networkObjectGroupService = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);
      const mockNetworkObjects = [
        { name: 'obj1', type: 'IpAddress', ipAddress: '1.1.1.1' },
        { name: 'obj2', type: 'Range', startIpAddress: '1.1.1.2', endIpAddress: '1.1.1.3' },
        { name: 'obj3', type: 'Fqdn', fqdn: 'example.com' },
        { name: 'obj4', type: 'other' },
      ];
      const getOneSpy = jest
        .spyOn(networkObjectGroupService, 'getOneNetworkObjectGroup')
        .mockReturnValue(of({ name: 'test-group', networkObjects: mockNetworkObjects } as any));
      component.handleNetworkObjectGroup('Source', 'nog-1');
      expect(getOneSpy).toHaveBeenCalledWith({ id: 'nog-1', join: ['networkObjects'] });
    });

    it('should handle ServiceObject info correctly', () => {
      const serviceObjectService = TestBed.inject(V1NetworkSecurityServiceObjectsService);
      const getOneSpy = jest.spyOn(serviceObjectService, 'getOneServiceObject').mockReturnValue(of({ name: 'test-so' } as any));
      component.handleServiceObject('Service', 'so-1');
      expect(getOneSpy).toHaveBeenCalledWith({ id: 'so-1' });
    });

    it('should handle ServiceObjectGroup info correctly with members', () => {
      const serviceObjectGroupService = TestBed.inject(V1NetworkSecurityServiceObjectGroupsService);
      const mockServiceObjects = [
        {
          name: 'so1',
          protocol: 'TCP',
          sourcePorts: '80',
          destinationPorts: '80',
        },
      ];
      const getOneSpy = jest
        .spyOn(serviceObjectGroupService, 'getOneServiceObjectGroup')
        .mockReturnValue(of({ name: 'test-sog', serviceObjects: mockServiceObjects } as any));
      component.handleServiceObjectGroup('Service', 'sog-1');
      expect(getOneSpy).toHaveBeenCalledWith({ id: 'sog-1', join: ['serviceObjects'] });
    });
  });

  describe('when in TenantV2 mode', () => {
    beforeEach(async () => {
      mockActivatedRoute.snapshot.data.mode = ApplicationMode.TENANTV2;

      // It's often better to reset and reconfigure TestBed for clarity and to avoid side effects
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
        declarations: [
          FirewallRuleModalComponent,
          MockTooltipComponent,
          MockFontAwesomeComponent,
          MockNgxSmartModalComponent,
          MockNgSelectComponent,
          FirewallRuleObjectInfoModalComponent,
        ],
        providers: [
          MockProvider(NgxSmartModalService),
          MockProvider(V1NetworkSecurityFirewallRulesService),
          MockProvider(V1NetworkSecurityNetworkObjectsService),
          MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
          MockProvider(V1NetworkSecurityServiceObjectsService),
          MockProvider(V1NetworkSecurityServiceObjectGroupsService),
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
          { provide: AppIdRuntimeService, useValue: mockAppIdRuntimeService },
          { provide: TierContextService, useValue: mockTierContextService },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(FirewallRuleModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isTenantV2Mode to true', () => {
      expect(component.isTenantV2Mode).toBe(true);
    });

    it('should make sourceEndpointGroup required if sourceNetworkType is EndpointGroup', () => {
      component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.EndpointGroup);
      expect(isRequired('sourceEndpointGroup')).toBe(true);
    });

    it('should make sourceEndpointSecurityGroup required if sourceNetworkType is EndpointSecurityGroup', () => {
      component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup);
      expect(isRequired('sourceEndpointSecurityGroup')).toBe(true);
    });

    // Placeholder for more TenantV2 specific tests (getData, save, etc.)
  });

  describe('when NOT in TenantV2 mode (e.g., Netcentric, Appcentric)', () => {
    beforeEach(async () => {
      delete mockActivatedRoute.snapshot.data.mode;
      mockActivatedRoute.queryParamMap = of(new Map());

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
        declarations: [
          FirewallRuleModalComponent,
          MockTooltipComponent,
          MockFontAwesomeComponent,
          MockNgxSmartModalComponent,
          MockNgSelectComponent,
          FirewallRuleObjectInfoModalComponent,
        ],
        providers: [
          MockProvider(NgxSmartModalService),
          MockProvider(V1NetworkSecurityFirewallRulesService),
          MockProvider(V1NetworkSecurityNetworkObjectsService),
          MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
          MockProvider(V1NetworkSecurityServiceObjectsService),
          MockProvider(V1NetworkSecurityServiceObjectGroupsService),
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(FirewallRuleModalComponent);
      component = fixture.componentInstance;
    });

    it('should set isTenantV2Mode to false', () => {
      expect(component.isTenantV2Mode).toBe(false);
    });

    it('should NOT make sourceEndpointGroup required if sourceNetworkType is EndpointGroup', () => {
      fixture.detectChanges();
      component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.EndpointGroup);
      expect(isRequired('sourceEndpointGroup')).toBe(false);
    });

    // Placeholder for more non-TenantV2 specific tests
  });

  it('should open app id modal', () => {
    component.firewallRule = { id: '1' } as any;
    (mockTierContextService as any).currentTierValue = { id: '1' } as any;
    const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
    const subscribeSpy = jest.spyOn(component as any, 'subscribeToAppIdModal');
    const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
    const openSpy = jest.spyOn(ngxSmartModalService, 'open');

    component.openAppIdModal();

    expect(subscribeSpy).toHaveBeenCalled();
    expect(setModalDataSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith('appIdModal');
  });

  describe('subscribeToAppIdModal', () => {
    it('should update liteTableData when modal closes', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const mockModal = {
        onCloseFinished: of(null),
      };
      jest.spyOn(ngxSmartModalService, 'getModal').mockReturnValue(mockModal as any);
      const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
      const unsubscribeSpy = jest.fn();
      component.appIdModalSubscription = { unsubscribe: unsubscribeSpy } as any;
      const appsToAdd = [{ id: 'app1', name: 'App 1' }];
      const appsToRemove = [{ id: 'app2', name: 'App 2' }];
      (mockAppIdRuntimeService as any).dto = {
        panosApplicationsToAdd: appsToAdd,
        panosApplicationsToRemove: appsToRemove,
      };

      component['subscribeToAppIdModal']();

      expect(component.liteTableData).toEqual([
        { ...appsToAdd[0], remove: false },
        { ...appsToRemove[0], remove: true },
      ]);
      expect(resetModalDataSpy).toHaveBeenCalledWith('appIdModal');
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('handleAppIdRefresh', () => {
    it('should set isRefreshingAppId', () => {
      component.handleAppIdRefresh(true);
      expect(component.isRefreshingAppId).toBe(true);
      component.handleAppIdRefresh(false);
      expect(component.isRefreshingAppId).toBe(false);
    });
  });

  describe('save', () => {
    let firewallRuleService: V1NetworkSecurityFirewallRulesService;
    beforeEach(() => {
      firewallRuleService = TestBed.inject(V1NetworkSecurityFirewallRulesService);
      component.form.controls.name.setValue('test-rule');
      component.form.controls.action.setValue('Allow');
      component.form.controls.protocol.setValue('TCP');
      component.form.controls.ruleIndex.setValue(1);
      component.form.controls.sourceIpAddress.setValue('1.1.1.1');
      component.form.controls.sourcePorts.setValue('any');
      component.form.controls.destinationIpAddress.setValue('2.2.2.2');
      component.form.controls.destinationPorts.setValue('any');
      component.form.controls.logging.setValue(false);
      component.form.controls.enabled.setValue(true);
      fixture.detectChanges();
    });

    it('should not proceed if form is invalid', () => {
      const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule');
      component.form.controls.name.setValue(''); // make form invalid
      component.save();
      expect(component.submitted).toBe(true);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should handle NaN for ruleIndex', () => {
      component.form.controls.ruleIndex.setValue(NaN as any);
      component.save();
      expect(component.form.controls.ruleIndex.value).toBe(null);
    });

    it('should call createOneFirewallRule on create mode', () => {
      component.ModalMode = ModalMode.Create;
      component.FirewallRuleGroupId = 'group-1';
      const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
      const closeSpy = jest.spyOn(component, 'closeModal');
      component.save();
      expect(createSpy).toHaveBeenCalled();
      const createdRule = createSpy.mock.calls[0][0].firewallRule;
      expect(createdRule.firewallRuleGroupId).toBe('group-1');
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should call createOneFirewallRule with App IDs if enabled on create mode', () => {
      component.ModalMode = ModalMode.Create;
      component.appIdEnabled = true;
      const apps = [{ id: 'app-1' }];
      (mockAppIdRuntimeService as any).dto = { panosApplicationsToAdd: apps, panosApplicationsToRemove: [] };
      const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
      component.save();
      expect(createSpy).toHaveBeenCalled();
      const createdRule = createSpy.mock.calls[0][0].firewallRule;
      expect(createdRule.panosApplications).toEqual(apps);
    });

    it('should call updateOneFirewallRule on edit mode', () => {
      component.ModalMode = ModalMode.Edit;
      component.FirewallRuleId = 'rule-1';
      const updateSpy = jest.spyOn(firewallRuleService, 'updateOneFirewallRule').mockReturnValue(of({} as any));
      const closeSpy = jest.spyOn(component, 'closeModal');
      component.save();
      expect(updateSpy).toHaveBeenCalledWith({ id: 'rule-1', firewallRule: expect.any(Object) });
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should call saveDto and updateOneFirewallRule on edit mode with appId enabled', () => {
      component.ModalMode = ModalMode.Edit;
      component.FirewallRuleId = 'rule-1';
      component.appIdEnabled = true;
      component.firewallRule = { panosApplications: [{ id: 'app-old' }] } as any;
      const updateSpy = jest.spyOn(firewallRuleService, 'updateOneFirewallRule').mockReturnValue(of({} as any));
      const saveDtoSpy = jest.spyOn(mockAppIdRuntimeService, 'saveDto');
      component.save();
      expect(saveDtoSpy).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    });

    describe('branch coverage', () => {
      it('should correctly map fields for NetworkObject source', () => {
        component.ModalMode = ModalMode.Create;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.NetworkObject);
        component.form.controls.sourceNetworkObject.setValue('no-id');
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.sourceAddressType).toBe(FirewallRuleSourceAddressTypeEnum.NetworkObject);
        expect(rule.sourceNetworkObjectId).toBe('no-id');
      });

      it('should correctly map fields for NetworkObjectGroup source', () => {
        component.ModalMode = ModalMode.Create;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup);
        component.form.controls.sourceNetworkObjectGroup.setValue('nog-id');
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.sourceAddressType).toBe(FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup);
        expect(rule.sourceNetworkObjectGroupId).toBe('nog-id');
      });

      it('should correctly map fields for NetworkObject destination', () => {
        component.ModalMode = ModalMode.Create;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.NetworkObject);
        component.form.controls.destinationNetworkObject.setValue('no-id-dest');
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.destinationAddressType).toBe(FirewallRuleDestinationAddressTypeEnum.NetworkObject);
        expect(rule.destinationNetworkObjectId).toBe('no-id-dest');
      });

      it('should correctly map fields for NetworkObjectGroup destination', () => {
        component.ModalMode = ModalMode.Create;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup);
        component.form.controls.destinationNetworkObjectGroup.setValue('nog-id-dest');
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.destinationAddressType).toBe(FirewallRuleDestinationAddressTypeEnum.NetworkObjectGroup);
        expect(rule.destinationNetworkObjectGroupId).toBe('nog-id-dest');
      });

      it('should correctly map fields for ServiceObject', () => {
        component.ModalMode = ModalMode.Create;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.form.controls.serviceType.setValue(FirewallRuleServiceTypeEnum.ServiceObject);
        component.form.controls.serviceObject.setValue('so-id');
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.serviceType).toBe(FirewallRuleServiceTypeEnum.ServiceObject);
        expect(rule.serviceObjectId).toBe('so-id');
      });

      it('should correctly map fields for ServiceObjectGroup', () => {
        component.ModalMode = ModalMode.Create;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.form.controls.serviceType.setValue(FirewallRuleServiceTypeEnum.ServiceObjectGroup);
        component.form.controls.serviceObjectGroup.setValue('sog-id');
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.serviceType).toBe(FirewallRuleServiceTypeEnum.ServiceObjectGroup);
        expect(rule.serviceObjectGroupId).toBe('sog-id');
      });

      it('should correctly map fields for ZoneBased group type', () => {
        component.ModalMode = ModalMode.Create;
        component.firewallRuleGroupType = FirewallRuleGroupTypeEnum.ZoneBased;
        component.selectedFromZones = [{ id: 'z1' } as any];
        component.selectedToZones = [{ id: 'z2' } as any];
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.fromZone).toEqual(component.selectedFromZones);
        expect(rule.toZone).toEqual(component.selectedToZones);
        expect(rule.direction).toBeNull();
      });

      it('should correctly map fields for OneArmServiceGraph group type', () => {
        component.ModalMode = ModalMode.Create;
        component.firewallRuleGroupType = FirewallRuleGroupTypeEnum.OneArmServiceGraph;
        const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
        component.save();
        const rule = createSpy.mock.calls[0][0].firewallRule;
        expect(rule.fromZone).toBeNull();
        expect(rule.toZone).toBeNull();
        expect(rule.direction).toBeNull();
      });

      describe('in TenantV2 mode', () => {
        beforeEach(() => {
          component.applicationMode = ApplicationMode.TENANTV2;
        });

        it('should correctly map fields for EndpointGroup source', () => {
          component.ModalMode = ModalMode.Create;
          const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
          component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.EndpointGroup);
          component.form.controls.sourceEndpointGroup.setValue('epg-id');
          component.save();
          const rule = createSpy.mock.calls[0][0].firewallRule;
          expect(rule.sourceAddressType).toBe(FirewallRuleSourceAddressTypeEnum.EndpointGroup);
          expect(rule.sourceEndpointGroupId).toBe('epg-id');
        });

        it('should correctly map fields for EndpointSecurityGroup source', () => {
          component.ModalMode = ModalMode.Create;
          const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
          component.form.controls.sourceNetworkType.setValue(FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup);
          component.form.controls.sourceEndpointSecurityGroup.setValue('esg-id');
          component.save();
          const rule = createSpy.mock.calls[0][0].firewallRule;
          expect(rule.sourceAddressType).toBe(FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup);
          expect(rule.sourceEndpointSecurityGroupId).toBe('esg-id');
        });

        it('should correctly map fields for EndpointGroup destination', () => {
          component.ModalMode = ModalMode.Create;
          const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
          component.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.EndpointGroup);
          component.form.controls.destinationEndpointGroup.setValue('epg-id-dest');
          component.save();
          const rule = createSpy.mock.calls[0][0].firewallRule;
          expect(rule.destinationAddressType).toBe(FirewallRuleDestinationAddressTypeEnum.EndpointGroup);
          expect(rule.destinationEndpointGroupId).toBe('epg-id-dest');
        });

        it('should correctly map fields for EndpointSecurityGroup destination', () => {
          component.ModalMode = ModalMode.Create;
          const createSpy = jest.spyOn(firewallRuleService, 'createOneFirewallRule').mockReturnValue(of({} as any));
          component.form.controls.destinationNetworkType.setValue(FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup);
          component.form.controls.destinationEndpointSecurityGroup.setValue('esg-id-dest');
          component.save();
          const rule = createSpy.mock.calls[0][0].firewallRule;
          expect(rule.destinationAddressType).toBe(FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup);
          expect(rule.destinationEndpointSecurityGroupId).toBe('esg-id-dest');
        });
      });
    });
  });

  describe('closeModal and cancel', () => {
    it('should reset DTO and close modal on closeModal', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const resetDtoSpy = jest.spyOn(mockAppIdRuntimeService, 'resetDto');
      const closeSpy = jest.spyOn(ngxSmartModalService, 'close');

      component.closeModal();

      expect(resetDtoSpy).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalledWith('firewallRuleModal');
    });

    it('should reset DTO and close modal on cancel', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const resetDtoSpy = jest.spyOn(mockAppIdRuntimeService, 'resetDto');
      const closeSpy = jest.spyOn(ngxSmartModalService, 'close');

      component.cancel();

      expect(resetDtoSpy).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalledWith('firewallRuleModal');
    });
  });

  describe('getData', () => {
    it('should populate form correctly for Edit mode with various address types', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const firewallRule = {
        id: 'rule-1',
        name: 'test-rule',
        action: 'Allow',
        protocol: 'TCP',
        direction: 'Inbound',
        ruleIndex: 10,
        logging: true,
        enabled: true,
        sourceAddressType: FirewallRuleSourceAddressTypeEnum.NetworkObject,
        sourceNetworkObjectId: 'no-1',
        destinationAddressType: 'NetworkObjectGroup',
        destinationNetworkObjectGroupId: 'nog-1',
        serviceType: 'ServiceObject',
        serviceObjectId: 'so-1',
      };
      const dto = {
        ModalMode: ModalMode.Edit,
        FirewallRule: firewallRule,
        TierId: 'tier-1',
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto);

      component.getData();

      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.FirewallRuleId).toBe('rule-1');
      expect(component.form.value.name).toBe('test-rule');
      expect(component.form.value.sourceNetworkType).toBe(FirewallRuleSourceAddressTypeEnum.NetworkObject);
      expect(component.form.value.sourceNetworkObject).toBe('no-1');
      expect(component.form.value.destinationNetworkType).toBe('NetworkObjectGroup');
      expect(component.form.value.destinationNetworkObjectGroup).toBe('nog-1');
      expect(component.form.value.serviceType).toBe('ServiceObject');
      expect(component.form.value.serviceObject).toBe('so-1');
    });

    it('should handle ZoneBased group type with to and from zones', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const dto = {
        ModalMode: ModalMode.Create,
        GroupType: FirewallRuleGroupTypeEnum.ZoneBased,
        Zones: [
          { id: 'z1', name: 'Zone1', tierId: 't1' },
          { id: 'z2', name: 'Zone2', tierId: 't1' },
        ],
        FirewallRule: {
          fromZone: [{ id: 'z1', name: 'Zone1', tierId: 't1' }],
          toZone: [{ id: 'z2', name: 'Zone2', tierId: 't1' }],
        },
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto);

      component.getData();

      expect(component.firewallRuleGroupType).toBe(FirewallRuleGroupTypeEnum.ZoneBased);
      expect(component.zones).toEqual(dto.Zones);
      expect(component.selectedFromZones).toEqual(dto.FirewallRule.fromZone);
      expect(component.selectedToZones).toEqual(dto.FirewallRule.toZone);
    });

    it('should populate form correctly for TenantV2 mode with Endpoint Groups', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      // Simulate TenantV2 mode
      component.applicationMode = ApplicationMode.TENANTV2;

      const firewallRule = {
        id: 'rule-tv2',
        name: 'test-rule-tv2',
        sourceAddressType: FirewallRuleSourceAddressTypeEnum.EndpointGroup,
        sourceEndpointGroupId: 'epg-1',
        destinationAddressType: FirewallRuleDestinationAddressTypeEnum.EndpointSecurityGroup,
        destinationEndpointSecurityGroupId: 'esg-1',
      };
      const dto = {
        ModalMode: ModalMode.Edit,
        FirewallRule: firewallRule,
        EndpointGroups: [{ id: 'epg-1', name: 'EPG1' }],
        EndpointSecurityGroups: [{ id: 'esg-1', name: 'ESG1' }],
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);

      component.getData();

      expect(component.isTenantV2Mode).toBe(true);
      expect(component.endpointGroups).toEqual(dto.EndpointGroups);
      expect(component.endpointSecurityGroups).toEqual(dto.EndpointSecurityGroups);
      expect(component.form.value.sourceEndpointGroup).toBe('epg-1');
      expect(component.form.value.destinationEndpointSecurityGroup).toBe('esg-1');
    });

    it('should populate form correctly for IP Address and Port types', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const firewallRule = {
        sourceAddressType: FirewallRuleSourceAddressTypeEnum.IpAddress,
        sourceIpAddress: '1.2.3.4',
        destinationAddressType: FirewallRuleDestinationAddressTypeEnum.IpAddress,
        destinationIpAddress: '5.6.7.8',
        serviceType: FirewallRuleServiceTypeEnum.Port,
        sourcePorts: '1024',
        destinationPorts: '8080',
      };
      const dto = {
        ModalMode: ModalMode.Edit,
        FirewallRule: firewallRule,
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);

      component.getData();

      expect(component.form.value.sourceIpAddress).toBe('1.2.3.4');
      expect(component.form.value.destinationIpAddress).toBe('5.6.7.8');
      expect(component.form.value.serviceType).toBe(FirewallRuleServiceTypeEnum.Port);
      expect(component.form.value.sourcePorts).toBe('1024');
      expect(component.form.value.destinationPorts).toBe('8080');
    });

    it('should populate form correctly for ServiceObjectGroup type', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const firewallRule = {
        serviceType: FirewallRuleServiceTypeEnum.ServiceObjectGroup,
        serviceObjectGroupId: 'sog-1',
      };
      const dto = {
        ModalMode: ModalMode.Edit,
        FirewallRule: firewallRule,
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);

      component.getData();

      expect(component.form.value.serviceType).toBe(FirewallRuleServiceTypeEnum.ServiceObjectGroup);
      expect(component.form.value.serviceObjectGroup).toBe('sog-1');
    });

    it('should populate form for NetworkObjectGroup source', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const firewallRule = {
        sourceAddressType: FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup,
        sourceNetworkObjectGroupId: 'nog-src-id',
      };
      const dto = { ModalMode: ModalMode.Edit, FirewallRule: firewallRule };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      component.getData();
      expect(component.form.value.sourceNetworkType).toBe(FirewallRuleSourceAddressTypeEnum.NetworkObjectGroup);
      expect(component.form.value.sourceNetworkObjectGroup).toBe('nog-src-id');
    });

    it('should populate form for EndpointSecurityGroup source in TenantV2 mode', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      component.applicationMode = ApplicationMode.TENANTV2;
      const firewallRule = {
        sourceAddressType: FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup,
        sourceEndpointSecurityGroupId: 'esg-src-id',
      };
      const dto = { ModalMode: ModalMode.Edit, FirewallRule: firewallRule };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      component.getData();
      expect(component.isTenantV2Mode).toBe(true);
      expect(component.form.value.sourceNetworkType).toBe(FirewallRuleSourceAddressTypeEnum.EndpointSecurityGroup);
      expect(component.form.value.sourceEndpointSecurityGroup).toBe('esg-src-id');
    });

    it('should populate form for NetworkObject destination', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const firewallRule = {
        destinationAddressType: FirewallRuleDestinationAddressTypeEnum.NetworkObject,
        destinationNetworkObjectId: 'no-dest-id',
      };
      const dto = { ModalMode: ModalMode.Edit, FirewallRule: firewallRule };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      component.getData();
      expect(component.form.value.destinationNetworkType).toBe(FirewallRuleDestinationAddressTypeEnum.NetworkObject);
      expect(component.form.value.destinationNetworkObject).toBe('no-dest-id');
    });

    it('should populate form for EndpointGroup destination in TenantV2 mode', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      component.applicationMode = ApplicationMode.TENANTV2;
      const firewallRule = {
        destinationAddressType: FirewallRuleDestinationAddressTypeEnum.EndpointGroup,
        destinationEndpointGroupId: 'epg-dest-id',
      };
      const dto = { ModalMode: ModalMode.Edit, FirewallRule: firewallRule };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      component.getData();
      expect(component.isTenantV2Mode).toBe(true);
      expect(component.form.value.destinationNetworkType).toBe(FirewallRuleDestinationAddressTypeEnum.EndpointGroup);
      expect(component.form.value.destinationEndpointGroup).toBe('epg-dest-id');
    });

    it('should not throw if firewallRule is undefined', () => {
      const ngxSmartModalService = TestBed.inject(NgxSmartModalService);
      const dto = {
        ModalMode: ModalMode.Create,
        FirewallRule: undefined,
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      const resetSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');

      expect(() => component.getData()).not.toThrow();
      expect(resetSpy).toHaveBeenCalledWith('firewallRuleModal');
    });
  });

  describe('Zone selection', () => {
    beforeEach(() => {
      component.zones = [
        { id: 'z1', name: 'Zone1', tierId: 't1' },
        { id: 'z2', name: 'Zone2', tierId: 't1' },
      ];
      component.selectedFromZones = [];
      component.selectedToZones = [];
    });

    it('should add a zone to selectedFromZones', () => {
      component.form.controls.selectedFromZone.setValue('z1');
      component.addZone('from');
      expect(component.selectedFromZones).toHaveLength(1);
      expect(component.selectedFromZones[0].id).toBe('z1');
      expect(component.form.controls.selectedFromZone.value).toBeNull();
    });

    it('should add a zone to selectedToZones', () => {
      component.form.controls.selectedToZone.setValue('z2');
      component.addZone('to');
      expect(component.selectedToZones).toHaveLength(1);
      expect(component.selectedToZones[0].id).toBe('z2');
      expect(component.form.controls.selectedToZone.value).toBeNull();
    });

    it('should not add a duplicate zone', () => {
      component.selectedFromZones = [{ id: 'z1', name: 'Zone1', tierId: 't1' }];
      component.form.controls.selectedFromZone.setValue('z1');
      component.addZone('from');
      expect(component.selectedFromZones).toHaveLength(1);
    });

    it('should remove a zone from selectedFromZones', () => {
      component.selectedFromZones = [{ id: 'z1', name: 'Zone1', tierId: 't1' }];
      component.removeZone('from', 'z1');
      expect(component.selectedFromZones).toHaveLength(0);
    });

    it('should remove a zone from selectedToZones', () => {
      component.selectedToZones = [{ id: 'z1', name: 'Zone1', tierId: 't1' }];
      component.removeZone('to', 'z1');
      expect(component.selectedToZones).toHaveLength(0);
    });
  });

  describe('getToolTipMessage', () => {
    it('should return refreshing message', () => {
      component.isRefreshingAppId = true;
      expect(component.getToolTipMessage()).toBe('The App ID is currently refreshing, please wait.');
    });

    it('should return ICMP message', () => {
      component.isRefreshingAppId = false;
      component.disableAppIdIcmp = true;
      expect(component.getToolTipMessage()).toBe('App ID unvailable for ICMP.');
    });

    it('should return empty string when no condition is met', () => {
      component.isRefreshingAppId = false;
      component.disableAppIdIcmp = false;
      expect(component.getToolTipMessage()).toBe('');
    });
  });

  describe('reset', () => {
    it('should reset component state and form', () => {
      const unsubSpy = jest.spyOn(component as any, 'unsubAll');
      const buildFormSpy = jest.spyOn(component as any, 'buildForm');
      const setFormValidatorsSpy = jest.spyOn(component as any, 'setFormValidators');
      const resetDtoSpy = jest.spyOn(mockAppIdRuntimeService, 'resetDto');

      component.TierId = 'tier-1';
      component.submitted = true;
      component.reset();

      expect(unsubSpy).toHaveBeenCalled();
      expect(buildFormSpy).toHaveBeenCalled();
      expect(setFormValidatorsSpy).toHaveBeenCalled();
      expect(resetDtoSpy).toHaveBeenCalled();
      expect(component.TierId).toBeNull();
      expect(component.submitted).toBe(false);
    });
  });
});
