import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfServiceModalComponent } from './self-service-modal.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('SelfServiceModalComponent', () => {
  let component: SelfServiceModalComponent;
  let fixture: ComponentFixture<SelfServiceModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelfServiceModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      imports: [ReactiveFormsModule, FormsModule, NgSelectModule, HttpClientModule, RouterTestingModule],
      providers: [
        {
          provide: NgxSmartModalService,
          useValue: {
            getModal: jest.fn().mockImplementation(() => ({
              open: jest.fn(),
              setData: jest.fn(),
            })),
          },
        },
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
      // TODO: this calling console.error
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
  });
});
