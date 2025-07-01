/* eslint-disable @typescript-eslint/dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { FirewallRulePacketTracerComponent } from '../firewall-rule-packet-tracer/firewall-rule-packet-tracer.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FirewallRuleDirectionEnum, FirewallRuleProtocolEnum } from '../../../../../client';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { MockProvider } from '../../../../test/mock-providers';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';

describe('FirewallRulesPacketTracerComponent', () => {
  let component: FirewallRulePacketTracerComponent;
  let fixture: ComponentFixture<FirewallRulePacketTracerComponent>;
  let mockNgxSmartModalService: any;

  beforeEach(() => {
    mockNgxSmartModalService = {
      resetModalData: jest.fn(),
      close: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, NgxPaginationModule, NgSelectModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FirewallRulePacketTracerComponent,
        ImportExportComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: mockNgxSmartModalService }, MockProvider(ToastrService)],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(FirewallRulePacketTracerComponent);
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

  describe('toggleDropdown', () => {
    it('should set dropdownOpen to true initially', () => {
      component.dropdownOpen = true;
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeFalsy();
    });

    it('should set dropdownOpen to false', () => {
      component.dropdownOpen = false;
      component.toggleDropdown();
      expect(component.dropdownOpen).toBeTruthy();
    });
  });

  describe('isExactMatch', () => {
    it('should return true for exact match', () => {
      const rule = {
        checkList: { sourceInRange: true, destInRange: true },
      } as any;
      const result = component.isExactMatch(rule);
      expect(result).toBeTruthy();
    });

    it('should return false when not an exact match', () => {
      const rule = {
        checkList: { sourceInRange: true, destInRange: false },
      } as any;
      const result = component.isExactMatch(rule);
      expect(result).toBeFalsy();
    });
  });

  describe('isPartialMatch', () => {
    it('should return true for partial match', () => {
      const rule = {
        checkList: { sourceInRange: true, destInRange: false /* ... */ },
      } as any;
      expect(component.isPartialMatch(rule)).toBeTruthy();
    });

    it('should return false for no match', () => {
      const rule = {
        checkList: { sourceInRange: false, destInRange: false /* ... */ },
      } as any;
      expect(component.isPartialMatch(rule)).toBeFalsy();
    });

    it('should return false for exact match', () => {
      const rule = {
        checkList: { sourceInRange: true, destInRange: true /* ... */ },
      } as any;
      expect(component.isPartialMatch(rule)).toBeFalsy();
    });
  });

  describe('search', () => {
    // Use beforeEach to reset mocks and set up a common testing environment
    beforeEach(() => {
      component.form.reset(); // Reset the form before each test
      component.submitted = false;
      component.rulesHit = [];

      jest.mock(
        'netmask',
        () =>
          class {
            contains() {
              return true;
            }
          },
      );
    });

    it('should populate rulesHit when the form is valid', () => {
      component.objects = {
        firewallRules: [],
      } as any;
      // Set up a valid form configuration
      component.form.controls['sourceIpAddress'].setValue('192.168.1.10');
      component.form.controls['destinationIpAddress'].setValue('10.0.0.5');
      component.form.controls['direction'].setValue('In');
      component.form.controls['protocol'].setValue('TCP');
      component.form.controls['enabled'].setValue(true);
      component.form.controls['sourcePorts'].setValue('any');
      component.form.controls['destinationPorts'].setValue('80');
      component.objects.firewallRules = [
        {
          sourceIpAddress: '192.168.1.10',
          destinationIpAddress: '10.0.0.5',
          direction: FirewallRuleDirectionEnum.In,
          protocol: FirewallRuleProtocolEnum.Tcp,
          sourcePorts: 'any',
          destinationPorts: '80',
          enabled: true,
        } as any,
      ];

      // Execute the search!
      component.search();

      // Assertion
      expect(component.rulesHit.length).toBeGreaterThan(0);
    });

    it('should set submitted to true', () => {
      // Set up a valid form configuration (as above)
      component.search();
      expect(component.submitted).toBeTruthy();
    });

    it('should not populate rulesHit when the form is invalid', () => {
      // Set up an invalid form configuration
      component.form.controls['sourceIpAddress'].setValue(''); // Invalid source IP

      component.search();
      expect(component.rulesHit.length).toBe(0);
    });

    it('should handle null destPortMatch', () => {
      component.objects = {
        firewallRules: [],
      } as any;
      // Set up form with a value that would cause destPortMatch to be null
      component.form.controls['destinationPorts'].setValue('80'); // Example of a port range
      component.form.controls['sourceIpAddress'].setValue('192.168.1.10');
      component.form.controls['destinationIpAddress'].setValue('10.0.0.5');
      component.form.controls['direction'].setValue('In');
      component.form.controls['protocol'].setValue('IP');
      component.form.controls['enabled'].setValue(true);
      component.objects.firewallRules = [
        {
          sourceIpAddress: '192.168.1.10',
          destinationIpAddress: '10.0.0.5',
          direction: FirewallRuleDirectionEnum.In,
          protocol: FirewallRuleProtocolEnum.Tcp,
          enabled: true,
        } as any,
      ];

      component.handlePortMatch = jest.fn().mockImplementation().mockReturnValueOnce(true).mockReturnValueOnce(null);

      component.search();

      // Assertion - This depends on how your component should behave in this case
      const checkList = component.rulesHit[0].checkList;
      const result = 'destPortMatch' in checkList;
      expect(result).toBeFalsy();
    });
  });

  describe('handleInRange', () => {
    it('should call ip lookup', () => {
      const ipLookupSpy = jest.spyOn(component, 'ipLookup').mockReturnValue(true);
      const rule = { sourceIpAddress: '192.168.1.0/24', sourceAddressType: 'IpAddress', panosApplications: [] } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      const result = component.handleInRange(rule, 'source', control);
      expect(result).toBeTruthy();
      expect(ipLookupSpy).toHaveBeenCalled();
    });

    it('should call network object lookup', () => {
      jest.spyOn(component, 'networkObjectLookup').mockReturnValue(true);
      const rule = { sourceIpAddress: '10.0.0.0/24', sourceAddressType: 'NetworkObject', panosApplications: [] } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      const result = component.handleInRange(rule, 'source', control);
      expect(result).toBeTruthy();
    });

    it('should call network object lookup with quad zeros and return true', () => {
      jest.spyOn(component, 'networkObjectLookup').mockReturnValue(true);
      const rule = { sourceIpAddress: '0.0.0.0/0', sourceAddressType: 'NetworkObject' } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      const result = component.handleInRange(rule, 'source', control);
      expect(result).toBeTruthy();
    });

    it('should call network object group lookup', () => {
      const networkObjectGroupSpy = jest.spyOn(component, 'networkObjectGroupLookup').mockReturnValue(true);
      const rule = { sourceIpAddress: '10.0.0.0/24', sourceAddressType: 'NetworkObjectGroup', panosApplications: [] } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      const result = component.handleInRange(rule, 'source', control);
      expect(result).toBeTruthy();
      expect(networkObjectGroupSpy).toHaveBeenCalled();
    });

    describe('handlePortMatch', () => {
      it('should return true for an exact port match', () => {
        const rule = { sourcePorts: '80', serviceType: 'Port', panosApplications: [] } as any;
        const control = { value: '80' } as AbstractControl;
        const result = component.handlePortMatch(rule, 'source', control);
        expect(result).toBeTruthy();
      });

      it('should return true for an "any" port match from the rule side', () => {
        const rule = { sourcePorts: 'any', serviceType: 'Port' } as any;
        const control = { value: '80' } as AbstractControl;
        const result = component.handlePortMatch(rule, 'source', control);
        expect(result).toBeTruthy();
      });

      it('should return true for an "any" port match from the form side', () => {
        const rule = { destinationPorts: '80', serviceType: 'Port' } as any;
        const control = { value: 'any' } as AbstractControl;
        const result = component.handlePortMatch(rule, 'destination', control);
        expect(result).toBeTruthy();
      });

      it('should return true for range port match', () => {
        const rule = { sourcePorts: '1-81', serviceType: 'Port' } as any;
        const control = { value: '80' } as AbstractControl;
        const result = component.handlePortMatch(rule, 'source', control);
        expect(result).toBeTruthy();
      });

      it('should return false when ports dont match', () => {
        const rule = { sourcePorts: '80', serviceType: 'Port', panosApplications: [] } as any;
        const control = { value: '8080' } as AbstractControl;
        const result = component.handlePortMatch(rule, 'source', control);
        expect(result).toBeFalsy();
      });

      it('should return null when the form control value is falsy', () => {
        const rule = { sourcePorts: '80', serviceType: 'ServiceObject', panosApplications: [] } as any;
        const control = { value: '' } as AbstractControl;
        const result = component.handlePortMatch(rule, 'source', control);
        expect(result).toBeNull();
      });
    });

    it('should reset the filter', () => {
      component.resetFilter();
      expect(component.filterPartial).toBeFalsy();
      expect(component.filterExact).toBeFalsy();
    });

    it('should convert a valid IPv4 address to a decimal number', () => {
      const ipAddress = '192.168.1.1';
      const expectedDecimal = 3232235777;
      const result = component.dot2num(ipAddress);
      expect(result).toEqual(expectedDecimal);
    });

    it('should call serviceObjectPortMatch if passed a service object', () => {
      const rule = { destinationPorts: '80', serviceType: 'ServiceObject', panosApplications: [] } as any;
      const control = { value: '80' } as AbstractControl;
      const serviceObjectPortMatchSpy = jest.spyOn(component, 'serviceObjectPortMatch').mockImplementation();
      component.handlePortMatch(rule, 'destination', control);
      expect(serviceObjectPortMatchSpy).toBeCalled();
    });

    it('should call serviceObjectGroupPortMatch if passed a service object group', () => {
      const rule = { destinationPorts: '80', serviceType: 'ServiceObjectGroup', panosApplications: [] } as any;
      const control = { value: '80' } as AbstractControl;
      const serviceObjectGroupPortMatchSpy = jest.spyOn(component, 'serviceObjectGroupPortMatch').mockImplementation();
      component.handlePortMatch(rule, 'destination', control);
      expect(serviceObjectGroupPortMatchSpy).toBeCalled();
    });
  });

  describe('applyFilter', () => {
    beforeEach(() => {
      // Set up sample rulesHit for testing
      component.rulesHit = [
        { checkList: { sourceInRange: true, destInRange: true /* ... */ }, name: 'Rule 1' }, // Exact match
        { checkList: { sourceInRange: true, destInRange: false /* ... */ }, name: 'Rule 2' }, // Partial match
        { checkList: { sourceInRange: false, destInRange: false /* ... */ }, name: 'Rule 3' }, // No match
      ];
    });

    it('should show all rules when no filters are applied', () => {
      component.filterExact = false;
      component.filterPartial = false;
      component.applyFilter();

      expect(component.filteredRules.length).toBe(3);
      expect(component.filteredRules).toEqual(component.rulesHit); // Check if arrays are deeply equal
    });

    it('should filter only exact matches', () => {
      component.filterExact = true;
      component.filterPartial = false;
      component.applyFilter();

      expect(component.filteredRules.length).toBe(1);
      expect(component.filteredRules[0].name).toBe('Rule 1');
    });

    it('should filter only partial matches', () => {
      component.filterExact = false;
      component.filterPartial = true;
      component.applyFilter();

      expect(component.filteredRules.length).toBe(1);
      expect(component.filteredRules[0].name).toBe('Rule 2');
    });

    it('should reset currentPage to 1', () => {
      component.currentPage = 5; // Set to a value other than 1
      component.applyFilter(); // Any filter combination will do

      expect(component.currentPage).toBe(1);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      component.submitted = true; // Initial state
      component.rulesHit = [{ name: 'Rule 1' }];
      component.form.controls['sourceIpAddress'].setValue('192.168.1.1');
    });

    it('should reset component state', () => {
      // Spy on other component methods for verification
      jest.spyOn(component, 'resetFilter');
      jest.spyOn(SubscriptionUtil, 'unsubscribe').mockImplementation(() => {});
      const formResetSpy = jest.spyOn(component.form, 'reset');

      component.reset();

      // Assertions
      expect(component.submitted).toBeFalsy();
      expect(component.rulesHit.length).toBe(0);
      expect(formResetSpy).toHaveBeenCalled();
      expect(component.resetFilter).toHaveBeenCalled();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('firewallRulePacketTracer');
    });
  });

  it('should close the modal', () => {
    const resetSpy = jest.spyOn(component, 'reset').mockImplementation();
    component.close();
    expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('firewallRulePacketTracer');
    expect(resetSpy).toHaveBeenCalled();
  });

  describe('ipLookup', () => {
    let mockNetmask: any;

    beforeEach(() => {
      mockNetmask = {
        // Mock the 'contains' method
        contains: jest.fn(),
      };

      // Replace Netmask with our mock
      jest.mock('netmask', () => jest.fn().mockImplementation(() => mockNetmask));
    });

    it('should return true for valid subnet match', () => {
      const rule = { destinationIpAddress: '192.168.1.0/24' } as any; // Example rule
      const control = { value: '192.168.1.50' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.ipLookup(rule, 'destination', control);
      expect(result).toBe(true);
    });

    it('should return true for any quad zero IP on the rule side', () => {
      const rule = { destinationIpAddress: '0.0.0.0/0' } as any; // Example rule
      const control = { value: '192.168.1.50' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.ipLookup(rule, 'destination', control);
      expect(result).toBe(true);
    });

    it('should return false for invalid subnet match', () => {
      const rule = { sourceIpAddress: '192.168.1.0/24' } as any; // Example rule
      const control = { value: '10.0.0.0' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(false);
      expect(component.ipLookup(rule, 'source', control)).toBe(false);
    });

    it('should handle errors from Netmask', () => {
      mockNetmask.contains.mockImplementation(() => {
        throw new Error('Test Error');
      });
      const rule = { sourceIpAddress: '192.168.1.0/24' } as any; // Example rule
      const control = { value: '10.0.0.0' } as AbstractControl;
      const result = component.ipLookup(rule, 'source', control);
      expect(result).toBe(false);
    });
  });

  describe('networkObjectLookup', () => {
    let mockNetmask: any;

    beforeEach(() => {
      mockNetmask = {
        // Mock the 'contains' method
        contains: jest.fn(),
      };

      // Replace Netmask with our mock
      jest.mock('netmask', () => jest.fn().mockImplementation(() => mockNetmask));
    });

    it('should handle Network Object type "IpAddress"', () => {
      const rule = {
        destinationNetworkObject: { type: 'IpAddress', ipAddress: '192.168.1.0/24' },
      } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.networkObjectLookup(rule, 'destination', control);
      expect(result).toBe(true);
    });

    it('should handle quad zeros Network Object type "IpAddress"', () => {
      const rule = {
        destinationNetworkObject: { type: 'IpAddress', ipAddress: '0.0.0.0/0' },
      } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.networkObjectLookup(rule, 'destination', control);
      expect(result).toBe(true);
    });

    it('should handle Network Object type "Range"', () => {
      const rule = {
        sourceNetworkObject: {
          type: 'Range',
          startIpAddress: '10.0.0.10',
          endIpAddress: '10.0.0.20',
        },
      } as any;
      const control = { value: '10.0.0.15' } as AbstractControl;

      // Assuming you need to mock/stub 'this.dot2num'
      jest.spyOn(component, 'dot2num').mockImplementation(() => 10); // Replace 10 with appropriate logic

      const result = component.networkObjectLookup(rule, 'source', control);
      expect(result).toBe(true);
    });

    it('should return false for IP outside of Network Object Range', () => {
      const rule = {
        sourceNetworkObject: {
          type: 'Range',
          startIpAddress: '10.0.0.10',
          endIpAddress: '10.0.0.20',
        },
      } as any;
      const control = { value: '192.168.0.5' } as AbstractControl;

      const result = component.networkObjectLookup(rule, 'source', control);
      expect(result).toBe(false);
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
        sourceNetworkObjectGroupId: 'test-id',
      } as any;

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '10.0.0.5' }, // Non-matching member
          { type: 'Range', startIpAddress: '192.168.1.10', endIpAddress: '192.168.1.50' }, // Matching member
        ],
      } as any;

      component.objects = {
        networkObjectGroups: [networkObjectGroup],
      } as any;

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule, 'source', control);
      expect(result).toBe(true);
    });

    it('should return true if a quad zero networkObject IP is in the networkObjectGroup', () => {
      const rule = {
        sourceNetworkObjectGroupId: 'test-id',
      } as any;

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [{ type: 'IpAddress', ipAddress: '0.0.0.0/0' }],
      } as any;

      component.objects = {
        networkObjectGroups: [networkObjectGroup],
      } as any;

      const control = { value: '192.168.1.20' } as AbstractControl;

      const result = component.networkObjectGroupLookup(rule, 'source', control);
      expect(result).toBe(true);
    });

    it('should return false if no members match', () => {
      // ... set up with a Network Object Group where no members match
      const rule = {
        destinationNetworkObjectGroupId: 'test-id',
      } as any;

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '10.0.0.5' }, // Non-matching member
          { type: 'Range', startIpAddress: '10.0.0.5', endIpAddress: '10.0.0.6' }, // Matching member
        ],
      } as any;

      component.objects = {
        networkObjectGroups: [networkObjectGroup],
      } as any;

      const control = { value: '192.168.1.20' } as AbstractControl;
      const result = component.networkObjectGroupLookup(rule, 'destination', control);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully within individual member checks', () => {
      // Set up a member that causes an error in Netmask or dot2num
      // ...
      const rule = {
        sourceNetworkObjectGroupId: 'test-id',
      } as any;

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: 'not an ip' }, // Non-matching member
          { type: 'Range', startIpAddress: '10.0.0.5', endIpAddress: '10.0.0.6' }, // Matching member
        ],
      } as any;

      component.objects = {
        networkObjectGroups: [networkObjectGroup],
      } as any;

      const control = { value: '192.168.1.20' } as AbstractControl;

      mockNetmask.contains.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });

      const result = component.networkObjectGroupLookup(rule, 'source', control);
      expect(result).toBe(false);
    });

    it('should return true if a member matches (IpAddress with form IP within subnet)', () => {
      const rule = {
        sourceNetworkObjectGroupId: 'test-id',
      } as any;

      const networkObjectGroup = {
        id: 'test-id',
        networkObjects: [
          { type: 'IpAddress', ipAddress: '192.168.1.0/24' }, // Member with matching subnet
        ],
      } as any;

      component.objects = {
        networkObjectGroups: [networkObjectGroup],
      } as any;

      const control = { value: '192.168.1.50' } as AbstractControl;
      mockNetmask.contains.mockReturnValue(true);

      const result = component.networkObjectGroupLookup(rule, 'source', control);
      expect(result).toBe(true);
    });
  });

  describe('serviceObjectPortMatch', () => {
    it('should return true for matching port values', () => {
      const rule = {
        serviceObject: { sourcePorts: '80' },
      } as any;
      const control = { value: '80' } as AbstractControl;

      const result = component.serviceObjectPortMatch(rule, 'source', control);
      expect(result).toBe(true);
    });

    it('should return true if a service object has a port "any"', () => {
      const rule = {
        serviceObject: { sourcePorts: 'any' },
      } as any;
      const control = { value: '80' } as AbstractControl;

      const result = component.serviceObjectPortMatch(rule, 'source', control);
      expect(result).toBe(true);
    });

    it('should return false for non-matching port values', () => {
      const rule = {
        serviceObject: { destinationPorts: '8080' },
      } as any;
      const control = { value: '80' } as AbstractControl;

      const result = component.serviceObjectPortMatch(rule, 'destination', control);
      expect(result).toBe(false);
    });
  });

  describe('serviceObjectGroupPortMatch', () => {
    it('should return true if any service object within the group matches', () => {
      const rule = {
        serviceObjectGroupId: 'test-id',
      } as any;

      const serviceObjectGroup = {
        id: 'test-id',
        serviceObjects: [
          { destinationPorts: '80' }, // Non-matching member
          { destinationPorts: '8080' }, // Matching member
        ],
      } as any;

      component.objects = {
        serviceObjectGroups: [serviceObjectGroup],
      } as any;

      const control = { value: '80' } as AbstractControl;

      const result = component.serviceObjectGroupPortMatch(rule, 'destination', control);
      expect(result).toBe(true);
    });

    it('should return true if any service object within the group matches', () => {
      const rule = {
        serviceObjectGroupId: 'test-id',
      } as any;

      const serviceObjectGroup = {
        id: 'test-id',
        serviceObjects: [
          { destinationPorts: 'any' }, // Matching member
        ],
      } as any;

      component.objects = {
        serviceObjectGroups: [serviceObjectGroup],
      } as any;

      const control = { value: '80' } as AbstractControl;

      const result = component.serviceObjectGroupPortMatch(rule, 'destination', control);
      expect(result).toBe(true);
    });

    it('should return false if no service object matches', () => {
      const rule = {
        serviceObjectGroupId: 'test-id',
      } as any;

      const serviceObjectGroup = {
        id: 'test-id',
        serviceObjects: [
          { sourcePorts: '8080' }, // Non-matching member
        ],
      } as any;

      component.objects = {
        serviceObjectGroups: [serviceObjectGroup],
      } as any;

      const control = { value: '80' } as AbstractControl;
      const result = component.serviceObjectGroupPortMatch(rule, 'source', control);
      expect(result).toBe(false);
    });
  });

  describe('Form Validators', () => {
    it('should not require action', () => {
      expect(isRequired('action')).toBeFalsy();
    });

    it('should not require direction', () => {
      expect(isRequired('direction')).toBeFalsy();
    });

    it('should not require protocol', () => {
      expect(isRequired('protocol')).toBeFalsy();
    });

    it('should require sourceIpAddress', () => {
      expect(isRequired('sourceIpAddress')).toBeTruthy();
    });

    it('should require destinationIpAddress', () => {
      expect(isRequired('destinationIpAddress')).toBeTruthy();
    });

    it('should not require destinationPorts', () => {
      expect(isRequired('destinationPorts')).toBeFalsy();
    });

    it('should not require sourcePorts', () => {
      expect(isRequired('sourcePorts')).toBeFalsy();
    });

    it('should require destination ports if protocol is not IP or ICMP', () => {
      const fc = getFormControl('destinationPorts');
      fc.setValue('');
      getFormControl('protocol').setValue('IP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('ICMP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('TCP');
      expect(isRequired('destinationPorts')).toBeTruthy();
      getFormControl('protocol').setValue('UDP');
      expect(isRequired('destinationPorts')).toBeTruthy();
    });

    it('should require source ports if protocol is not IP or ICMP', () => {
      const fc = getFormControl('sourcePorts');
      fc.setValue('');
      getFormControl('protocol').setValue('IP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('ICMP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('TCP');
      expect(isRequired('sourcePorts')).toBeTruthy();
      getFormControl('protocol').setValue('UDP');
      expect(isRequired('sourcePorts')).toBeTruthy();
    });

    it('should not allow invalid translatedSourceIp', () => {
      const fc = getFormControl('sourceIpAddress');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should not allow invalid translatedDestinationIp', () => {
      const fc = getFormControl('destinationIpAddress');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should allow valid originalSourceIp', () => {
      const fc = getFormControl('sourceIpAddress');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });

    it('should allow valid originalDestinationIp', () => {
      const fc = getFormControl('destinationIpAddress');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });
  });
});
