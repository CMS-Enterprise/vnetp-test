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
import { V1NetworkSecurityNetworkObjectsService, V1NetworkSecurityNetworkObjectGroupsService } from 'client';
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
        enabled: true,
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
    component.objects = { firewallRules: firewallRules };
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

  //   it('should have all fields required by default', () => {
  //     const requiredFields = ['direction', 'protocol', 'sourceIpAddress', 'destinationIpAddress', 'sourcePorts', 'destinationPorts'];
  //     requiredFields.forEach(field => {
  //         expect(isRequired(field)).toBe(true);
  //     })
  //   });

  it('should find a firewall rule match if all searched IPs/fields exist in the rule', () => {
    component.form.setValue({
      direction: 'In',
      protocol: 'IP',
      sourceIpAddress: '192.168.0.25',
      destinationIpAddress: '10.0.0.9',
      sourcePorts: '2',
      destinationPorts: '5',
    });

    jest.spyOn(netObjService, 'getOneNetworkObject').mockImplementation(() => {
      return of({
        name: 'net-obj-ip1',
        type: 'IpAddress',
        ipAddress: '192.168.0.25',
        id: '1',
      } as any);
    });

    jest.spyOn(netObjGroupService, 'getOneNetworkObjectGroup').mockImplementation(() => {
      return of({
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
      } as any);
    });

    // console.log('component.objects.firewallRules',component.objects);
    const matchingRule = component.search();
  });

  //   it('should find a firewall rule match if a rules source contains the searched value', () => {

  //     console.log('test2')
  //     component.form.setValue({
  //         direction: 'In',
  //         protocol: 'IP',
  //         sourceIpAddress: '192.168.1.25',
  //         destinationIpAddress: '10.0.0.9',
  //         sourcePorts: '2',
  //         destinationPorts: '5'
  //     });

  //     // console.log('component.objects.firewallRules',component.objects);
  //     const matchingRule = component.search();
  //   });

  //   it('should find a firewall rule match if all the souce/dest subnet of a rule contains the IP in the form field', () => {

  //     console.log('test3')
  //     component.form.setValue({
  //         direction: 'In',
  //         protocol: 'IP',
  //         sourceIpAddress: '192.168.1.25',
  //         destinationIpAddress: '10.0.1.9',
  //         sourcePorts: '2',
  //         destinationPorts: '5'
  //     });

  //     const matchingRule = component.search();
  //   });

  //   it('should find a firewall rule match if the sourceNetworkObject has an IP address that matches the form value', () => {

  //       console.log('test4')

  //       component.form.setValue({
  //           direction: 'In',
  //           protocol: 'IP',
  //           sourceIpAddress: '192.168.0.25',
  //           destinationIpAddress: '10.0.0.9',
  //           sourcePorts: '2',
  //           destinationPorts: '5'
  //       });

  //       const spy = jest.spyOn(netObjService, 'getOneNetworkObject').mockImplementation(() => {
  //           return of({
  //               name: 'net-obj-ip1',
  //               type: 'IpAddress',
  //               ipAddress: '192.168.0.25',
  //               id: '1'
  //           } as any)
  //       });
  //       const matchingRules = component.search();
  //       expect(spy).toHaveBeenCalledWith({id: "1"})
  //       console.log('matchingRules (in test)', matchingRules)
  //   })

  //   it('should find a firewall rule match if the sourceNetworkObjectGroup contains any members whose IP addresses match the form value', () => {
  //     console.log('test5');

  //     component.form.setValue({
  //       direction: 'In',
  //       protocol: 'IP',
  //       sourceIpAddress: '192.168.0.25',
  //       destinationIpAddress: '10.0.0.9',
  //       sourcePorts: '2',
  //       destinationPorts: '5',
  //     });

  //     const netObjGroupService = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);

  //     jest.spyOn(netObjGroupService, 'getOneNetworkObjectGroup').mockImplementation(() => {
  //       return of({
  //         name: 'net-obj-group1',
  //         id: '1',
  //         networkObjects: [
  //           {
  //             name: 'net-obj-ip1',
  //             type: 'IpAddress',
  //             ipAddress: '192.168.0.25',
  //             id: '1',
  //           },
  //         ],
  //       } as any);
  //     });

  //     const matchingRules = component.search();
  //     console.log('matchingRules', matchingRules);
  //   });
});
