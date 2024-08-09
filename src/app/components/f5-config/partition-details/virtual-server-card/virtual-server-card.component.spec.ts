import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualServerCardComponent } from './virtual-server-card.component';
import { ChangeDetectorRef } from '@angular/core';
import { MockFontAwesomeComponent } from '../../../../../test/mock-components';

describe('VirtualServerCardComponent', () => {
  let component: VirtualServerCardComponent;
  let fixture: ComponentFixture<VirtualServerCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualServerCardComponent, MockFontAwesomeComponent],
      providers: [{ provide: ChangeDetectorRef, useValue: jest.fn() }],
    });

    fixture = TestBed.createComponent(VirtualServerCardComponent);
    component = fixture.componentInstance;

    component.virtualServer = {
      name: 'TestServer',
      destination: '/Test/192.168.1.1:80',
      poolReference: {
        items: {
          name: 'TestPool',
          membersReference: {
            items: [{ id: 1, name: 'Member1' }],
          },
        },
        stats: {
          nestedStats: {
            entries: {
              'status.availabilityState': { description: 'available' },
              'status.enabledState': { description: 'enabled' },
            },
          },
        },
      },
      certsReference: [
        { name: 'Cert1', expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24, inUse: true }, // expires in 1 day, in use
        { name: 'Cert2', expirationDate: Math.floor(Date.now() / 1000) - 60 * 60 * 24, inUse: true }, // expired, in use
        { name: 'Cert3', expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60, inUse: true }, // expires in 60 days, in use
        { name: 'Cert4', expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 2, inUse: false },
      ],
    };

    jest.spyOn(component, 'getStatusClass');
    jest.spyOn(component, 'getVirtualServerTableData');
    jest.spyOn(component, 'getPoolTableData');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize properties correctly', () => {
    expect(component.virtualServerName).toEqual('TestServer');
    expect(component.virtualServerAddress).toEqual('192.168.1.1:80');
    expect(component.poolName).toEqual('TestPool');
    expect(component.members).toEqual([{ id: 1, name: 'Member1' }]);
    expect(component.getStatusClass).toHaveBeenCalled();
    expect(component.getVirtualServerTableData).toHaveBeenCalledWith(component.virtualServer);
    expect(component.getPoolTableData).toHaveBeenCalledWith(component.virtualServer.poolReference.stats.nestedStats.entries);
  });

  describe('checkCertificateExpiry', () => {
    it('should correctly identify expired and soon-to-expire certificates', () => {
      component.checkCertificateExpiry();
      expect(component.certStatusList.length).toBe(4); // 4 certificates should be processed

      const cert1 = component.certStatusList.find(cert => cert.name === 'Cert1');
      expect(cert1.isExpired).toBe(false);
      expect(cert1.isExpiringSoon).toBe(true);
      expect(cert1.timeString).toContain('23 hours');

      const cert2 = component.certStatusList.find(cert => cert.name === 'Cert2');
      expect(cert2.isExpired).toBe(true);
      expect(cert2.isExpiringSoon).toBe(false);
      expect(cert2.timeString).toContain('12 months, 3 days');

      const cert3 = component.certStatusList.find(cert => cert.name === 'Cert3');
      expect(cert3.isExpired).toBe(false);
      expect(cert3.isExpiringSoon).toBe(false);
      expect(cert3.timeString).toContain('1 month, 29 days');

      const cert4 = component.certStatusList.find(cert => cert.name === 'Cert4');
      expect(cert4.isExpired).toBe(false);
      expect(cert4.isExpiringSoon).toBe(false);
      expect(cert4.timeString).toContain('1 year, 12 months, 4 days');
    });

    it('should include all certificates', () => {
      component.checkCertificateExpiry();
      expect(component.certStatusList.length).toBe(4);
    });

    it('should handle cases where certsReference is not defined', () => {
      (component.virtualServer as any).certsReference = undefined;
      component.checkCertificateExpiry();
      expect(component.certStatusList.length).toBe(0);
    });
  });

  it('should toggle expanded', () => {
    component.expandedChange = { emit: jest.fn() } as any;
    component.toggleExpanded();
    expect(component.expanded).toBeTruthy();
  });

  describe('getStatusClass', () => {
    it('should return "text-success" when availablityState is "available" and enabledState is "enabled"', () => {
      const result = component.getStatusClass({ description: 'available' }, { description: 'enabled' });
      expect(result).toEqual('text-success');
    });

    it('should return "text-dark" when availablityState is "available" and enabledState is "disabled"', () => {
      const result = component.getStatusClass({ description: 'available' }, { description: 'disabled' });
      expect(result).toEqual('text-dark');
    });

    it('should return "text-danger" when availablityState is "offline"', () => {
      const result = component.getStatusClass({ description: 'offline' }, { description: 'anyValue' });
      expect(result).toEqual('text-danger');
    });

    it('should return "text-primary" for all other conditions', () => {
      // Test with both undefined
      let result = component.getStatusClass();
      expect(result).toEqual('text-primary');

      // Test with one undefined and one with a non-matching description
      result = component.getStatusClass(undefined, { description: 'anyOtherState' });
      expect(result).toEqual('text-primary');

      // Test with both having non-matching descriptions
      result = component.getStatusClass({ description: 'anyOtherState' }, { description: 'anyOtherState' });
      expect(result).toEqual('text-primary');
    });
  });

  describe('getVirtualServerTableData', () => {
    // Mock the conversion methods
    beforeEach(() => {
      jest.spyOn(component, 'convertBitsToHighestUnit').mockImplementation(input => `ConvertedBits-${input}`);
      jest.spyOn(component, 'convertToHighestDenominator').mockImplementation(input => `Converted-${input}`);
    });

    it('should process fully populated stats correctly', () => {
      const virtualServer = {
        stats: {
          nestedStats: {
            entries: {
              'clientside.bitsIn': { value: 1000 },
              'clientside.bitsOut': { value: 2000 },
              'clientside.pktsIn': { value: 300 },
              'clientside.pktsOut': { value: 400 },
              'clientside.curConns': { value: 50 },
              'clientside.maxConns': { value: 75 },
              'clientside.totConns': { value: 150 },
              totRequests: { value: 250 },
              fiveSecAvgUsageRatio: { value: 5 },
              fiveMinAvgUsageRatio: { value: 10 },
              oneMinAvgUsageRatio: { value: 15 },
            },
          },
        },
      };

      const expected = {
        bitsIn: 'ConvertedBits-1000',
        bitsOut: 'ConvertedBits-2000',
        packetsIn: 'Converted-300',
        packetsOut: 'Converted-400',
        currentConnections: 'Converted-50',
        maxConnections: 'Converted-75',
        totalConnections: 'Converted-150',
        totalRequests: 'Converted-250',
        fiveSecAvgUsageRatio: '5%',
        fiveMinAvgUsageRatio: '10%',
        oneMinAvgUsageRatio: '15%',
      };

      const result = component.getVirtualServerTableData(virtualServer);
      expect(result).toEqual(expected);
      expect(component.convertBitsToHighestUnit).toHaveBeenCalledTimes(2);
      expect(component.convertToHighestDenominator).toHaveBeenCalledTimes(6);
    });

    it('should handle missing stats gracefully', () => {
      const virtualServer = {}; // Empty object simulates missing stats

      const expected = {
        bitsIn: 'ConvertedBits-undefined',
        bitsOut: 'ConvertedBits-undefined',
        packetsIn: 'Converted-undefined',
        packetsOut: 'Converted-undefined',
        currentConnections: 'Converted-undefined',
        maxConnections: 'Converted-undefined',
        totalConnections: 'Converted-undefined',
        totalRequests: 'Converted-undefined',
        fiveSecAvgUsageRatio: 'undefined%',
        fiveMinAvgUsageRatio: 'undefined%',
        oneMinAvgUsageRatio: 'undefined%',
      };

      const result = component.getVirtualServerTableData(virtualServer);
      expect(result).toEqual(expected);
    });
  });

  describe('convertBitsToHighestUnit', () => {
    it('should handle undefined or null by converting it to "0bits"', () => {
      expect(component.convertBitsToHighestUnit(undefined)).toEqual('0bits');
      expect(component.convertBitsToHighestUnit(null)).toEqual('0bits');
    });

    it('should convert bits to bytes correctly', () => {
      expect(component.convertBitsToHighestUnit(8)).toEqual('1bytes');
      expect(component.convertBitsToHighestUnit(16)).toEqual('2bytes');
    });

    it('should convert bits to KB correctly', () => {
      expect(component.convertBitsToHighestUnit(1024 * 8)).toEqual('1KB');
      expect(component.convertBitsToHighestUnit(2048 * 8)).toEqual('2KB');
    });

    it('should convert bits to MB correctly', () => {
      expect(component.convertBitsToHighestUnit(1024 * 1024 * 8)).toEqual('1MB');
    });

    it('should convert bits to GB correctly', () => {
      expect(component.convertBitsToHighestUnit(1024 * 1024 * 1024 * 8)).toEqual('1GB');
    });

    it('should convert bits to TB correctly', () => {
      expect(component.convertBitsToHighestUnit(1024 * 1024 * 1024 * 1024 * 8)).toEqual('1TB');
    });

    it('should convert bits to PB correctly', () => {
      expect(component.convertBitsToHighestUnit(1024 * 1024 * 1024 * 1024 * 1024 * 8)).toEqual('1PB');
    });

    it('should handle values at the boundary of unit conversion', () => {
      expect(component.convertBitsToHighestUnit(7)).toEqual('7bits');
      expect(component.convertBitsToHighestUnit(1023 * 8)).toEqual('1023bytes');
      expect(component.convertBitsToHighestUnit(1024 * 1024 * 8 - 1)).toEqual('1024KB');
    });
  });

  describe('convertToHighestDenominator', () => {
    it('should handle undefined or null by converting it to "0"', () => {
      expect(component.convertToHighestDenominator(undefined)).toEqual('0');
      expect(component.convertToHighestDenominator(null)).toEqual('0');
    });

    it('should return the value as-is for values under 1000', () => {
      expect(component.convertToHighestDenominator(999)).toEqual('999');
      expect(component.convertToHighestDenominator(1)).toEqual('1');
      expect(component.convertToHighestDenominator(0.5)).toEqual('0.5');
    });

    // Test each denomination boundary and just below the boundary
    const testValues = [
      { value: 1000, expected: '1K' },
      { value: 999999, expected: '1000K' },
      { value: 1000000, expected: '1M' },
      { value: 999999999, expected: '1000M' },
      { value: 1000000000, expected: '1B' },
      { value: 999999999999, expected: '1000B' },
      { value: 1000000000000, expected: '1T' },
      { value: 999999999999999, expected: '1000T' },
      { value: 1000000000000000, expected: '1P' },
      { value: 1000000000000000000, expected: '1E' },
      // Assuming the function does not support denominations beyond 'E'
    ];

    testValues.forEach(({ value, expected }) => {
      it(`should convert ${value} to ${expected}`, () => {
        expect(component.convertToHighestDenominator(value)).toEqual(expected);
      });
    });

    it('should handle values just below denomination boundaries correctly', () => {
      expect(component.convertToHighestDenominator(999.99)).toEqual('999.99');
      expect(component.convertToHighestDenominator(999999.99)).toEqual('1000K');
      expect(component.convertToHighestDenominator(999999999.99)).toEqual('1000M');
    });
  });
});
