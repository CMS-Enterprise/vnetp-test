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
      ],
    });

    fixture = TestBed.createComponent(NatRulePacketTracerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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
      expect(component.isExactMatch(rule)).toBe(true);
    });

    it('should return false if any value is false', () => {
      const rule = {
        checkList: {
          a: true,
          b: false,
          c: true,
        },
      };
      expect(component.isExactMatch(rule)).toBe(false);
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
      expect(component.isPartialMatch(rule)).toBe(true);
    });

    it('should return false if all values are false', () => {
      const rule = {
        checkList: {
          a: false,
          b: false,
          c: false,
        },
      };
      expect(component.isPartialMatch(rule)).toBe(false);
    });

    it('should return false if all values are true', () => {
      const rule = {
        checkList: {
          a: true,
          b: true,
          c: true,
        },
      };
      expect(component.isPartialMatch(rule)).toBe(false);
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

  describe('paginatedRules', () => {
    beforeEach(() => {
      component.currentPage = 1;
      component.pageSize = 5;
      component.filteredRules = [
        { name: 'Rule 1' },
        { name: 'Rule 2' },
        { name: 'Rule 3' },
        { name: 'Rule 4' },
        { name: 'Rule 5' },
        { name: 'Rule 6' },
        { name: 'Rule 7' }, //  ... enough elements for multiple pages
      ];
    });

    it('should return correct elements for page 1', () => {
      const result = component.paginatedRules;
      expect(result.length).toBe(5); // Page size is 5
      expect(result).toEqual([{ name: 'Rule 1' }, { name: 'Rule 2' }, { name: 'Rule 3' }, { name: 'Rule 4' }, { name: 'Rule 5' }]);
    });

    it('should return the correct elements for page 2', () => {
      component.currentPage = 2;
      const result = component.paginatedRules;
      expect(result.length).toBe(2); // Only 2 elements on last page
      expect(result).toEqual([{ name: 'Rule 6' }, { name: 'Rule 7' }]);
    });
  });

  describe('handleInRange', () => {
    it('should call network object lookup if original source address type is network object', () => {
      const rule = {
        originalSourceAddressType: NatRuleOriginalSourceAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule, 'originalSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalSource', control);
    });

    it('should call network object lookup if original destination address type is network object', () => {
      const rule = {
        originalDestinationAddressType: NatRuleOriginalDestinationAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule, 'originalDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalDestination', control);
    });

    it('should call network object lookup if translated source address type is network object', () => {
      const rule = {
        translatedSourceAddressType: NatRuleTranslatedSourceAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule, 'translatedSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedSource', control);
    });

    it('should call network object lookup if translated destination address type is network object', () => {
      const rule = {
        translatedDestinationAddressType: NatRuleTranslatedDestinationAddressTypeEnum.NetworkObject,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectLookup').mockImplementation();
      component.handleInRange(rule, 'translatedDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedDestination', control);
    });

    it('should call network object group lookup if original source address type is network object group', () => {
      const rule = {
        originalSourceAddressType: NatRuleOriginalSourceAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule, 'originalSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalSource', control);
    });

    it('should call network object group lookup if original destination address type is network object group', () => {
      const rule = {
        originalDestinationAddressType: NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule, 'originalDestination', control);

      expect(spy).toHaveBeenCalledWith(rule, 'originalDestination', control);
    });

    it('should call network object group lookup if translated source address type is network object group', () => {
      const rule = {
        translatedSourceAddressType: NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule, 'translatedSource', control);

      expect(spy).toHaveBeenCalledWith(rule, 'translatedSource', control);
    });

    it('should call network object group lookup if translated destination address type is network object group', () => {
      const rule = {
        translatedDestinationAddressType: NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup,
      };
      const control = { value: 'test' } as any;
      const spy = jest.spyOn(component, 'networkObjectGroupLookup').mockImplementation();
      component.handleInRange(rule, 'translatedDestination', control);

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

        const result = component.networkObjectLookup(rule, 'originalDestination', control);
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

        const result = component.networkObjectLookup(rule, 'originalSource', control);
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

        const result = component.networkObjectLookup(rule, 'originalSource', control);
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

        const result = component.networkObjectLookup(rule, 'originalSource', control);
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

        const result = component.networkObjectLookup(rule, 'originalDestination', control);
        expect(result).toBe(true);
      });

      it('should handle Network Object type "IpAddress" for translatedSource', () => {
        const rule = {
          translatedSourceNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
        };
        const control = { value: '192.168.1.100' } as AbstractControl;
        mockNetmask.contains.mockReturnValue(true);

        const result = component.networkObjectLookup(rule, 'translatedSource', control);
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

        const result = component.networkObjectLookup(rule, 'translatedDestination', control);
        expect(result).toBe(true);
      });

      it('should return false for IP outside of Network Object for translatedSource', () => {
        const rule = {
          translatedSourceNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
        };
        const control = { value: '10.0.0.5' } as AbstractControl; // IP outside of the range
        mockNetmask.contains.mockReturnValue(false);

        const result = component.networkObjectLookup(rule, 'translatedSource', control);
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
        networkObjectGroups: [networkObjectGroup],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule, 'originalSource', control);
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
        networkObjectGroups: [networkObjectGroup],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule, 'translatedSource', control);
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
        networkObjectGroups: [networkObjectGroup],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;
      const result = component.networkObjectGroupLookup(rule, 'originalDestination', control);
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
        networkObjectGroups: [networkObjectGroup],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;
      const result = component.networkObjectGroupLookup(rule, 'translatedDestination', control);
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
        networkObjectGroups: [networkObjectGroup],
      };

      const control = { value: '192.168.1.20' } as AbstractControl;

      mockNetmask.contains.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });

      const result = component.networkObjectGroupLookup(rule, 'originalSource', control);
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
        networkObjectGroups: [networkObjectGroup],
      };

      const control = { value: '192.168.1.50' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.networkObjectGroupLookup(rule, 'originalSource', control);
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
        },
      ];

      component.objects = { natRules };

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
    component.objects = { networkObjectGroups: [networkObjectGroup] };
    component.getNetworkObjectGroup('testId');

    expect(component.getNetworkObjectGroup('testId')).toEqual(networkObjectGroup);
  });
});
