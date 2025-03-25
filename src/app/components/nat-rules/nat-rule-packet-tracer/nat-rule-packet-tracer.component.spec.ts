/* eslint-disable @typescript-eslint/dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import {
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  NatRuleOriginalSourceAddressTypeEnum,
  NatRuleOriginalDestinationAddressTypeEnum,
  NatRuleTranslatedSourceAddressTypeEnum,
  NatRuleTranslatedDestinationAddressTypeEnum,
} from 'client';
import { NatRulePacketTracerComponent } from './nat-rule-packet-tracer.component';
import { ToastrService } from 'ngx-toastr';

describe('NatRulesPacketTracerComponent', () => {
  let component: NatRulePacketTracerComponent;
  let fixture: ComponentFixture<NatRulePacketTracerComponent>;
  let mockNgxSmartModalService: any;

  beforeEach(() => {
    mockNgxSmartModalService = {
      open: jest.fn(),
      resetModalData: jest.fn(),
      close: jest.fn(),
    };
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
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(ToastrService),
      ],
    });

    fixture = TestBed.createComponent(NatRulePacketTracerComponent);
    component = fixture.componentInstance;
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
  });

  it('should toggle drop down', () => {
    component.toggleDropdown();
    expect(component.dropdownOpen).toBe(true);
  });

  describe('isExactMatch', () => {
    it('should return true if all values are true', () => {
      const rule = {
        checkList: {
          a: true,
          b: true,
          c: true,
        },
      };
      expect(component.isExactMatch(rule as any)).toBe(true);
    });

    it('should return false if any value is false', () => {
      const rule = {
        checkList: {
          a: true,
          b: false,
          c: true,
        },
      };
      expect(component.isExactMatch(rule as any)).toBe(false);
    });
  });

  describe('isPartialMatch', () => {
    it('should return true if any value is true and not all values are true', () => {
      const rule = {
        checkList: {
          a: true,
          b: false,
          c: true,
        },
      };
      expect(component.isPartialMatch(rule as any)).toBe(true);
    });

    it('should return false if all values are false', () => {
      const rule = {
        checkList: {
          a: false,
          b: false,
          c: false,
        },
      };
      expect(component.isPartialMatch(rule as any)).toBe(false);
    });

    it('should return false if all values are true', () => {
      const rule = {
        checkList: {
          a: true,
          b: true,
          c: true,
        },
      };
      expect(component.isPartialMatch(rule as any)).toBe(false);
    });
  });

  describe('applyFilter', () => {
    it('should return all rules if no filters are selected', () => {
      component.rulesHit = [{}, {}, {}];
      component.applyFilter();
      expect(component.filteredRules).toEqual(component.rulesHit);
    });

    it('should return all partial matches if partial filter is selected', () => {
      component.rulesHit = [
        {
          checkList: {
            a: true,
            b: true,
            c: true,
          },
        },
        {
          checkList: {
            a: false,
            b: false,
            c: true,
          },
        },
      ];
      component.filterPartial = true;
      component.applyFilter();
      expect(component.filteredRules).toEqual([component.rulesHit[1]]);
    });

    it('should return all exact matches if exact filter is selected', () => {
      component.rulesHit = [
        {
          checkList: {
            a: true,
            b: true,
            c: true,
          },
        },
        {
          checkList: {
            a: false,
            b: false,
            c: true,
          },
        },
      ];
      component.filterExact = true;
      component.applyFilter();
      expect(component.filteredRules).toEqual([component.rulesHit[0]]);
    });

    it('should return all exact and partial matches if both filters are selected', () => {
      component.rulesHit = [
        {
          checkList: {
            a: true,
            b: true,
            c: true,
          },
        },
        {
          checkList: {
            a: false,
            b: false,
            c: true,
          },
        },
      ];
      component.filterExact = true;
      component.filterPartial = true;
      component.applyFilter();
      expect(component.filteredRules).toEqual(component.rulesHit);
    });
  });

  it('should reset filters', () => {
    component.filterExact = true;
    component.filterPartial = true;
    component.resetFilter();
    expect(component.filterExact).toBe(false);
    expect(component.filterPartial).toBe(false);
  });

  describe('handleInRange', () => {
    it('should call network object lookup if original source address type is network object', () => {
      const rule = {
        originalSourceAddressType: NatRuleOriginalSourceAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule as any, 'originalSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalSource', control);
    });

    it('should call network object lookup if original destination address type is network object', () => {
      const rule = {
        originalDestinationAddressType: NatRuleOriginalDestinationAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule as any, 'originalDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalDestination', control);
    });

    it('should call network object lookup if translated source address type is network object', () => {
      const rule = {
        translatedSourceAddressType: NatRuleTranslatedSourceAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule as any, 'translatedSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedSource', control);
    });

    it('should call network object lookup if translated destination address type is network object', () => {
      const rule = {
        translatedDestinationAddressType: NatRuleTranslatedDestinationAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule as any, 'translatedDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedDestination', control);
    });

    it('should call network object group lookup if original source address type is network object group', () => {
      const rule = {
        originalSourceAddressType: NatRuleOriginalSourceAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule as any, 'originalSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalSource', control);
    });

    it('should call network object group lookup if original destination address type is network object group', () => {
      const rule = {
        originalDestinationAddressType: NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule as any, 'originalDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalDestination', control);
    });

    it('should call network object group lookup if translated source address type is network object group', () => {
      const rule = {
        translatedSourceAddressType: NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule as any, 'translatedSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedSource', control);
    });

    it('should call network object group lookup if translated destination address type is network object group', () => {
      const rule = {
        translatedDestinationAddressType: NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule as any, 'translatedDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedDestination', control);
    });
  });

  describe('networkObjectLookup', () => {
    let mockNetmask: any;
    beforeEach(() => {
      mockNetmask = {
        contains: jest.fn(),
      };
      jest.mock('netmask', () => jest.fn().mockImplementation(() => mockNetmask));
    });

    // Tests for the initial 'source' | 'destination' version
    describe('Initial source/destination', () => {
      it('should handle Network Object type "IpAddress"', () => {
        const rule = {
          originalDestinationNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
        };
        const control = { value: '192.168.1.100' } as AbstractControl;
        mockNetmask.contains.mockReturnValue(true);

        const result = component.networkObjectLookup(rule as any, 'originalDestination', control);
        expect(result).toBe(true);
      });

      it('should handle Network Object type "IpAddress" with quad zeros', () => {
        const rule = {
          originalDestinationNetworkObject: { type: 'IpAddress', ipAddress: '0.0.0.0/0' },
        };
        const control = { value: '192.168.1.100' } as AbstractControl;

        const result = component.networkObjectLookup(rule as any, 'originalDestination', control);
        expect(result).toBe(true);
      });

      it('should handle Network Object type "Range"', () => {
        const rule = {
          originalSourceNetworkObject: {
            type: 'Range',
            startIpAddress: '10.0.0.10',
            endIpAddress: '10.0.0.20',
          },
        };
        const control = { value: '10.0.0.15' } as AbstractControl;

        jest.spyOn(component, 'dot2num').mockImplementation(ip => {
          // Implement actual dot2num logic as needed for testing
          if (ip === '10.0.0.10') {
            return 10;
          }
          if (ip === '10.0.0.20') {
            return 20;
          }
          if (ip === '10.0.0.15') {
            return 15;
          }
          return 0;
        });

        const result = component.networkObjectLookup(rule as any, 'originalSource', control);
        expect(result).toBe(true);
      });

      it('should return false for IP outside of Network Object Range', () => {
        const rule = {
          originalSourceNetworkObject: {
            type: 'Range',
            startIpAddress: '10.0.0.10',
            endIpAddress: '10.0.0.20',
          },
        };
        const control = { value: '192.168.0.5' } as AbstractControl;

        const result = component.networkObjectLookup(rule as any, 'originalSource', control);
        expect(result).toBe(false);
      });
    });

    // Tests for the version with 'original/translated' variations
    describe('With original/translated locations', () => {
      it('should handle Network Object type "IpAddress" for originalSource', () => {
        const rule = {
          originalSourceNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
        };
        const control = { value: '192.168.1.100' } as AbstractControl;
        mockNetmask.contains.mockReturnValue(true);

        const result = component.networkObjectLookup(rule as any, 'originalSource', control);
        expect(result).toBe(true);
      });

      it('should handle Network Object type "Range" for originalDestination', () => {
        const rule = {
          originalDestinationNetworkObject: {
            type: 'Range',
            startIpAddress: '10.0.0.10',
            endIpAddress: '10.0.0.20',
          },
        };
        const control = { value: '10.0.0.15' } as AbstractControl;

        jest.spyOn(component, 'dot2num').mockImplementation(ip => {
          // Implement actual dot2num logic as needed for testing
          if (ip === '10.0.0.10') {
            return 10;
          }
          if (ip === '10.0.0.20') {
            return 20;
          }
          if (ip === '10.0.0.15') {
            return 15;
          }
          return 0; // Or handle invalid IPs appropriately
        });

        const result = component.networkObjectLookup(rule as any, 'originalDestination', control);
        expect(result).toBe(true);
      });

      it('should handle Network Object type "IpAddress" for translatedSource', () => {
        const rule = {
          translatedSourceNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
        };
        const control = { value: '192.168.1.100' } as AbstractControl;
        mockNetmask.contains.mockReturnValue(true);

        const result = component.networkObjectLookup(rule as any, 'translatedSource', control);
        expect(result).toBe(true);
      });

      it('should handle Network Object type "Range" for translatedDestination', () => {
        const rule = {
          translatedDestinationNetworkObject: {
            type: 'Range',
            startIpAddress: '10.0.0.10',
            endIpAddress: '10.0.0.20',
          },
        };
        const control = { value: '10.0.0.15' } as AbstractControl;

        jest.spyOn(component, 'dot2num').mockImplementation(ip => {
          // Implement actual dot2num logic as needed for testing
          if (ip === '10.0.0.10') {
            return 10;
          }
          if (ip === '10.0.0.20') {
            return 20;
          }
          if (ip === '10.0.0.15') {
            return 15;
          }
          return 0; // Or handle invalid IPs appropriately
        });

        const result = component.networkObjectLookup(rule as any, 'translatedDestination', control);
        expect(result).toBe(true);
      });

      it('should return false for IP outside of Network Object for translatedSource', () => {
        const rule = {
          translatedSourceNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
        };
        const control = { value: '10.0.0.5' } as AbstractControl; // IP outside of the range
        mockNetmask.contains.mockReturnValue(false);

        const result = component.networkObjectLookup(rule as any, 'translatedSource', control);
        expect(result).toBe(false);
      });
    });
  });

  describe('networkObjectGroupLookup', () => {
    let mockNetmask: any;

    beforeEach(() => {
      mockNetmask = {
        // Mock the 'contains' method
        contains: jest.fn(),
      };

      // Replace Netmask with our mock
      jest.mock('netmask', () => jest.fn().mockImplementation(() => mockNetmask));
    });

    it('should return true if any member matches', () => {
      const rule = {
        originalSourceNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '10.0.0.5' }, // Non-matching member
          { type: 'Range', startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.50' }, // Matching member
        ],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule as any, 'originalSource', control);
      expect(result).toBe(true);
    });

    it('should return true if any member matches', () => {
      const rule = {
        translatedSourceNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '10.0.0.5' }, // Non-matching member
          { type: 'Range', startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.50' }, // Matching member
        ],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule as any, 'translatedSource', control);
      expect(result).toBe(true);
    });

    it('should return true if a member has quad zeros', () => {
      const rule = {
        translatedSourceNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [{ type: 'IpAddress', ipAddress: '0.0.0.0/0' }],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule as any, 'translatedSource', control);
      expect(result).toBe(true);
    });

    it('should return false if no members match', () => {
      // ... set up with a Network Object Group where no members match
      const rule = {
        originalDestinationNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '10.0.0.5' }, // Non-matching member
          { type: 'Range', startIpAddress: '10.0.0.5', endIpAddress: '10.0.0.6' }, // non matching member
        ],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;
      const result = component.networkObjectGroupLookup(rule as any, 'originalDestination', control);
      expect(result).toBe(false);
    });

    it('should return false if no members match', () => {
      // ... set up with a Network Object Group where no members match
      const rule = {
        translatedDestinationNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '10.0.0.5' }, // Non-matching member
          { type: 'Range', startIpAddress: '10.0.0.5', endIpAddress: '10.0.0.6' }, // non matching member
        ],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;
      const result = component.networkObjectGroupLookup(rule as any, 'translatedDestination', control);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully within individual member checks', () => {
      // Set up a member that causes an error in Netmask or dot2num
      // ...
      const rule = {
        originalSourceNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: 'not an ip' }, // Non-matching member
          { type: 'Range', startIpAddress: '10.0.0.5', endIpAddress: '10.0.0.6' }, // Matching member
        ],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      mockNetmask.contains.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });

      const result = component.networkObjectGroupLookup(rule as any, 'originalSource', control);
      expect(result).toBe(false);
    });

    it('should return true if a member matches (IpAddress with form IP within subnet)', () => {
      const rule = {
        originalSourceNetworkObjectGroupId: 'test-id',
      };

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '192.168.1.0/24' }, // Member with matching subnet
        ],
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [networkObjectGroup as any],
      };

      const control = { value: '192.168.1.50' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.networkObjectGroupLookup(rule as any, 'originalSource', control);
      expect(result).toBe(true);
    });
  });

  describe('serviceObjectLookup', () => {
    it('should return false no service object is present but a form port value was passed', () => {
      const rule = {};

      const control = { value: '80' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'source', control);
      expect(result).toBe(false);
    });

    it('should return false if a service object is present but a form port value was not passed', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: '80',
          destinationPorts: 'any',
        },
      };

      const control = { value: '' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'source', control);
      expect(result).toBe(false);
    });

    it('should return true if no service object is present and no form port value was passed', () => {
      const rule = {};

      const control = { value: '' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'source', control);
      expect(result).toBe(true);
    });

    it('should return true if original service object source port matches', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: '80',
          destinationPorts: 'any',
        },
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [],
      };

      const control = { value: '80' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'source', control);
      expect(result).toBe(true);
    });

    it('should return true for an "any" port match from the rule side', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: 'any',
          destinationPorts: '5',
        },
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [],
      };

      const control = { value: '80' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'source', control);
      expect(result).toBe(true);
    });

    it('should return true for an "any" port match from the form side', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: '5',
          destinationPorts: '2',
        },
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [],
      };

      const control = { value: 'any' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'destination', control);
      expect(result).toBe(true);
    });

    it('should return true if original service object destination port is "any"', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: '5',
          destinationPorts: 'any',
        },
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [],
      };

      const control = { value: '80' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'destination', control);
      expect(result).toBe(true);
    });

    it('should return true if original service object source port range matches', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: '1-85',
          destinationPorts: 'any',
        },
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [],
      };

      const control = { value: '80' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'source', control);
      expect(result).toBe(true);
    });

    it('should return true if original service object destination port matches', () => {
      const rule = {
        originalServiceObject: {
          id: 'test-id',
          protocol: 'TCP',
          sourcePorts: 'any',
          destinationPorts: '80',
        },
      };

      component.objects = {
        natRules: [],
        networkObjectGroups: [],
      };

      const control = { value: '80' } as AbstractControl;
      const result = component.handleServiceObjectPortMatch(rule as any, 'original', 'destination', control);
      expect(result).toBe(true);
    });
  });

  it('should close the modal', () => {
    const resetSpy = jest.spyOn(component, 'reset').mockImplementation();
    component.close();
    expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('natRulePacketTracer');
    expect(resetSpy).toHaveBeenCalled();
  });

  describe('reset', () => {
    beforeEach(() => {
      component.submitted = true; // Initial state
      component.rulesHit = [{ name: 'Rule 1' }];
      component.form.controls['originalSourceIp'].setValue('192.168.1.1');
    });

    it('should reset component state', () => {
      // Spy on other component methods for verification
      jest.spyOn(component, 'resetFilter');
      const formResetSpy = jest.spyOn(component.form, 'reset');

      component.reset();

      // Assertions
      expect(component.submitted).toBeFalsy();
      expect(component.rulesHit.length).toBe(0);
      expect(formResetSpy).toHaveBeenCalled();
      expect(component.resetFilter).toHaveBeenCalled();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('natRulePacketTracer');
    });
  });

  it('should return the form controls', () => {
    component.form = new FormGroup({
      name: new FormControl(''),
    });
    const controls = component.f;

    expect(controls.name).toBeInstanceOf(FormControl);
  });

  describe('search', () => {
    beforeEach(() => {
      jest.mock(
        'netmask',
        () =>
          class {
            contains() {
              return true;
            }
          },
      );

      component.form.reset();
      component.submitted = false;
      component.rulesHit = [];
    });

    it('should populate rulesHit when the form is valid', () => {
      const natRules = [
        {
          name: 'Test NAT Rule',
          originalSource: '192.168.1.10',
          originalDestination: '10.0.0.5',
          translatedSource: '172.16.1.10',
          translatedDestination: '10.1.0.5',
        } as any,
      ];

      component.objects = { natRules, networkObjectGroups: [] };

      // Set up a valid form configuration
      component.form.controls['originalSourceIp'].setValue('192.168.1.10');
      component.form.controls['originalDestinationIp'].setValue('10.0.0.5');
      component.form.controls['translatedSourceIp'].setValue('172.16.1.10');
      component.form.controls['translatedDestinationIp'].setValue('10.1.0.5');

      // Execute the search
      component.search();

      // Assertions
      expect(component.rulesHit.length).toBeGreaterThan(0);
    });

    it('should set submitted to true', () => {
      // Execute the search
      component.search();

      // Verify `submitted` is true
      expect(component.submitted).toBeTruthy();
    });

    it('should not populate rulesHit when the form is invalid', () => {
      // Set up an invalid form configuration by not setting any values
      component.form.controls['originalSourceIp'].setValue('');
      component.form.controls['originalDestinationIp'].setValue('');
      component.form.controls['translatedSourceIp'].setValue('');
      component.form.controls['translatedDestinationIp'].setValue('');

      // Execute the search
      component.search();

      // Assertions
      expect(component.rulesHit.length).toBe(0);
    });
  });

  it('should getNetworkObjectGroup on matching id', () => {
    const networkObjectGroup = { id: 'testId' };
    component.objects = { networkObjectGroups: [networkObjectGroup as any], natRules: [] };
    component.getNetworkObjectGroup('testId');

    expect(component.getNetworkObjectGroup('testId')).toEqual(networkObjectGroup);
  });

  describe('Form Validators', () => {
    it('should not require direction', () => {
      expect(isRequired('direction')).toBeFalsy();
    });

    it('should not require biDirectional', () => {
      expect(isRequired('biDirectional')).toBeFalsy();
    });

    it('shoudl not require enabled', () => {
      expect(isRequired('enabled')).toBeFalsy();
    });

    it('should require originalSourceIp', () => {
      expect(isRequired('originalSourceIp')).toBeTruthy();
    });

    it('should require originalDestinationIp', () => {
      expect(isRequired('originalDestinationIp')).toBeTruthy();
    });

    it('should not require originalSourcePort', () => {
      expect(isRequired('originalSourcePort')).toBeFalsy();
    });

    it('should not require originalDestinationPort', () => {
      expect(isRequired('originalDestinationPort')).toBeFalsy();
    });

    it('should not require translatedSourceIp', () => {
      expect(isRequired('translatedSourceIp')).toBeFalsy();
    });

    it('should not require translatedDestinationIp', () => {
      expect(isRequired('translatedDestinationIp')).toBeFalsy();
    });

    it('should not require translatedSourcePort', () => {
      expect(isRequired('translatedSourcePort')).toBeFalsy();
    });

    it('should not require translatedDestinationPort', () => {
      expect(isRequired('translatedDestinationPort')).toBeFalsy();
    });

    it('should not allow invalid originalSourceIp', () => {
      const fc = getFormControl('originalSourceIp');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should not allow invalid originalDestinationIp', () => {
      const fc = getFormControl('originalDestinationIp');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should not allow invalid translatedSourceIp', () => {
      const fc = getFormControl('translatedSourceIp');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should not allow invalid translatedDestinationIp', () => {
      const fc = getFormControl('translatedDestinationIp');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should allow valid originalSourceIp', () => {
      const fc = getFormControl('originalSourceIp');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });

    it('should allow valid originalDestinationIp', () => {
      const fc = getFormControl('originalDestinationIp');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });

    it('should allow valid translatedSourceIp', () => {
      const fc = getFormControl('translatedSourceIp');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });

    it('should allow valid translatedDestinationIp', () => {
      const fc = getFormControl('translatedDestinationIp');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });
  });
});
