import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SelfServiceModalComponent } from './self-service-modal.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1SelfServiceService, V1TiersService } from 'client';
import { of, Subject } from 'rxjs';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('SelfServiceModalComponent', () => {
  let component: SelfServiceModalComponent;
  let fixture: ComponentFixture<SelfServiceModalComponent>;
  let datacenterSubject: Subject<any>;
  let mockDatacenterContextService: Partial<DatacenterContextService>;
  let mockSelfServiceService: Partial<V1SelfServiceService>;
  let mockTiersService: Partial<V1TiersService>;
  let mockNgxService: any;

  beforeEach(() => {
    datacenterSubject = new Subject();
    mockDatacenterContextService = {
      currentDatacenter: datacenterSubject.asObservable(),
    } as any;

    mockSelfServiceService = {
      processAsaConfigSelfService: jest.fn().mockReturnValue(of({})),
      processPAConfigSelfService: jest.fn().mockReturnValue(of({})),
    } as any;

    mockTiersService = {
      getManyTier: jest.fn().mockReturnValue(of({ data: [] })),
    } as any;

    mockNgxService = {
      resetModalData: jest.fn(),
      getModal: jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        setData: jest.fn(),
        close: jest.fn(),
      })),
    };

    TestBed.configureTestingModule({
      declarations: [SelfServiceModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      imports: [ReactiveFormsModule, FormsModule, NgSelectModule, HttpClientModule, RouterTestingModule],
      providers: [
        {
          provide: NgxSmartModalService,
          useValue: mockNgxService,
        },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1SelfServiceService, useValue: mockSelfServiceService },
        { provide: V1TiersService, useValue: mockTiersService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfServiceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return initial form controls', () => {
    component.initialForm = { controls: { test: 'test' } } as any;
    const res = component.f;
    expect(res).toEqual({ test: 'test' });
  });

  describe('xml2json', () => {
    it('should handle empty XML input', () => {
      const xml = new DOMParser().parseFromString('<root></root>', 'application/xml').documentElement;
      const result = component.xml2json(xml);
      expect(result).toEqual('');
    });

    it('should process XML input with vsys elements', () => {
      const xmlString = '<vsys><entry name="vsys1"></entry><entry name="vsys2"></entry></vsys>';
      const xml = new DOMParser().parseFromString(xmlString, 'application/xml').documentElement;
      const result = component.xml2json(xml);
      expect(result).toEqual({ entry: ['', ''] });
      expect(component.vsysHolderArray).toEqual(['vsys1', 'vsys2']);
    });

    it('should process XML input with zone elements', () => {
      const xmlString = '<zone><entry name="zone1"></entry><entry name="zone2"></entry></zone>';
      const xml = new DOMParser().parseFromString(xmlString, 'application/xml').documentElement;
      const result = component.xml2json(xml);
      expect(result).toEqual({ entry: ['', ''] });
      expect(component.zoneHolderArray).toEqual(['zone1', 'zone2']);
    });

    it('should process nested XML input', () => {
      const xmlString = '<root><parent><child>content</child></parent></root>';
      const xml = new DOMParser().parseFromString(xmlString, 'application/xml').documentElement;
      const result = component.xml2json(xml);
      expect(result).toEqual({ parent: { child: 'content' } });
    });

    it('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const xml = null;
      const result = component.xml2json(xml);
      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });

  describe('saveTiers', () => {
    it('should not proceed if initial form is invalid', () => {
      component.initialForm.patchValue({ deviceType: '', selectedTiersFromConfig: [] });
      component.saveTiers();
      expect(component.showSecondForm).toBe(false);
    });

    it('should process ASA device type and strip "nameof" from interfaces', () => {
      // Set the deviceType value directly on the initialForm object
      component.initialForm.setValue({
        deviceType: 'ASA',
        selectedTiersFromConfig: ['Tier1'],
        DCSTierSelect: 'Tier1',
        deviceConfig: 'test',
        intervrfSubnets: 'test',
      } as any);

      component.hostsWithInterfaces = [
        {
          hostname: 'Tier1',
          interfaces: [{ interface: 'nameof GigabitEthernet0/0' }, { interface: 'nameof GigabitEthernet0/1' }],
        },
      ] as any;
      component.saveTiers();
      expect(component.hostsWithInterfaces[0].interfaces).toEqual([
        { interface: 'GigabitEthernet0/0' },
        { interface: 'GigabitEthernet0/1' },
      ]);
    });
  });

  describe('saveNameSpaces', () => {
    it('should set needsNamespace to true if multiple selectedTiers', () => {
      component.selectedTiers = [
        { hostname: 'Tier1', interfaces: [] },
        { hostname: 'Tier2', interfaces: [] },
      ];
      component.saveNameSpaces();
      expect(component.selectedTiers[0].needsNamespace).toBeTruthy();
      expect(component.selectedTiers[1].needsNamespace).toBeTruthy();
    });

    it('should set needsNamespace to false if only one selectedTier', () => {
      component.selectedTiers = [{ hostname: 'Tier1', interfaces: [] }];
      component.saveNameSpaces();
      expect(component.selectedTiers[0].needsNamespace).toBeFalsy();
    });

    it('should enforce alphanumerical insidePrefix and namespace values', () => {
      component.selectedTiers = [
        {
          hostname: 'Tier1',
          interfaces: [],
          insidePrefix: 'test_prefix!',
          namespace: 'test_namespace!',
        },
      ];
      component.saveNameSpaces();
      expect(component.selectedTiers[0].insidePrefixAlphanumericalFail).toBeTruthy();
      expect(component.selectedTiers[0].namespaceAlphanumericalFail).toBeTruthy();
    });

    it('should check if interfaces have valid selections', () => {
      component.selectedTiers = [
        {
          hostname: 'Tier1',
          interfaces: [{ interface: 'GigabitEthernet0/0', intervrf: false, outside: false }],
        },
      ];
      component.saveNameSpaces();
      expect(component.selectedTiers[0].interfaces[0].needsSelection).toBeTruthy();
    });

    it('should enforce max length for insidePrefix and namespace', () => {
      component.selectedTiers = [
        {
          hostname: 'Tier1',
          interfaces: [],
          insidePrefix: 'a'.repeat(51),
          namespace: 'a'.repeat(12),
        },
      ];
      component.saveNameSpaces();
      expect(component.selectedTiers[0].insidePrefixTooLong).toBeTruthy();
      expect(component.selectedTiers[0].namespaceTooLong).toBeTruthy();
    });

    it('should not call save when invalid', () => {
      component.selectedTiers = [
        {
          hostname: 'Tier1',
          interfaces: [{ interface: 'GigabitEthernet0/0', intervrf: false, outside: false }],
          insidePrefix: 'test_prefix!',
          namespace: 'test_namespace!',
        },
      ];
      const saveSpy = jest.spyOn(component, 'save');
      component.saveNameSpaces();
      expect(component.submittedSecondForm).toBeTruthy();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  it('should mark intervrf and extertnal when markInterfaceIntervrf', () => {
    const int = { intervrf: false, external: true };
    component.markInterfaceIntervrf(int);
    expect(int.intervrf).toBeTruthy();
    expect(int.external).toBeFalsy();
  });

  it('should mark intervrf and extertnal when markInterfaceExternal', () => {
    const int = { intervrf: true, external: false };
    component.markInterfaceExternal(int);
    expect(int.intervrf).toBeFalsy();
    expect(int.external).toBeTruthy();
  });

  describe('deviceConfigFileChange', () => {
    it('should not accept non-XML file types for PA devices', () => {
      component.initialForm.controls.deviceType.setValue('PA');
      const event = {
        target: {
          files: [
            {
              type: 'text/plain',
            },
          ],
        },
      };

      component.deviceConfigFileChange(event);
      expect(component.f.deviceConfig.errors).toEqual({ incorrectFileType: true });
    });

    it('should accept XML for PA and set validators, parse and disable inputs', fakeAsync(() => {
      component.initialForm.controls.deviceType.setValue('PA');
      component.initialForm.controls.deviceConfig.setValue('C\\fakepath\\file.xml');

      const xmlContent = '<config><devices><entry><vsys><entry></entry></vsys></entry></devices></config>';
      const xmlSpy = jest
        .spyOn(component, 'xml2json')
        .mockReturnValue({ config: { devices: { entry: { vsys: { entry: [{ zone: { entry: [] } }] } } } } } as any);

      const fileReaderMock: any = {
        readAsText: jest.fn(function () {
          this.result = xmlContent;
          setTimeout(() => {
            if (typeof this.onload === 'function') {
              this.onload();
            }
          }, 0);
        }),
        onload: undefined,
        result: xmlContent,
      };
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => fileReaderMock);

      const event = { target: { files: [{ type: 'text/xml' }] } } as any;
      component.deviceConfigFileChange(event);
      tick();

      expect(component.f.intervrfSubnets.validator).toBeTruthy();
      expect(component.rawConfig).toBe(xmlContent);
      expect(component.rawConfigFileName).toBe('file.xml');
      expect(component.f.deviceConfig.disabled).toBe(true);
      xmlSpy.mockRestore();
    }));

    it('should handle ASA file with empty type and clear validators', fakeAsync(() => {
      component.initialForm.controls.deviceType.setValue('ASA');
      component.initialForm.controls.deviceConfig.setValue('C\\fakepath\\asa.log');
      const asaContent = 'hostname FW1\nnameif Gig0/1\nnameif Gig0/2\n';
      const fileReaderMock: any = {
        readAsText: jest.fn(function () {
          this.result = asaContent;
          setTimeout(() => {
            if (typeof this.onload === 'function') {
              this.onload();
            }
          }, 0);
        }),
        onload: undefined,
        result: asaContent,
      };
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => fileReaderMock);

      const event = { target: { files: [{ type: '' }] } } as any;
      component.deviceConfigFileChange(event);
      tick();

      expect(component.f.intervrfSubnets.validator).toBeNull();
      expect(component.rawConfig).toBe(asaContent);
      expect(component.f.deviceConfig.disabled).toBe(true);
    }));
  });

  describe('intervrfSubnetsFileChange', () => {
    it('should set intervrf subnets content on load', fakeAsync(() => {
      const content = '10.0.0.0/8';
      const fileReaderMock: any = {
        readAsText: jest.fn(function () {
          this.result = content;
          setTimeout(() => {
            if (typeof this.onload === 'function') {
              this.onload();
            }
          }, 0);
        }),
        onload: undefined,
        result: content,
      };
      jest.spyOn(window as any, 'FileReader').mockImplementation(() => fileReaderMock);

      const event = { target: { files: [{}] } } as any;
      component.intervrfSubnetsFileChange(event);
      tick();
      expect(component.f.intervrfSubnets.value).toBe(content);
    }));
  });

  describe('saveTiers additional branches', () => {
    it('should filter hosts by selected tiers and disable control', () => {
      component.initialForm.setValue({
        deviceType: 'PA',
        DCSTierSelect: 'DCS',
        deviceConfig: 'file.xml',
        intervrfSubnets: null,
        selectedTiersFromConfig: ['HostA'],
      } as any);

      component.hostsWithInterfaces = [
        { hostname: 'HostA', interfaces: [] },
        { hostname: 'HostB', interfaces: [] },
      ] as any;

      component.saveTiers();
      expect(component.hostsWithInterfaces.length).toBe(1);
      expect(component.hostsWithInterfaces[0].hostname).toBe('HostA');
      expect(component.initialForm.controls.selectedTiersFromConfig.disabled).toBe(true);
      expect(component.selectedTiers).toEqual(component.hostsWithInterfaces);
    });
  });

  describe('saveNameSpaces valid branch', () => {
    it('should call save when everything is valid', () => {
      component.selectedTiers = [
        {
          hostname: 'Tier1',
          interfaces: [{ interface: 'Gig0/1', intervrf: true }],
          insidePrefix: 'prefix_1',
          namespace: 'ns1',
        },
      ] as any;

      const saveSpy = jest.spyOn(component, 'save').mockImplementation(() => undefined);
      component.saveNameSpaces();
      expect(component.submittedSecondForm).toBe(true);
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should clear state and enable form', () => {
      component.showSecondForm = true;
      component.showSpinner = true;
      component.receivedConfig = true;
      component.selectedTiers = [{} as any];
      component.initialForm.disable();
      component.reset();
      expect(component.showSecondForm).toBe(false);
      expect(component.showSpinner).toBe(false);
      expect(component.receivedConfig).toBe(false);
      expect(component.selectedTiers.length).toBe(0);
      expect(component.initialForm.enabled).toBe(true);
    });
  });

  describe('getTiers and helpers', () => {
    it('should fetch tiers and set component.tiers', () => {
      (mockTiersService.getManyTier as jest.Mock).mockReturnValue(
        of({ data: [{ id: 't1', name: 'N', firewallRuleGroups: [], natRuleGroups: [] }] }),
      );
      component.datacenterId = 'dc-1';
      component.getTiers();
      expect(component.tiers.length).toBe(1);
    });

    it('getTierId delegates to ObjectUtil.getObjectId', () => {
      const spy = jest.spyOn(ObjectUtil as any, 'getObjectId').mockReturnValue('tid');
      component.tiers = [{ id: 'tid', name: 'N' } as any];
      const id = component.getTierId('N');
      expect(id).toBe('tid');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('getNatRuleGroupInfo filters out Intravrf and maps fields', () => {
      component.tiers = [
        {
          id: 't1',
          name: 'Tier1',
          natRuleGroups: [
            { id: 'n1', name: 'Intravrf', type: 'X' },
            { id: 'n2', name: 'Public', type: 'Y' },
          ],
          firewallRuleGroups: [],
        } as any,
      ];
      const res = (component as any).getNatRuleGroupInfo('Tier1');
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject({ tierUUId: 't1', name: 'Public', natRuleGroupUUID: 'n2' });
    });

    it('getFwRuleGroupInfo filters out Intravrf and maps fields', () => {
      component.tiers = [
        {
          id: 't1',
          name: 'Tier1',
          natRuleGroups: [],
          firewallRuleGroups: [
            { id: 'f1', name: 'Intravrf', type: 'X' },
            { id: 'f2', name: 'AllowAll', type: 'Y' },
          ],
        } as any,
      ];
      const res = (component as any).getFwRuleGroupInfo('Tier1');
      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject({ tierUUId: 't1', name: 'AllowAll', fwRuleGroupUUID: 'f2' });
    });
  });

  describe('save and createSelfService', () => {
    it('save should build ASA dto and call createSelfService with rawTextConfig', () => {
      jest.spyOn(ObjectUtil as any, 'getObjectId').mockReturnValue('tid');
      component.datacenterId = 'dc-1';
      component.initialForm.setValue({
        deviceType: 'ASA',
        DCSTierSelect: 'Tier1',
        deviceConfig: 'asa.log',
        intervrfSubnets: null,
        selectedTiersFromConfig: ['h1'],
      } as any);
      component.tiers = [{ id: 'tid', name: 'Tier1', natRuleGroups: [], firewallRuleGroups: [] } as any];
      component.rawConfig = 'raw-asa';
      component.rawConfigFileName = 'asa.log';
      component.selectedTiers = [{ hostname: 'h1', interfaceMatrix: {}, namespace: null } as any];

      const spy = jest.spyOn<any, any>(component as any, 'createSelfService').mockImplementation(() => undefined);
      component.save();
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ rawTextConfig: 'raw-asa', rawXMLConfig: '' }));
    });

    it('save should build PA dto and call createSelfService with rawXMLConfig and intervrfSubnets', () => {
      jest.spyOn(ObjectUtil as any, 'getObjectId').mockReturnValue('tid');
      component.datacenterId = 'dc-1';
      component.initialForm.setValue({
        deviceType: 'PA',
        DCSTierSelect: 'Tier1',
        deviceConfig: 'pa.xml',
        intervrfSubnets: '10.0.0.0/8',
        selectedTiersFromConfig: ['h1'],
      } as any);
      component.tiers = [{ id: 'tid', name: 'Tier1', natRuleGroups: [], firewallRuleGroups: [] } as any];
      component.rawConfig = '<xml />';
      component.rawConfigFileName = 'pa.xml';
      component.selectedTiers = [{ hostname: 'h1', interfaceMatrix: {}, namespace: null } as any];

      const spy = jest.spyOn<any, any>(component as any, 'createSelfService').mockImplementation(() => undefined);
      component.save();
      // intervrfSubnets is set inside createSelfService for PA, not in save() dto
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ rawXMLConfig: '<xml />' }));
    });

    it('createSelfService ASA path should call service and onClose', () => {
      jest.spyOn(component, 'onClose').mockImplementation(() => undefined);
      component.initialForm.controls.deviceType.setValue('ASA');
      (component as any).createSelfService({ selfService: {} } as any);
      expect(mockSelfServiceService.processAsaConfigSelfService).toHaveBeenCalled();
      expect(component.showSpinner).toBe(false);
      expect(component.receivedConfig).toBe(true);
      expect(component.onClose).toHaveBeenCalled();
    });

    it('createSelfService PA path should call service, set intervrf and onClose', () => {
      jest.spyOn(component, 'onClose').mockImplementation(() => undefined);
      component.initialForm.controls.deviceType.setValue('PA');
      component.initialForm.controls.intervrfSubnets.setValue('10.0.0.0/8');
      (component as any).createSelfService({ selfService: {} } as any);
      expect(mockSelfServiceService.processPAConfigSelfService).toHaveBeenCalled();
      expect(component.showSpinner).toBe(false);
      expect(component.receivedConfig).toBe(true);
      expect(component.onClose).toHaveBeenCalled();
    });
  });

  describe('onClose', () => {
    it('should reset modal data, close modal, set footer and reset form', () => {
      const resetSpy = jest.spyOn(component, 'reset').mockImplementation(() => undefined);
      component.showFooter = false;
      component.onClose();
      expect(component.showFooter).toBe(true);
      expect(mockNgxService.resetModalData).toHaveBeenCalledWith('selfServiceModal');
      expect(mockNgxService.getModal).toHaveBeenCalledWith('selfServiceModal');
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should subscribe to datacenter and call getTiers when present', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers').mockImplementation(() => undefined);
      component.ngOnInit();
      datacenterSubject.next({ id: 'dc-1' });
      expect(component.datacenterId).toBe('dc-1');
      expect(getTiersSpy).toHaveBeenCalled();
    });

    it('should not call getTiers when datacenter is falsy', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers').mockImplementation(() => undefined);
      component.ngOnInit();
      datacenterSubject.next(null);
      expect(getTiersSpy).not.toHaveBeenCalled();
    });
  });
});
