/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
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
} from 'client';
import { FirewallRuleObjectInfoModalComponent } from './firewall-rule-object-info-modal/firewall-rule-object-info-modal.component';
import { of } from 'rxjs';

describe('FirewallRuleModalComponent', () => {
  let component: FirewallRuleModalComponent;
  let fixture: ComponentFixture<FirewallRuleModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
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
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FirewallRuleModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

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
    let ngxSmartModalService: NgxSmartModalService;
    beforeEach(async () => {
      ngxSmartModalService = TestBed.inject(NgxSmartModalService);
    });

    it('should call NetworkObjectService when objectType is NetworkObject', () => {
      const objectId = 'test-id';
      const property = 'test-property';
      const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
      const getSpy = jest.spyOn(ngxSmartModalService, 'getModal');

      jest
        .spyOn(component['networkObjectService'], 'getOneNetworkObject')
        .mockReturnValue(of({ name: 'test-name', type: 'Fqdn', fqdn: 'www.example.com' } as any));

      component.getObjectInfo(property, 'NetworkObject', objectId);

      expect(component['networkObjectService'].getOneNetworkObject).toHaveBeenCalled();

      jest
        .spyOn(component['networkObjectService'], 'getOneNetworkObject')
        .mockReturnValue(of({ name: 'test-name', type: 'Range', startIpAddress: '192.168.0.1', endIpAddress: '192.168.0.10' } as any));

      component.getObjectInfo(property, 'NetworkObject', objectId);

      expect(component['networkObjectService'].getOneNetworkObject).toHaveBeenCalled();

      jest
        .spyOn(component['networkObjectService'], 'getOneNetworkObject')
        .mockReturnValue(of({ name: 'test-name', type: 'IpAddress', ipAddress: '192.168.0.1' } as any));

      component.getObjectInfo(property, 'NetworkObject', objectId);

      expect(component['networkObjectService'].getOneNetworkObject).toHaveBeenCalled();
      expect(setModalDataSpy).toHaveBeenCalled();
      expect(getSpy).toHaveBeenCalled();
    });

    it('should call NetworkObjectService when objectType is NetworkObjectGroup', () => {
      const objectId = 'test-id';
      const property = 'test-property';
      const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
      const getSpy = jest.spyOn(ngxSmartModalService, 'getModal');

      jest.spyOn(component['networkObjectGroupService'], 'getOneNetworkObjectGroup').mockReturnValue(
        of({
          name: 'test-name',
          networkObjects: [{ name: 'test-name', type: 'Range', startIpAddress: '192.168.0.1', endIpAddress: '192.168.0.10' }],
        } as any),
      );

      component.getObjectInfo(property, 'NetworkObjectGroup', objectId);

      expect(component['networkObjectGroupService'].getOneNetworkObjectGroup).toHaveBeenCalled();

      jest
        .spyOn(component['networkObjectGroupService'], 'getOneNetworkObjectGroup')
        .mockReturnValue(of({ name: 'test-name', networkObjects: [{ name: 'test-name', type: 'Fqdn', fqdn: 'www.example.com' }] } as any));

      component.getObjectInfo(property, 'NetworkObjectGroup', objectId);

      expect(component['networkObjectGroupService'].getOneNetworkObjectGroup).toHaveBeenCalled();

      jest
        .spyOn(component['networkObjectGroupService'], 'getOneNetworkObjectGroup')
        .mockReturnValue(
          of({ name: 'test-name', networkObjects: [{ name: 'test-name', type: 'IpAddress', ipAddress: '192.168.0.1' }] } as any),
        );

      component.getObjectInfo(property, 'NetworkObjectGroup', objectId);

      expect(component['networkObjectGroupService'].getOneNetworkObjectGroup).toHaveBeenCalled();
      expect(setModalDataSpy).toHaveBeenCalled();
      expect(getSpy).toHaveBeenCalled();
    });

    it('should call ServiceObjectService when objectType is ServiceObject', () => {
      const objectId = 'test-id';
      const property = 'test-property';
      const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
      const getSpy = jest.spyOn(ngxSmartModalService, 'getModal');
      jest
        .spyOn(component['serviceObjectService'], 'getOneServiceObject')
        .mockReturnValue(of({ name: 'test-name', protocol: 'TCP', sourcePorts: '80', destinationPorts: '8080' } as any));

      component.getObjectInfo(property, 'ServiceObject', objectId);

      expect(component['serviceObjectService'].getOneServiceObject).toHaveBeenCalled();
      expect(setModalDataSpy).toHaveBeenCalled();
      expect(getSpy).toHaveBeenCalled();
    });

    it('should call ServiceObjectGroupService when objectType is ServiceObjectGroup', () => {
      const objectId = 'test-id';
      const property = 'test-property';
      const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
      const getSpy = jest.spyOn(ngxSmartModalService, 'getModal');

      jest.spyOn(component['serviceObjectGroupService'], 'getOneServiceObjectGroup').mockReturnValue(
        of({
          name: 'test-name',
          serviceObjects: [{ name: 'test-object-name', protocol: 'TCP', sourcePorts: '80', destinationPorts: '8080' }],
        } as any),
      );

      component.getObjectInfo(property, 'ServiceObjectGroup', objectId);

      expect(component['serviceObjectGroupService'].getOneServiceObjectGroup).toHaveBeenCalled();
      expect(setModalDataSpy).toHaveBeenCalled();
      expect(getSpy).toHaveBeenCalled();
    });
  });
});
