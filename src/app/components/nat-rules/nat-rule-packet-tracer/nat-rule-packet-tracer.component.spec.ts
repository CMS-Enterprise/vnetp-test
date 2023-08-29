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
} from 'client';
import { of } from 'rxjs';
import { NatRulePacketTracerComponent } from './nat-rule-packet-tracer.component';

describe('NatRulesPacketTracerComponent', () => {
  let component: NatRulePacketTracerComponent;
  let fixture: ComponentFixture<NatRulePacketTracerComponent>;
  let netObjService: V1NetworkSecurityNetworkObjectsService;
  let netObjGroupService: V1NetworkSecurityNetworkObjectGroupsService;
  let serviceObjectService: V1NetworkSecurityServiceObjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxPaginationModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        NatRulePacketTracerComponent,
        ImportExportComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        NatRulePacketTracerComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
      ],
    });
    const natRules = [
      {
        id: 1,
        name: 'nat-rule1',
        description: '',
        enabled: true,
        ruleIndex: 1,
        translationType: 'DynamicIp',
        direction: 'In',
        biDirectional: false,
        originalSourceAddressType: 'NetworkObject',
        translatedSourceAddressType: 'NetworkObject',
        originalDestinationAddressType: 'NetworkObject',
        translatedDestinationAddressType: 'NetworkObject',
        originalServiceType: 'ServiceObject',
        translatedServiceType: 'ServiceObject',
        originalSourceNetworkObjectId: '1',
        translatedSourceNetworkObjectId: '1',
        originalDestinationNetworkObjectId: '1',
        translatedDestinationNetworkObjectId: '1',
        originalServiceObjectId: '1',
        translatedServiceObjectId: '1',
      },
      {
        id: 2,
        name: 'nat-rule2',
        description: '',
        enabled: true,
        ruleIndex: 2,
        translationType: 'DynamicIp',
        direction: 'In',
        biDirectional: false,
        originalSourceAddressType: 'NetworkObject',
        translatedSourceAddressType: 'NetworkObject',
        originalDestinationAddressType: 'NetworkObject',
        translatedDestinationAddressType: 'NetworkObject',
        originalServiceType: 'ServiceObject',
        translatedServiceType: 'ServiceObject',
        originalSourceNetworkObjectId: '1',
        translatedSourceNetworkObjectId: '1',
        originalDestinationNetworkObjectId: '1',
        translatedDestinationNetworkObjectId: '1',
        originalServiceObjectId: '1',
        translatedServiceObjectId: '1',
      },
      {
        id: 3,
        name: 'nat-rule3',
        description: '',
        enabled: true,
        ruleIndex: 3,
        translationType: 'DynamicIp',
        direction: 'In',
        biDirectional: false,
        originalSourceAddressType: 'NetworkObjectGroup',
        translatedSourceAddressType: 'NetworkObjectGroup',
        originalDestinationAddressType: 'NetworkObjectGroup',
        translatedDestinationAddressType: 'NetworkObjectGroup',
        originalServiceType: 'ServiceObject',
        translatedServiceType: 'ServiceObject',
        originalSourceNetworkObjectGroupId: '1',
        translatedSourceNetworkObjectGroupId: '1',
        originalDestinationNetworkObjectGroupId: '1',
        translatedDestinationNetworkObjectGroupId: '1',
        originalServiceObjectId: '1',
        translatedServiceObjectId: '1',
      },
    ];

    fixture = TestBed.createComponent(NatRulePacketTracerComponent);
    component = fixture.componentInstance;
    component.objects = { natRules };
    netObjService = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
    netObjGroupService = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);
    serviceObjectService = TestBed.inject(V1NetworkSecurityServiceObjectsService);
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

  it('should have these required by default', () => {
    const requiredFields = ['originalSourceIp', 'originalDestinationIp'];
    requiredFields.forEach(field => {
      expect(isRequired(field)).toBe(true);
    });
  });

  it('should find a nat rule match if all searched IPs/fields exist in the rule', async () => {
    component.form.setValue({
      direction: 'In',
      biDirectional: false,

      originalSourceIp: '192.168.0.25',
      originalDestinationIp: '192.168.0.25',

      translatedSourceIp: '192.168.0.25',
      translatedDestinationIp: '192.168.0.25',

      originalPort: '2',
      translatedPort: '2',

      enabled: true,
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

    jest.spyOn(serviceObjectService, 'getOneServiceObject').mockImplementation(() => {
      return of({
        name: 'ser-obj1',
        type: 'TCP',
        sourcePorts: '2',
        destinationPorts: '2',
      } as any);
    });

    await component.search();
    const matchingRules = component.rulesHit;
    const partialMatches = component.partialMatches;
    expect(matchingRules).toEqual(['nat-rule1', 'nat-rule2', 'nat-rule3']);
    // expect(partialMatches).toEqual([
    //   {
    //     checkList: {
    //       originalSourceInRange: true,
    //       originalDestInRange: true,
    //       directionMatch: true,
    //       biDirectionalMatch: true,

    //       translatedSourceInRange: true,
    //       translatedDestInRange: true,

    //       originalPortMatch: true,
    //       translatedPortMatch: true,

    //     },
    //     name: 'fw-rule4',
    //   },
    // ]);
  });
});
