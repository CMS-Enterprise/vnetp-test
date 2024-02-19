import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import {
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
} from 'client';
import { FirewallRulePacketTracerComponent } from '../firewall-rule-packet-tracer/firewall-rule-packet-tracer.component';
import { of } from 'rxjs';

describe('FirewallRulesPacketTracerComponent', () => {
  let component: FirewallRulePacketTracerComponent;
  let fixture: ComponentFixture<FirewallRulePacketTracerComponent>;
  let netObjService: V1NetworkSecurityNetworkObjectsService;
  let netObjGroupService: V1NetworkSecurityNetworkObjectGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxPaginationModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FirewallRulePacketTracerComponent,
        ImportExportComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        FirewallRulePacketTracerComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
      ],
    });
    const firewallRules = [
      {
        id: '1',
        name: 'fw-rule1',
        description: null,
        direction: 'In',
        action: 'Deny',
        protocol: 'IP',
        logging: false,
        enabled: true,
        ruleIndex: 1,
        sourceAddressType: 'IpAddress',
        destinationAddressType: 'IpAddress',
        serviceType: 'Port',
        sourceIpAddress: '192.168.0.25',
        destinationIpAddress: '10.0.0.9',
        sourcePorts: '2',
        destinationPorts: '5',
      },
      {
        id: '2',
        name: 'fw-rule2',
        description: null,
        direction: 'In',
        action: 'Deny',
        protocol: 'IP',
        logging: false,
        enabled: true,
        ruleIndex: 2,
        sourceAddressType: 'IpAddress',
        destinationAddressType: 'IpAddress',
        serviceType: 'Port',
        sourceIpAddress: '192.168.0.0/24',
        destinationIpAddress: '10.0.0.0/10',
        sourcePorts: '2',
        destinationPorts: '5',
      },
      {
        id: '3',
        name: 'fw-rule3',
        description: null,
        direction: 'In',
        action: 'Deny',
        protocol: 'IP',
        logging: false,
        enabled: true,
        ruleIndex: 3,
        sourceAddressType: 'NetworkObject',
        destinationAddressType: 'IpAddress',
        serviceType: 'Port',
        sourceNetworkObjectId: '1',
        destinationIpAddress: '10.0.0.0/10',
        sourcePorts: '2',
        destinationPorts: '5',
      },
      {
        id: '4',
        name: 'fw-rule4',
        description: null,
        direction: 'In',
        action: 'Deny',
        protocol: 'IP',
        logging: false,
        enabled: false,
        ruleIndex: 4,
        sourceAddressType: 'NetworkObjectGroup',
        destinationAddressType: 'IpAddress',
        serviceType: 'Port',
        sourceNetworkObjectGroupId: '1',
        destinationIpAddress: '10.0.0.9',
        sourcePorts: '2',
        destinationPorts: '5',
      },
    ];

    fixture = TestBed.createComponent(FirewallRulePacketTracerComponent);
    component = fixture.componentInstance;
    component.objects = { firewallRules };
    netObjService = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
    netObjGroupService = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
    // console.log('component', component)
  });

  it('should have all fields required by default', () => {
    const requiredFields = ['sourceIpAddress', 'destinationIpAddress'];
    requiredFields.forEach(field => {
      expect(isRequired(field)).toBe(true);
    });
  });

  it('should find a firewall rule match if all searched IPs/fields exist in the rule', async () => {
    component.form.setValue({
      direction: 'In',
      protocol: 'IP',
      sourceIpAddress: '192.168.0.25',
      destinationIpAddress: '10.0.0.9',
      sourcePorts: '2',
      destinationPorts: '5',
      enabled: true,
    });

    jest.spyOn(netObjService, 'getOneNetworkObject').mockImplementation(() =>
      of({
        name: 'net-obj-ip1',
        type: 'IpAddress',
        ipAddress: '192.168.0.25',
        id: '1',
      } as any),
    );

    jest.spyOn(netObjGroupService, 'getOneNetworkObjectGroup').mockImplementation(() =>
      of({
        name: 'net-obj-group1',
        id: '1',
        networkObjects: [
          {
            name: 'net-obj-ip1',
            type: 'IpAddress',
            ipAddress: '192.168.0.25',
            id: '1',
          },
        ],
      } as any),
    );

    await component.search();
    const matchingRules = component.rulesHit;
    const partialMatches = component.partialMatches;
    expect(matchingRules).toEqual(['fw-rule1', 'fw-rule2', 'fw-rule3']);
    expect(partialMatches).toEqual([
      {
        checkList: {
          sourceInRange: true,
          destInRange: true,
          directionMatch: true,
          protocolMatch: true,
          enabledMatch: false,
        },
        name: 'fw-rule4',
      },
    ]);
  });
});
