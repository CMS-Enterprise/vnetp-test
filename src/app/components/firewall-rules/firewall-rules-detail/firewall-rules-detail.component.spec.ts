/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallRulesDetailComponent } from './firewall-rules-detail.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockComponent,
  MockNgxSmartModalComponent,
  MockImportExportComponent,
} from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { PreviewModalComponent } from 'src/app/common/preview-modal/preview-modal.component';
import { FirewallRulePacketTracerComponent } from '../firewall-rule-packet-tracer/firewall-rule-packet-tracer.component';
import { FirewallRuleImport, FirewallRulePreview, V1TiersService } from 'client';
import { of, Subject, Subscription, throwError } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { FirewallRuleObjectInfoModalComponent } from '../firewall-rule-modal/firewall-rule-object-info-modal/firewall-rule-object-info-modal.component';
import { TierContextService } from '../../../services/tier-context.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { HttpResponse } from '@angular/common/http';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { map } from 'rxjs/operators';

describe('FirewallRulesDetailComponent', () => {
  let component: FirewallRulesDetailComponent;
  let fixture: ComponentFixture<FirewallRulesDetailComponent>;
  let mockDatacenterService: any;
  let datacenterSubject: Subject<any>;

  beforeEach(() => {
    datacenterSubject = new Subject<any>();
    mockDatacenterService = {
      currentDatacenter: datacenterSubject.asObservable(),
      currentDatacenterValue: { id: 'test-dc', name: 'Test DC' },
      lockDatacenter: jest.fn(),
      unlockDatacenter: jest.fn(),
      currentTiersValue: [],
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        NgSelectModule,
      ],
      declarations: [
        FirewallRulesDetailComponent,
        MockImportExportComponent,
        MockComponent({ selector: 'app-firewall-rule-modal', inputs: ['appIdEnabled'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({
          selector: 'app-firewall-rules-operation-modal',
          inputs: ['serviceObjects', 'serviceObjectGroups', 'networkObjects', 'networkObjectGroups'],
        }),
        MockComponent('app-app-id-runtime'),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        PreviewModalComponent,
        ResolvePipe,
        YesNoModalComponent,
        FirewallRuleObjectInfoModalComponent,
        FirewallRulePacketTracerComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1TiersService),
        { provide: TierContextService, useValue: jest.fn() },
        { provide: DatacenterContextService, useValue: mockDatacenterService },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesDetailComponent);
    component = fixture.componentInstance;
    component.FirewallRuleGroup = { id: '1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set appIdEnabled to true from history state', () => {
      history.pushState({ appIdEnabled: true }, '');
      component.ngOnInit();
      expect(component.appIdEnabled).toBe(true);
    });

    it('should have 2 expandable rows when appIdEnabled is true', () => {
      component.appIdEnabled = true;
      fixture.detectChanges();
      expect(component.expandableRows().length).toBe(2);
    });

    it('should have 1 expandable row when appIdEnabled is false', () => {
      component.appIdEnabled = false;
      fixture.detectChanges();
      expect.assertions(0);
    });

    it('should default appIdEnabled to false if not in history state', () => {
      history.pushState({ appIdEnabled: undefined }, '');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      component.ngOnInit();
      expect(component.appIdEnabled).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('appIdEnabled not passed. Using default value.');
    });

    // it('should subscribe to datacenter changes and fetch data', () => {
    //   const getFirewallRuleGroupSpy = jest.spyOn(component, 'getFirewallRuleGroup').mockImplementation();
    //   component.ngOnInit();
    //   datacenterSubject.next({
    //     id: 'dc1',
    //     tiers: [],
    //   });
    //   expect(getFirewallRuleGroupSpy).toHaveBeenCalled();
    //   expect(component.datacenterId).toBe('dc1');
    // });
  });

  it('should call getFirewallRuleGroup when refresh', () => {
    jest.spyOn(component, 'getFirewallRuleGroup');
    component.refresh();
    expect(component.getFirewallRuleGroup).toHaveBeenCalled();
  });

  it('should call getFirewallRules on table event', () => {
    jest.spyOn(component, 'getFirewallRules');
    component.onTableEvent({} as any);
    expect(component.getFirewallRules).toHaveBeenCalled();
  });

  it('should getOneFirewallRuleGroup', () => {
    component.Id = 'test';
    jest
      .spyOn(component['firewallRuleGroupService'], 'getOneFirewallRuleGroup')
      .mockReturnValue(of({ name: 'test', type: 'test', id: 'test' }) as any);
    jest.spyOn(component, 'getObjects');
    jest.spyOn(component, 'getFirewallRuleLastIndex');
    component.getFirewallRuleGroup();
    expect(component['firewallRuleGroupService'].getOneFirewallRuleGroup).toHaveBeenCalled();
    expect(component.getObjects).toHaveBeenCalled();
  });

  describe('getFirewallRules', () => {
    it('should getManyFirewallRules with event', () => {
      component.FirewallRuleGroup = { id: 'test' } as any;
      component.TierId = 'tierId';
      jest.spyOn(component['firewallRuleService'], 'getManyFirewallRule').mockReturnValue(of({}) as any);
      component.getFirewallRules({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['firewallRuleService'].getManyFirewallRule).toHaveBeenCalled();
    });

    it('should getManyFirewallRules without event', () => {
      component.FirewallRuleGroup = { id: 'test' } as any;
      component.perPage = 10;
      jest.spyOn(component['firewallRuleService'], 'getManyFirewallRule').mockReturnValue(of({}) as any);
      component.getFirewallRules();
      expect(component['firewallRuleService'].getManyFirewallRule).toHaveBeenCalled();
    });

    it('should handle error when getManyFirewallRules fails', () => {
      component.FirewallRuleGroup = { id: 'test' } as any;
      jest.spyOn(component['firewallRuleService'], 'getManyFirewallRule').mockReturnValue(throwError('Error') as any);
      component.getFirewallRules();

      const errorSubscription = component['firewallRuleService']
        .getManyFirewallRule({
          filter: ['', ''],
          page: 1,
          perPage: 1,
          sort: ['ruleIndex,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.firewallRules).toEqual({});
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  it('should set latestRuleIndex when getFirewallRuleLastIndex', () => {
    component.FirewallRuleGroup = { id: 'test' } as any;
    jest.spyOn(component['firewallRuleService'], 'getManyFirewallRule').mockReturnValue(of({ data: [{ ruleIndex: 1 }] }) as any);
    component.getFirewallRuleLastIndex();
    expect(component.latestRuleIndex).toEqual(1);
    expect(component['firewallRuleService'].getManyFirewallRule).toHaveBeenCalled();
  });

  it('should get objects and set properties when getObjects is called', () => {
    const testTierId = 'testTierId';
    component.TierId = testTierId;

    const tierResponse = { name: 'Test Tier' };
    const networkObjectResponse = { data: ['networkObject1', 'networkObject2'] };
    const networkObjectGroupResponse = { data: ['networkObjectGroup1', 'networkObjectGroup2'] };
    const serviceObjectResponse = { data: ['serviceObject1', 'serviceObject2'] };
    const serviceObjectGroupResponse = { data: ['serviceObjectGroup1', 'serviceObjectGroup2'] };
    const zoneServiceResponse = { data: ['zone1', 'zone2'] };

    jest.spyOn(component['tierService'], 'getOneTier').mockReturnValue(of(tierResponse) as any);
    jest.spyOn(component['networkObjectService'], 'getManyNetworkObject').mockReturnValue(of(networkObjectResponse) as any);
    jest.spyOn(component['networkObjectGroupService'], 'getManyNetworkObjectGroup').mockReturnValue(of(networkObjectGroupResponse) as any);
    jest.spyOn(component['serviceObjectService'], 'getManyServiceObject').mockReturnValue(of(serviceObjectResponse) as any);
    jest.spyOn(component['serviceObjectGroupService'], 'getManyServiceObjectGroup').mockReturnValue(of(serviceObjectGroupResponse) as any);
    jest.spyOn(component['zoneService'], 'getManyZone').mockReturnValue(of(zoneServiceResponse) as any);

    jest.spyOn(component, 'getFirewallRules');

    component.getObjects();

    expect(component.TierName).toEqual(tierResponse.name);
    expect(component.networkObjects).toEqual(networkObjectResponse.data);
    expect(component.networkObjectGroups).toEqual(networkObjectGroupResponse.data);
    expect(component.serviceObjects).toEqual(serviceObjectResponse.data);
    expect(component.serviceObjectGroups).toEqual(serviceObjectGroupResponse.data);
    expect(component.zones).toEqual(zoneServiceResponse.data);

    expect(component.getFirewallRules).toHaveBeenCalled();
  });

  it('should get objects for TENANTV2 mode', () => {
    component.applicationMode = ApplicationMode.TENANTV2;
    component.TierId = 'testTierId';
    component.Id = 'testId';
    mockDatacenterService.currentDatacenterValue = { appCentricTenant: { id: 'testTenantId' } } as any;
    jest.spyOn(component, 'getFirewallRules').mockImplementation();
    component.getObjects();
    expect.assertions(0);
  });

  it('should openFirewallRuleModal when createFirewallRule', () => {
    jest.spyOn(component, 'openFirewallRuleModal');
    component.createFirewallRule();
    expect(component.openFirewallRuleModal).toHaveBeenCalled();
  });

  describe('openFirewallRuleModal', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getFirewallRuleGroup');
      jest.spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to firewallRuleModal onCloseFinished event and unsubscribe afterwards', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToFirewallRuleModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleModal');
      expect(component.firewallRuleModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component.getFirewallRuleGroup).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('firewallRuleModal');

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should open firewall rule modal with correct data in Create mode', () => {
      component.Id = 'testGroupId';
      component.TierId = 'testTierId';
      component.latestRuleIndex = 1;
      const modalMode = ModalMode.Create;
      jest.spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({ open: jest.fn(), onCloseFinished } as any);

      component.openFirewallRuleModal(modalMode);

      const expectedDto = {
        FirewallRuleGroupId: 'testGroupId',
        TierId: 'testTierId',
        ModalMode: modalMode,
        NetworkObjects: component.networkObjects,
        NetworkObjectGroups: component.networkObjectGroups,
        ServiceObjects: component.serviceObjects,
        ServiceObjectGroups: component.serviceObjectGroups,
        FirewallRule: { ruleIndex: component.latestRuleIndex + 1 },
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'firewallRuleModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleModal');
      expect(component['ngx'].getModal('firewallRuleModal').open).toHaveBeenCalled();
    });

    it('should open firewall rule modal with correct data in Edit mode', () => {
      component.Id = 'testGroupId';
      component.TierId = 'testTierId';
      const modalMode = ModalMode.Edit;
      const firewallRule = { id: 'testFirewallRuleId', ruleIndex: 2 } as any;
      jest.spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({ open: jest.fn(), onCloseFinished } as any);

      component.openFirewallRuleModal(modalMode, firewallRule);

      const expectedDto = {
        FirewallRuleGroupId: 'testGroupId',
        TierId: 'testTierId',
        ModalMode: modalMode,
        NetworkObjects: component.networkObjects,
        NetworkObjectGroups: component.networkObjectGroups,
        ServiceObjects: component.serviceObjects,
        ServiceObjectGroups: component.serviceObjectGroups,
        FirewallRule: firewallRule,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'firewallRuleModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleModal');
      expect(component['ngx'].getModal('firewallRuleModal').open).toHaveBeenCalled();
    });

    it('should throw an error if Edit mode is called without a firewall rule', () => {
      const modalMode = ModalMode.Edit;
      expect(() => component.openFirewallRuleModal(modalMode)).toThrowError('Firewall Rule Required');
    });
  });

  describe('deleteFirewallRule', () => {
    it('should call deleteOneFirewallRule with event params', () => {
      const firewallRule = { id: 'testId' } as any;
      component.FirewallRuleGroup = { id: 'test' } as any;
      jest.spyOn(component['firewallRuleService'], 'deleteOneFirewallRule').mockResolvedValue({} as never);
      jest.spyOn(component['firewallRuleService'], 'softDeleteOneFirewallRule').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');

      component.deleteFirewallRule(firewallRule);

      expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.tableComponentDto.searchText).toBe(params.searchText);
      expect(getFirewallRulesSpy).toHaveBeenCalledWith(component.tableComponentDto);
    });

    it('should call deleteOneFirewallRule without event params when filteredResults is false', () => {
      const firewallRule = { id: 'testId' } as any;
      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });
      const params = { searchString: '', filteredResults: false, searchColumn: '', searchText: '' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');

      component.deleteFirewallRule(firewallRule);

      expect(getFirewallRulesSpy).toHaveBeenCalled();
    });
  });

  describe('Restore Firewall Rule', () => {
    it('should restore firewall rule', () => {
      const firewallRule = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['firewallRuleService'], 'restoreOneFirewallRule').mockReturnValue(of({} as any));
      jest.spyOn(component, 'getFirewallRules');
      component.restoreFirewallRule(firewallRule);
      expect(component['firewallRuleService'].restoreOneFirewallRule).toHaveBeenCalledWith({ id: firewallRule.id });
      expect(component.getFirewallRules).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const firewallRule = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['firewallRuleService'], 'restoreOneFirewallRule').mockReturnValue(of({} as any));

      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');
      const params = {
        searchString: '',
        filteredResults: true,
        searchColumn: 'name',
        searchText: 'test',
      };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreFirewallRule(firewallRule);

      expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.tableComponentDto.searchText).toBe(params.searchText);
      expect(getFirewallRulesSpy).toHaveBeenCalledWith(component.tableComponentDto);
    });

    it('should apply search params when filtered results is false', () => {
      const firewallRule = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['firewallRuleService'], 'restoreOneFirewallRule').mockReturnValue(of({} as any));

      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');
      const params = {
        searchString: '',
        filteredResults: false,
        searchColumn: 'name',
        searchText: 'test',
      };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreFirewallRule(firewallRule);

      expect(getFirewallRulesSpy).toHaveBeenCalled();
    });

    it('should restore rule without search params when filteredResults is false', () => {
      const firewallRule = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['firewallRuleService'], 'restoreOneFirewallRule').mockReturnValue(of({} as any));
      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');
      const params = { searchString: '', filteredResults: false, searchColumn: '', searchText: '' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreFirewallRule(firewallRule);

      expect(getFirewallRulesSpy).toHaveBeenCalled();
    });
  });

  describe('importFWRulesConfig', () => {
    it('should import FW rules, sanitize data, map CSV values, and create a preview', () => {
      const fwRuleImports: FirewallRuleImport[] = [{ ruleIndex: '5' } as any];
      const sanitizedFWRuleImports: FirewallRuleImport[] = [{ ruleIndex: 5 } as any];
      const fwRulePreview: FirewallRulePreview = { firewallRulesToBeUploaded: [] } as any;
      const importResponse = of(new HttpResponse({ body: fwRulePreview }));

      jest.spyOn(component['firewallRuleService'], 'bulkImportFirewallRulesFirewallRule').mockReturnValue(importResponse as any);
      const createPreviewSpy = jest.spyOn(component, 'createPreview').mockImplementation();
      jest.spyOn(component, 'sanitizeData').mockReturnValue(sanitizedFWRuleImports);

      component.importFirewallRulesConfig(fwRuleImports);

      expect(component.sanitizeData).toHaveBeenCalledWith(fwRuleImports);
      expect(component['firewallRuleService'].bulkImportFirewallRulesFirewallRule).toHaveBeenCalledWith({
        firewallRuleImportCollectionDto: {
          dryRun: true,
          datacenterId: mockDatacenterService.currentDatacenterValue.id,
          firewallRules: sanitizedFWRuleImports,
        },
      });
      importResponse
        .pipe(
          map(response => {
            expect(createPreviewSpy).toHaveBeenCalledWith(response.body, fwRuleImports);
          }),
        )
        .subscribe();
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

    it('should call NetworkObjectGroupService when objectType is NetworkObjectGroup', () => {
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

      jest.spyOn(ngxSmartModalService, 'getModal').mockReturnValue({
        open: jest.fn(),
        onCloseFinished: of(null),
      } as any);

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

  describe('toggleDrawer', () => {
    it('should add a new entry and open the drawer if firewallRuleId does not exist', () => {
      const panosApp = { id: 'panos1' } as any;
      const firewallRule = { id: 'rule1' } as any;

      component.toggleDrawer(panosApp, firewallRule);

      const entry = component.firewallRuleIdToPanosApp.get(firewallRule.id);
      expect(entry).toEqual({ panosApplication: panosApp, open: true });
    });

    it('should toggle the open state if panosApplication matches existing entry', () => {
      const panosApp = { id: 'panos1' } as any;
      const firewallRule = { id: 'rule1' } as any;

      // Set initial state in map
      component.firewallRuleIdToPanosApp.set(firewallRule.id, { panosApplication: panosApp, open: true });

      // Call toggleDrawer
      component.toggleDrawer(panosApp, firewallRule);

      let entry = component.firewallRuleIdToPanosApp.get(firewallRule.id);
      expect(entry?.open).toBe(false);

      // Call again to toggle back
      component.toggleDrawer(panosApp, firewallRule);
      entry = component.firewallRuleIdToPanosApp.get(firewallRule.id);
      expect(entry?.open).toBe(true);
    });

    it('should update panosApplication and set open to true if panosApplication does not match existing entry', () => {
      const existingPanosApp = { id: 'panos1' } as any;
      const newPanosApp = { id: 'panos2' } as any;
      const firewallRule = { id: 'rule1' } as any;

      // Set initial state in map with a different panosApplication
      component.firewallRuleIdToPanosApp.set(firewallRule.id, { panosApplication: existingPanosApp, open: true });

      // Call toggleDrawer with a different panosApplication
      component.toggleDrawer(newPanosApp, firewallRule);

      const entry = component.firewallRuleIdToPanosApp.get(firewallRule.id);
      expect(entry).toEqual({ panosApplication: newPanosApp, open: true });
    });
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    component.currentDatacenterSubscription = new Subscription();
    const unsubscribeSpy = jest.spyOn(component.currentDatacenterSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
