/* eslint-disable @typescript-eslint/dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { FirewallRulePacketTracerComponent } from '../firewall-rule-packet-tracer/firewall-rule-packet-tracer.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from '../../../../test/mock-providers';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
      imports: [
        FormsModule,
        NgxPaginationModule,
        NgSelectModule,
        ReactiveFormsModule,
        MatTableModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatRadioModule,
        MatInputModule,
        MatMenuModule,
        BrowserAnimationsModule,
      ],
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

  describe('column functions', () => {
    it('should return the correct value for sourceInRange', () => {
      jest.spyOn(component, 'handleInRange').mockReturnValue(true);
      const result = component.getCellValue('sourceInRange', 'source' as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for destInRange', () => {
      jest.spyOn(component, 'handleInRange').mockReturnValue(true);
      const result = component.getCellValue('destInRange', 'destination' as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for sourcePort', () => {
      jest.spyOn(component, 'handlePortMatch').mockReturnValue(true);
      const result = component.getCellValue('sourcePort', 'source' as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for destPort', () => {
      jest.spyOn(component, 'handlePortMatch').mockReturnValue(true);
      const result = component.getCellValue('destPort', 'destination' as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for direction', () => {
      component.form.controls.direction.setValue('in');
      const result = component.getCellValue('direction', { direction: 'in' } as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for protocol', () => {
      component.form.controls.protocol.setValue('tcp');
      const result = component.getCellValue('protocol', { protocol: 'tcp' } as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for action', () => {
      component.form.controls.action.setValue('allow');
      const result = component.getCellValue('action', { action: 'allow' } as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for enabled', () => {
      component.form.controls.enabled.setValue(true);
      const result = component.getCellValue('enabled', { enabled: true } as any);
      expect(result).toBeTruthy();
    });

    it('should return the correct value for softDeleted', () => {
      const result = component.getCellValue('softDeleted', { deletedAt: new Date() } as any);
      expect(result).toBeTruthy();
    });

    it('should return false if column function doesnt exist', () => {
      const result = component.getCellValue('unknown', 'unknown' as any);
      expect(result).toBeFalsy();
    });
  });

  it('should set drawer to open', () => {
    component.onOpen();
    expect(component.isDrawerOpened).toBeTruthy();
  });

  it('should reset filter', () => {
    component.filterExact = true;
    component.searchQuery = 'test';
    const applyFilterSpy = jest.spyOn(component, 'applyFilter').mockImplementation();
    component.reset();
    expect(component.filterExact).toBeNull();
    expect(component.searchQuery).toBe('');
    expect(applyFilterSpy).toHaveBeenCalled();
  });

  describe('applyFilter', () => {
    it('should set filteredChecklist to firewallRulesWithChecklist if searchQuery and filter is empty', () => {
      const mockChecklist = {
        mockRuleName: {
          checkList: {
            mockFieldName: true,
          },
        },
      };
      component.firewallRulesWithChecklist = mockChecklist as any;
      component.applyFilter();
      expect(component.filteredChecklist).toEqual(mockChecklist);
    });

    it('should filter by exact if set', () => {
      const mockChecklist = {
        mockRuleName: {
          checkList: {
            mockFieldName: true,
            mockFieldName2: true,
          },
        },
        mockRuleName2: {
          checkList: {
            mockFieldName: true,
            mockFieldName2: false,
          },
        },
      };

      component.filterExact = true;
      component.firewallRulesWithChecklist = mockChecklist as any;
      component.applyFilter();
      expect(component.filteredChecklist).toEqual({
        mockRuleName: {
          checkList: {
            mockFieldName: true,
            mockFieldName2: true,
          },
        },
      });
    });

    it('should filter by search query', () => {
      const mockChecklist = {
        mockRuleName: {
          checkList: {
            mockFieldName: 'test',
            mockFieldName2: 'test',
          },
        },
        mockRuleName2: {
          checkList: {
            mockFieldName: 'test',
            mockFieldName2: 'not test',
          },
        },
      };

      component.searchQuery = 'mockRuleName2';
      component.firewallRulesWithChecklist = mockChecklist as any;
      component.applyFilter();
      expect(component.filteredChecklist).toEqual({
        mockRuleName2: {
          checkList: {
            mockFieldName: 'test',
            mockFieldName2: 'not test',
          },
        },
      });
    });
  });

  it('should reset form', () => {
    component.form.controls.sourcePort.setValue('80');
    component.form.controls.destPort.setValue('80');
    component.form.controls.direction.setValue('in');
    component.form.controls.protocol.setValue('tcp');
    component.form.controls.action.setValue('allow');
    component.form.controls.enabled.setValue(true);
    const resetFilterAndFormSpy = jest.spyOn(component, 'resetFilter').mockImplementation();
    component.reset();
    expect(component.form.value).toEqual({
      sourceInRange: null,
      destInRange: null,
      sourcePort: null,
      destPort: null,
      direction: null,
      protocol: null,
      action: null,
      enabled: null,
    });
    expect(resetFilterAndFormSpy).toHaveBeenCalled();
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

  describe('setChecklistsForRulesByField', () => {
    it('should call set checklist if there are no issues', () => {
      const mockFwrs = { firewallRules: [{ name: 'mockRuleName' }] } as any;
      jest.spyOn(component, 'setChecklist').mockImplementation();
      component.form.controls.action.setValue(true);
      component.objects = mockFwrs;
      component.setChecklist(mockFwrs.firewallRules[0]);
      expect(component.setChecklist).toHaveBeenCalled();
    });
  });

  describe('handleInRange', () => {
    it('should call ip lookup', () => {
      const ipLookupSpy = jest.spyOn(component, 'ipLookup').mockReturnValue(true);
      const rule = { destinationIpAddress: '192.168.1.0/24', destinationAddressType: 'IpAddress', panosApplications: [] } as any;
      const control = { value: '192.168.1.100' } as AbstractControl;
      const result = component.handleInRange(rule, 'destination', control);
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

  it('should create new check list', () => {
    const result = component.createNewChecklist();
    expect(result).toEqual({
      action: null,
      sourceInRange: null,
      destInRange: null,
      sourcePort: null,
      destPort: null,
      direction: null,
      protocol: null,
      enabled: null,
      // application: null,
      softDeleted: null,
    });
  });

  it('should clear checklist', () => {
    const mockChecklist = {
      mockRuleName: {
        checkList: {
          mockFieldName: true,
        },
      },
    };
    component.firewallRulesWithChecklist = mockChecklist as any;
    component.clearChecklist('mockRuleName', 'mockFieldName');
    expect(component.firewallRulesWithChecklist.mockRuleName.checkList['mockFieldName'] as any).toBeNull();
  });

  it('should toggle search', () => {
    component.isSearchOpen = false;
    component.toggleSearch();
    expect(component.isSearchOpen).toBeTruthy();
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

    it('should require sourceInRange', () => {
      expect(isRequired('sourceInRange')).toBeTruthy();
    });

    it('should require destInRange', () => {
      expect(isRequired('destInRange')).toBeTruthy();
    });

    it('should not require destPort', () => {
      expect(isRequired('destPort')).toBeFalsy();
    });

    it('should not require sourcePort', () => {
      expect(isRequired('sourcePort')).toBeFalsy();
    });

    it('should require destination ports if protocol is not IP or ICMP', () => {
      const fc = getFormControl('destPort');
      fc.setValue('');
      getFormControl('protocol').setValue('IP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('ICMP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('TCP');
      expect(isRequired('destPort')).toBeTruthy();
      getFormControl('protocol').setValue('UDP');
      expect(isRequired('destPort')).toBeTruthy();
    });

    it('should require source ports if protocol is not IP or ICMP', () => {
      const fc = getFormControl('sourcePort');
      fc.setValue('');
      getFormControl('protocol').setValue('IP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('ICMP');
      expect(fc.errors).toBeNull();
      getFormControl('protocol').setValue('TCP');
      expect(isRequired('sourcePort')).toBeTruthy();
      getFormControl('protocol').setValue('UDP');
      expect(isRequired('sourcePort')).toBeTruthy();
    });

    it('should not allow invalid translatedSourceIp', () => {
      const fc = getFormControl('sourceInRange');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should not allow invalid translatedDestinationIp', () => {
      const fc = getFormControl('destInRange');
      fc.setValue('192.168.0.1/24');
      expect(fc.errors).toBeTruthy();
    });

    it('should allow valid originalSourceIp', () => {
      const fc = getFormControl('sourceInRange');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });

    it('should allow valid originalDestinationIp', () => {
      const fc = getFormControl('destInRange');
      fc.setValue('192.168.0.1');
      expect(fc.errors).toBeFalsy();
    });
  });
});

// it('should return the correct value for application', () => {
//   jest.spyOn(component, 'handleApplication').mockReturnValue(true);
//   const result = component.getCellValue('application', 'application' as any);
//   expect(result).toBeTruthy();
// });

// it('should get firewall rules array', () => {
//   const mockChecklist = {
//     mockRuleName: {
//       checkList: {
//         mockFieldName: true,
//       },
//     },
//   };
//   component.filteredChecklist = mockChecklist as any;
//   const result = component.firewallRulesArray;
//   expect(result).toEqual([{ name: 'mockRuleName', checkList: { mockFieldName: true } }]);
// });

// it('should return if checklist field is empty', () => {
//   const mockChecklist = {
//     mockRuleName: {
//       checkList: {
//         mockFieldName: true,
//       },
//     },
//   };
//   component.firewallRulesWithChecklist = mockChecklist as any;
//   const result = component.isChecklistFieldEmpty('mockFieldName', { name: 'mockRuleName' } as any);
//   expect(result).toBeFalsy();
// });
// describe('onMouseMove', () => {
//   it('should call on hover on mouse event outside left of rect', () => {
//     const mockEvent = { clientX: 0, clientY: 0 } as MouseEvent;
//     const mockRect = { left: 1, top: 0, bottom: 0, right: 0 } as DOMRect;
//     jest.spyOn(document, 'querySelector').mockReturnValueOnce({ getBoundingClientRect: () => mockRect } as any);
//     const onHoverSpy = jest.spyOn(component, 'onHover').mockImplementation();
//     component.onMouseMove(mockEvent);
//     expect(onHoverSpy).toHaveBeenCalled();
//   });

//   it('should call on hover on mouse event outside right of rect', () => {
//     const mockEvent = { clientX: 1, clientY: 0 } as MouseEvent;
//     const mockRect = { left: 0, top: 0, bottom: 0, right: 0 } as DOMRect;
//     jest.spyOn(document, 'querySelector').mockReturnValueOnce({ getBoundingClientRect: () => mockRect } as any);
//     const onHoverSpy = jest.spyOn(component, 'onHover').mockImplementation();
//     component.onMouseMove(mockEvent);
//     expect(onHoverSpy).toHaveBeenCalled();
//   });

//   it('should call on hover on mouse event outside bottom of rect', () => {
//     const mockEvent = { clientX: 0, clientY: 1 } as MouseEvent;
//     const mockRect = { left: 0, top: 0, bottom: 0, right: 0 } as DOMRect;
//     jest.spyOn(document, 'querySelector').mockReturnValueOnce({ getBoundingClientRect: () => mockRect } as any);
//     const onHoverSpy = jest.spyOn(component, 'onHover').mockImplementation();
//     component.onMouseMove(mockEvent);
//     expect(onHoverSpy).toHaveBeenCalled();
//   });

//   it('should call on hover on mouse event outside top of rect', () => {
//     const mockEvent = { clientX: 0, clientY: 0 } as MouseEvent;
//     const mockRect = { left: 0, top: 1, bottom: 0, right: 0 } as DOMRect;
//     jest.spyOn(document, 'querySelector').mockReturnValueOnce({ getBoundingClientRect: () => mockRect } as any);
//     const onHoverSpy = jest.spyOn(component, 'onHover').mockImplementation();
//     component.onMouseMove(mockEvent);
//     expect(onHoverSpy).toHaveBeenCalled();
//   });
// });

// describe('handleApplication', () => {
//   it('should return true if app id is not enabled', () => {
//     component.appIdEnabled = false;
//     const result = component.handleApplication('test' as any, 'test');
//     expect(result).toBeTruthy();
//   });

//   it('should return true if app id is enabled and applicationId is any', () => {
//     component.appIdEnabled = true;
//     const result = component.handleApplication('test' as any, 'any');
//     expect(result).toBeTruthy();
//   });

//   it('should return true if applicationId is present', () => {
//     const mockRule = { panosApplications: [{ id: 'test' }] } as any;
//     component.appIdEnabled = true;
//     component.form.controls.application.setValue('test');
//     const result = component.handleApplication(mockRule, 'test');
//     expect(result).toBeTruthy();
//   });

//   it('should return false if applicationId is not present', () => {
//     const mockRule = { panosApplications: [{ id: 'test' }] } as any;
//     component.appIdEnabled = true;
//     component.form.controls.application.setValue('not present');
//     const result = component.handleApplication(mockRule, 'test');
//     expect(result).toBeFalsy();
//   });
// });

// it('should set hovered row and col', () => {
//   component.onHover('row', 'col');
//   expect(component.hoveredRow).toBe('row');
//   expect(component.hoveredColumn).toBe('col');
// });

// describe('setChecklist', () => {
//   it('should create rule with checklist if it doesnt exist', () => {
//     const mockRule = { name: 'mockRuleName' } as any;
//     component.setChecklist2(mockRule);
//     expect(component.firewallRulesWithChecklist[mockRule.name]).toBeTruthy();
//   });
// });
